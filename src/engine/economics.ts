/**
 * Buyer and Seller Economics Engine
 * Reference: Section 11-12 PRODUCT_SPEC.md & Section 9-10, 33-34 DECISION_ENGINE_SPEC.md
 */

import type {
  CanonicalDeal,
  BuyerPolicy,
  SellerPolicy,
  SellerEconomicsResult,
  BuyerEconomicsResult,
} from '../types/index.ts';

/**
 * Calculates Seller Economics for a canonical deal
 */
export function calculateSellerEconomics(
  deal: CanonicalDeal,
  sellerPolicy: SellerPolicy
): SellerEconomicsResult {
  let grossRevenue = 0;
  let baseProductCostTotal = 0;

  for (const item of deal.items) {
    const revenue = item.quantity * item.unitPrice;
    grossRevenue += revenue;

    const productConfig = sellerPolicy.products[item.productId];
    const unitCost = item.productCost ?? (productConfig ? productConfig.productCost : 0);
    const operatingCost = sellerPolicy.operatingCostPerUnit ?? 0;
    baseProductCostTotal += item.quantity * (unitCost + operatingCost);
  }

  const logisticsCost = sellerPolicy.logisticsCostPerOrder ?? 0;
  const expediteCost = deal.expeditedDelivery ? (sellerPolicy.expediteCostPerOrder ?? 0) : 0;
  const paymentCostRate = sellerPolicy.paymentCostRate ?? 0;
  const paymentCost = grossRevenue * paymentCostRate;

  const totalCost = baseProductCostTotal + logisticsCost + expediteCost + paymentCost;
  const grossProfit = grossRevenue - totalCost;
  const grossMargin = grossRevenue > 0 ? grossProfit / grossRevenue : 0;

  // Minimum required revenue to achieve sellerPolicy.minMargin
  // Revenue * (1 - minMargin - paymentCostRate) >= BaseCost
  const netMarginDenominator = 1 - sellerPolicy.minMargin - paymentCostRate;
  const baseCostNoPayment = baseProductCostTotal + logisticsCost + expediteCost;
  const minRequiredRevenue = netMarginDenominator > 0
    ? baseCostNoPayment / netMarginDenominator
    : baseCostNoPayment / (1 - sellerPolicy.minMargin);

  const isValidMargin = grossRevenue > 0 && grossMargin >= (sellerPolicy.minMargin - 1e-6);

  return {
    grossRevenue,
    totalCost,
    variableCost: totalCost,
    grossProfit,
    grossMargin,
    minRequiredRevenue,
    isValidMargin,
  };
}

/**
 * Calculates Buyer Total Landed Cost and components
 */
export function calculateBuyerEconomics(
  deal: CanonicalDeal,
  buyerPolicy: BuyerPolicy
): BuyerEconomicsResult {
  let productPriceTotal = 0;
  for (const item of deal.items) {
    productPriceTotal += item.quantity * item.unitPrice;
  }

  const shippingCost = deal.shippingCost ?? 0;
  const taxes = 0; // Tax can be added if required
  const installationCost = deal.installationCost ?? 0;

  // Payment Financing Cost calculation
  // E.g., if payment is upfront (0 days) vs 30_days, or cost of capital calculation
  let financingCost = 0;
  if (buyerPolicy.annualCostOfCapital && deal.paymentTerms === 'upfront') {
    // Financing cost for paying early (30 days earlier than standard 30_days)
    const daysAccelerated = 30;
    financingCost = productPriceTotal * buyerPolicy.annualCostOfCapital * (daysAccelerated / 365);
  }

  // Expected Delay Cost
  let expectedDelayCost = 0;
  if (deal.expeditedDelivery) {
    expectedDelayCost = 0;
  } else {
    const delayCostIfUnexpedited = buyerPolicy.expectedDelayCostIfUnexpedited ?? 0;
    const prefDays = buyerPolicy.preferredDeliveryDays ?? buyerPolicy.requiredDeliveryDays;
    const extraDays = Math.max(0, deal.deliveryDays - prefDays);
    const costPerDay = buyerPolicy.delayCostPerDay ?? 0;
    expectedDelayCost = delayCostIfUnexpedited + extraDays * costPerDay;
  }

  const expectedFailureCost = 0; // Can be modeled if failure rate is present

  const totalLandedCost =
    productPriceTotal +
    shippingCost +
    taxes +
    installationCost +
    financingCost +
    expectedDelayCost +
    expectedFailureCost;

  const withinBudget = totalLandedCost <= buyerPolicy.maxTotalBudget;

  return {
    productPriceTotal,
    shippingCost,
    taxes,
    installationCost,
    financingCost,
    expectedDelayCost,
    expectedFailureCost,
    totalLandedCost,
    withinBudget,
  };
}

/**
 * Calculates Financing Value / Benefit for Early Payment from Seller or Buyer perspective
 * Ref: Scenario 06 & Section 33 DECISION_ENGINE_SPEC
 */
export function calculatePaymentFinancingValue(
  amount: number,
  annualCostOfCapital: number,
  daysAccelerated: number
): number {
  return (amount * annualCostOfCapital * daysAccelerated) / 365;
}
