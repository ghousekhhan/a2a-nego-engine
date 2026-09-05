/**
 * Utility Engine (Normalizations, Buyer Utility, Seller Utility, Balanced Score)
 * Reference: Section 14 PRODUCT_SPEC.md & Section 6-8, 24-25 DECISION_ENGINE_SPEC.md
 */

import type {
  CanonicalDeal,
  BuyerPolicy,
  SellerPolicy,
  SupplierFacts,
  BuyerEconomicsResult,
  SellerEconomicsResult,
} from '../types/index.ts';

/**
 * Normalizes a benefit metric (higher is better) to [0, 1]
 */
export function normalizeBenefit(x: number, min: number, max: number): number {
  if (max <= min) return x >= max ? 1 : 0;
  const val = (x - min) / (max - min);
  return Math.min(1, Math.max(0, val));
}

/**
 * Normalizes a cost metric (lower is better) to [0, 1]
 */
export function normalizeCost(x: number, min: number, max: number): number {
  if (max <= min) return x <= min ? 1 : 0;
  const val = (max - x) / (max - min);
  return Math.min(1, Math.max(0, val));
}

/**
 * Normalizes deadline metric (piecewise linear function)
 */
export function normalizeDeadline(
  actualDays: number,
  preferredDays: number,
  latestDays: number
): number {
  if (actualDays <= preferredDays) return 1.0;
  if (actualDays >= latestDays) return 0.0;
  if (latestDays <= preferredDays) return 0.0;
  return (latestDays - actualDays) / (latestDays - preferredDays);
}

/**
 * Calculates Buyer Utility (Section 7 DECISION_ENGINE_SPEC)
 */
export function calculateBuyerUtility(
  deal: CanonicalDeal,
  buyerPolicy: BuyerPolicy,
  buyerEcon: BuyerEconomicsResult,
  supplierFacts: SupplierFacts
): number {
  const w = buyerPolicy.weights;

  // Price Score (Cost metric)
  // minPossible = targetTotalBudget || 0.8 * maxBudget
  const minCostRange = buyerPolicy.targetTotalBudget ?? (buyerPolicy.maxTotalBudget * 0.7);
  const priceScore = normalizeCost(
    buyerEcon.totalLandedCost,
    minCostRange,
    buyerPolicy.maxTotalBudget
  );

  // Delivery Score (Deadline metric)
  const prefDays = buyerPolicy.preferredDeliveryDays ?? buyerPolicy.requiredDeliveryDays;
  const deliveryScore = normalizeDeadline(
    deal.deliveryDays,
    prefDays,
    buyerPolicy.latestAcceptableDeliveryDays
  );

  // Quality Score (Benefit metric)
  const qualityScore = supplierFacts.qualityScore ?? 1.0;

  // Reliability Score (Benefit metric)
  const minRel = buyerPolicy.minSupplierReliability ?? 0.5;
  const reliabilityScore = normalizeBenefit(supplierFacts.reliabilityScore, minRel, 1.0);

  // Payment Term Score
  let paymentScore = 0.5;
  if (deal.paymentTerms === '30_days' || deal.paymentTerms === '60_days') {
    paymentScore = 1.0; // Buyer prefers credit/delayed payment
  } else if (deal.paymentTerms === '15_days') {
    paymentScore = 0.7;
  } else if (deal.paymentTerms === 'upfront') {
    paymentScore = 0.4;
  }

  // Warranty Score
  let warrantyScore = 1.0;
  if (buyerPolicy.requiredWarrantyMonths && buyerPolicy.requiredWarrantyMonths > 0) {
    const warranty = deal.warrantyMonths ?? 0;
    warrantyScore = normalizeBenefit(warranty, 0, buyerPolicy.requiredWarrantyMonths * 2);
  }

  // Normalize weights sum
  const totalWeight =
    (w.price ?? 0) +
    (w.delivery ?? 0) +
    (w.quality ?? 0) +
    (w.reliability ?? 0) +
    (w.payment ?? 0) +
    (w.warranty ?? 0);

  if (totalWeight <= 0) return 0;

  const wp = (w.price ?? 0) / totalWeight;
  const wd = (w.delivery ?? 0) / totalWeight;
  const wq = (w.quality ?? 0) / totalWeight;
  const wr = (w.reliability ?? 0) / totalWeight;
  const wt = (w.payment ?? 0) / totalWeight;
  const ww = (w.warranty ?? 0) / totalWeight;

  const utility =
    wp * priceScore +
    wd * deliveryScore +
    wq * qualityScore +
    wr * reliabilityScore +
    wt * paymentScore +
    ww * warrantyScore;

  return Math.min(1.0, Math.max(0.0, utility));
}

/**
 * Calculates Seller Utility (Section 8 DECISION_ENGINE_SPEC)
 */
export function calculateSellerUtility(
  deal: CanonicalDeal,
  sellerPolicy: SellerPolicy,
  sellerEcon: SellerEconomicsResult
): number {
  const w = sellerPolicy.weights;

  // Profit Score
  const profitScore = normalizeBenefit(
    sellerEcon.grossMargin,
    sellerPolicy.minMargin,
    Math.max(sellerPolicy.targetMargin * 1.5, sellerPolicy.minMargin + 0.1)
  );

  // Volume Score
  const totalQty = deal.items.reduce((sum, item) => sum + item.quantity, 0);
  const minQty = sellerPolicy.minOrderQuantity ?? 10;
  const volumeScore = normalizeBenefit(totalQty, minQty, minQty * 5);

  // Cashflow Score (upfront is highest for seller)
  let cashflowScore = 0.4;
  if (deal.paymentTerms === 'upfront') cashflowScore = 1.0;
  else if (deal.paymentTerms === '15_days') cashflowScore = 0.7;
  else if (deal.paymentTerms === '30_days') cashflowScore = 0.4;
  else if (deal.paymentTerms === '60_days') cashflowScore = 0.1;

  // Inventory Score (if inventory pressure is high, selling more volume gives higher utility)
  let inventoryScore = 0.5;
  if (sellerPolicy.inventoryPressure === 'high') {
    inventoryScore = normalizeBenefit(totalQty, 50, 1000);
  } else if (sellerPolicy.inventoryPressure === 'medium') {
    inventoryScore = normalizeBenefit(totalQty, 10, 500);
  }

  // Customer Value Score (contract duration or long-term commitment)
  const contractMonths = deal.contractMonths ?? 1;
  const customerScore = normalizeBenefit(contractMonths, 1, 12);

  // Risk Score (0 to 1)
  let riskScore = 0.05;
  if (deal.paymentTerms === '60_days') riskScore += 0.15;
  if (deal.paymentTerms === '30_days') riskScore += 0.05;

  // Normalize positive weights sum
  const positiveWeightSum =
    (w.profit ?? 0) +
    (w.volume ?? 0) +
    (w.cashflow ?? 0) +
    (w.inventory ?? 0) +
    (w.customer ?? 0);

  if (positiveWeightSum <= 0) return 0;

  const wProfit = (w.profit ?? 0) / positiveWeightSum;
  const wVolume = (w.volume ?? 0) / positiveWeightSum;
  const wCashflow = (w.cashflow ?? 0) / positiveWeightSum;
  const wInventory = (w.inventory ?? 0) / positiveWeightSum;
  const wCustomer = (w.customer ?? 0) / positiveWeightSum;
  const wRisk = w.risk ?? 0.05;

  const baseUtility =
    wProfit * profitScore +
    wVolume * volumeScore +
    wCashflow * cashflowScore +
    wInventory * inventoryScore +
    wCustomer * customerScore -
    wRisk * riskScore;

  return Math.min(1.0, Math.max(0.0, baseUtility));
}

/**
 * Calculates Balanced Deal Score (Section 25 DECISION_ENGINE_SPEC)
 */
export function calculateBalancedScore(
  buyerUtility: number,
  sellerUtility: number,
  riskScore: number = 0,
  coordinationCost: number = 0
): number {
  const alpha = 0.45;
  const beta = 0.45;
  const gamma = 0.05;
  const delta = 0.05;

  const normCoord = Math.min(1.0, coordinationCost / 10000);

  return (
    alpha * buyerUtility +
    beta * sellerUtility -
    gamma * riskScore -
    delta * normCoord
  );
}
