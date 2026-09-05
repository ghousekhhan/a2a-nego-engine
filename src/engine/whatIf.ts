/**
 * What-If Recommendation Engine
 * Reference: Section 25-26 PRODUCT_SPEC.md & Section 60-62 DECISION_ENGINE_SPEC.md
 * 
 * Fixes & Rules:
 * - Problem 2: When query specifies quantity (e.g. 600), candidate deals are filtered/scoped strictly
 *   to quantity === query.quantity so the what-if result evaluates that exact requested quantity.
 * - Problem 3: Target budget changes exceeding maximum authorized budget ceiling (maxTotalBudget)
 *   are marked REQUIRES_APPROVAL / BLOCKED and NEVER recommended as executable actions.
 */

import type {
  CanonicalDeal,
  BuyerPolicy,
  SellerPolicy,
  SupplierFacts,
  WhatIfQuery,
  WhatIfResult,
  ScoredDeal,
} from '../types/index.ts';
import { generateSingleSupplierCandidates } from './candidates.ts';
import { scoreDeal, findParetoFrontier, rankAndCategorizeDeals } from './optimizer.ts';

export function runWhatIfAnalysis(
  query: WhatIfQuery,
  baselineDeal: CanonicalDeal,
  buyerPolicy: BuyerPolicy,
  sellerPolicy: SellerPolicy,
  supplierFacts: SupplierFacts
): WhatIfResult {
  // 1. Score baseline deal with original policy
  const baselineScored = scoreDeal(baselineDeal, buyerPolicy, sellerPolicy, supplierFacts);

  // 2. Clone and modify buyer policy according to What-If query
  const targetQuantity = query.quantity ?? baselineDeal.items[0]?.quantity ?? buyerPolicy.requiredQuantity;
  const targetMaxBudget = query.maxTotalBudget ?? buyerPolicy.maxTotalBudget;

  const modifiedPolicy: BuyerPolicy = {
    ...buyerPolicy,
    maxTotalBudget: targetMaxBudget,
    targetTotalBudget: query.maxTotalBudget ? Math.min(query.maxTotalBudget, buyerPolicy.maxTotalBudget) : buyerPolicy.targetTotalBudget,
    requiredQuantity: targetQuantity,
    minQuantity: targetQuantity,
    preferredQuantity: targetQuantity,
    latestAcceptableDeliveryDays: query.deliveryDays ?? buyerPolicy.latestAcceptableDeliveryDays,
    substitutionAllowed: query.substitutionAllowed ?? buyerPolicy.substitutionAllowed,
  };

  // 3. Generate candidate deals under modified conditions
  const baseItem = {
    productId: baselineDeal.items[0]?.productId ?? 'item-1',
    quantity: targetQuantity,
    unitPrice: baselineDeal.items[0]?.unitPrice ?? 0,
  };

  const candidates = generateSingleSupplierCandidates(
    modifiedPolicy,
    sellerPolicy,
    supplierFacts,
    baseItem
  );

  // Problem 2 Fix: Scoped candidates strictly to targetQuantity if query.quantity was specified
  const scopedCandidates = query.quantity
    ? candidates.filter((d) => (d.items[0]?.quantity ?? 0) === query.quantity)
    : candidates;

  const scoredCandidates = (scopedCandidates.length > 0 ? scopedCandidates : candidates).map((d) =>
    scoreDeal(d, modifiedPolicy, sellerPolicy, supplierFacts)
  );

  const paretoFrontier = findParetoFrontier(scoredCandidates);
  const ranked = rankAndCategorizeDeals(paretoFrontier);

  const newBestDeal: ScoredDeal | undefined = ranked.BEST_BALANCED ?? ranked.BEST_BUYER ?? paretoFrontier[0] ?? scoredCandidates[0];

  const baselineCost = baselineScored.totalBuyerCost;
  const newCost = newBestDeal ? newBestDeal.totalBuyerCost : baselineCost;
  const priceDelta = newCost - baselineCost;

  const baselineQty = baselineDeal.items[0]?.quantity ?? 1;
  const newQty = newBestDeal ? (newBestDeal.deal.items[0]?.quantity ?? targetQuantity) : targetQuantity;

  const baselineUnitPrice = baselineDeal.items[0]?.unitPrice ?? 0;
  const newUnitPrice = newBestDeal ? (newBestDeal.deal.items[0]?.unitPrice ?? baselineUnitPrice) : baselineUnitPrice;
  const unitPriceSaving = baselineUnitPrice - newUnitPrice;

  const additionalSpend = Math.max(0, priceDelta);
  const buyerUtilityDelta = newBestDeal ? newBestDeal.buyerUtility - baselineScored.buyerUtility : 0;

  // Build trade-off explanation & check authority boundaries (Problem 3)
  let tradeoffExplanation = '';
  let recommendation = '';
  let requiresHumanApproval = false;

  // Problem 3 Fix: Check if requested budget exceeds buyer's maximum authorized budget ceiling
  const exceedsMaxAuthority = query.maxTotalBudget && query.maxTotalBudget > buyerPolicy.maxTotalBudget;

  if (exceedsMaxAuthority) {
    tradeoffExplanation = `Requested budget ₹${(query.maxTotalBudget ?? 0).toLocaleString()} exceeds maximum authorized ceiling (₹${buyerPolicy.maxTotalBudget.toLocaleString()}). Cannot be recommended as an executable action.`;
    recommendation = `WHAT-IF: BLOCKED / REQUIRES EXECUTIVE APPROVAL (Exceeds Authorized Budget Ceiling of ₹${buyerPolicy.maxTotalBudget.toLocaleString()})`;
    requiresHumanApproval = true;
  } else if (query.quantity && query.quantity > baselineQty) {
    if (unitPriceSaving > 0) {
      tradeoffExplanation = `Increasing quantity from ${baselineQty} to ${newQty} units reduces unit price by ₹${unitPriceSaving.toFixed(2)}/unit. Additional spend: ₹${additionalSpend.toLocaleString()}.`;
      recommendation = `Unit price improves to ₹${newUnitPrice.toFixed(2)}/unit, but additional spend of ₹${additionalSpend.toLocaleString()} is required.`;
    } else {
      tradeoffExplanation = `Increasing quantity to ${newQty} increases total spend by ₹${additionalSpend.toLocaleString()} without unit price discount.`;
      recommendation = `Not recommended unless expected future demand supports the extra quantity.`;
    }
  } else if (
    query.maxTotalBudget &&
    query.maxTotalBudget > (buyerPolicy.targetTotalBudget ?? buyerPolicy.maxTotalBudget)
  ) {
    const target = buyerPolicy.targetTotalBudget ?? buyerPolicy.maxTotalBudget;
    const additionalNeeded = query.maxTotalBudget - target;
    tradeoffExplanation = `Increasing target budget from ₹${target.toLocaleString()} to ₹${query.maxTotalBudget.toLocaleString()} unlocks better supplier terms (within max authority ceiling ₹${buyerPolicy.maxTotalBudget.toLocaleString()}).`;
    recommendation = `WHAT-IF: RECOMMEND INCREASING BUDGET BY ₹${additionalNeeded.toLocaleString()}`;
    requiresHumanApproval = true;
  } else {
    tradeoffExplanation = `What-if recalculation shows buyer utility change of ${buyerUtilityDelta > 0 ? '+' : ''}${buyerUtilityDelta.toFixed(3)}.`;
    recommendation = `Alternative options evaluated successfully.`;
  }

  return {
    query,
    baselineDeal: baselineScored,
    newBestDeal,
    priceDelta,
    buyerUtilityDelta,
    unitPriceSaving,
    additionalSpend,
    recommendation,
    tradeoffExplanation,
    requiresHumanApproval,
  };
}
