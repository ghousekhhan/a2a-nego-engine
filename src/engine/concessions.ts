/**
 * Give/Get Concession Engine
 * Reference: Section 15-16 PRODUCT_SPEC.md & Section 14-20 DECISION_ENGINE_SPEC.md
 */

import type { CanonicalDeal, SellerPolicy } from '../types/index.ts';
import { calculatePaymentFinancingValue, calculateSellerEconomics } from './economics.ts';

export interface ConcessionEvaluation {
  concessionCost: number;
  concessionBenefit: number;
  netConcessionValue: number;
  isWorthwhile: boolean;
  explanation: string;
}

/**
 * Evaluates whether a proposed concession (Give -> Get) is economically justified for the seller
 */
export function evaluateSellerConcession(
  currentDeal: CanonicalDeal,
  proposedDeal: CanonicalDeal,
  sellerPolicy: SellerPolicy,
  safetyFactor: number = 1.0
): ConcessionEvaluation {
  const currentEcon = calculateSellerEconomics(currentDeal, sellerPolicy);
  const proposedEcon = calculateSellerEconomics(proposedDeal, sellerPolicy);

  const currentQty = currentDeal.items.reduce((s, i) => s + i.quantity, 0);
  const proposedQty = proposedDeal.items.reduce((s, i) => s + i.quantity, 0);

  const currentAvgPrice = currentQty > 0 ? currentEcon.grossRevenue / currentQty : 0;
  const proposedAvgPrice = proposedQty > 0 ? proposedEcon.grossRevenue / proposedQty : 0;

  // Direct Revenue Cost given (if unit price decreased)
  let concessionCost = 0;
  if (proposedAvgPrice < currentAvgPrice) {
    concessionCost = (currentAvgPrice - proposedAvgPrice) * proposedQty;
  }

  // Economic Benefits received (Get)
  // Benefit = (Proposed Gross Profit - Current Gross Profit) + Concession Cost
  let concessionBenefit = Math.max(0, proposedEcon.grossProfit - currentEcon.grossProfit) + concessionCost;

  // Additional non-revenue benefits (financing, contract duration)
  if (currentDeal.paymentTerms !== 'upfront' && proposedDeal.paymentTerms === 'upfront') {
    const costOfCapital = sellerPolicy.annualCostOfCapital ?? 0.12;
    const financingValue = calculatePaymentFinancingValue(
      proposedEcon.grossRevenue,
      costOfCapital,
      30
    );
    concessionBenefit += financingValue;
  }

  if ((proposedDeal.contractMonths ?? 1) > (currentDeal.contractMonths ?? 1)) {
    const extraMonths = (proposedDeal.contractMonths ?? 1) - (currentDeal.contractMonths ?? 1);
    const monthlyMargin = proposedEcon.grossProfit;
    const contractLtvBenefit = monthlyMargin * extraMonths * 0.5;
    concessionBenefit += contractLtvBenefit;
  }

  const netConcessionValue = concessionBenefit - concessionCost;
  const isWorthwhile = concessionBenefit >= concessionCost * safetyFactor && proposedEcon.isValidMargin;

  let explanation = '';
  if (proposedQty > currentQty && proposedAvgPrice < currentAvgPrice) {
    explanation = `Price reduced from ₹${currentAvgPrice.toFixed(0)} to ₹${proposedAvgPrice.toFixed(0)} in exchange for higher quantity (${currentQty} -> ${proposedQty} units). Additional contribution: ₹${concessionBenefit.toFixed(0)}, Concession cost: ₹${concessionCost.toFixed(0)}.`;
  } else if (proposedDeal.paymentTerms === 'upfront' && currentDeal.paymentTerms !== 'upfront') {
    explanation = `Discount offered in exchange for upfront payment financing value (₹${concessionBenefit.toFixed(0)}).`;
  } else {
    explanation = `Concession net value: ₹${netConcessionValue.toFixed(0)}. Benefit: ₹${concessionBenefit.toFixed(0)}, Cost: ₹${concessionCost.toFixed(0)}.`;
  }

  return {
    concessionCost,
    concessionBenefit,
    netConcessionValue,
    isWorthwhile,
    explanation,
  };
}

/**
 * Returns max allowed discount for a given round based on progressive concession curve
 */
export function getProgressiveMaxDiscount(
  round: number,
  maxAllowedDiscount: number = 0.08
): number {
  // Round 1 -> 25% of max, Round 2 -> 50%, Round 3 -> 75%, Round 4+ -> 100%
  const stepRatio = Math.min(1.0, round * 0.25);
  return maxAllowedDiscount * stepRatio;
}
