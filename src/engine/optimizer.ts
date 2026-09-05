/**
 * Pareto Frontier & Deal Ranking Optimizer
 * Reference: Section 18-19 PRODUCT_SPEC.md & Section 24-28 DECISION_ENGINE_SPEC.md
 */

import type {
  CanonicalDeal,
  BuyerPolicy,
  SellerPolicy,
  SupplierFacts,
  ScoredDeal,
  RecommendationCategory,
} from '../types/index.ts';
import { validateHardConstraints } from './constraints.ts';
import { calculateBuyerEconomics, calculateSellerEconomics } from './economics.ts';
import { calculateBuyerUtility, calculateSellerUtility, calculateBalancedScore } from './utility.ts';

/**
 * Scores and evaluates a single canonical deal
 */
export function scoreDeal(
  deal: CanonicalDeal,
  buyerPolicy: BuyerPolicy,
  sellerPolicy: SellerPolicy,
  supplierFacts: SupplierFacts,
  coordinationCost: number = 0
): ScoredDeal {
  const validation = validateHardConstraints(deal, buyerPolicy, sellerPolicy, supplierFacts);

  const buyerEcon = calculateBuyerEconomics(deal, buyerPolicy);
  const sellerEcon = calculateSellerEconomics(deal, sellerPolicy);

  const buyerUtility = calculateBuyerUtility(deal, buyerPolicy, buyerEcon, supplierFacts);
  const sellerUtility = calculateSellerUtility(deal, sellerPolicy, sellerEcon);

  // Simple risk score calculation based on supplier reliability & payment terms
  let riskScore = 1.0 - supplierFacts.reliabilityScore;
  if (deal.paymentTerms === '60_days') riskScore += 0.1;

  const balancedScore = calculateBalancedScore(buyerUtility, sellerUtility, riskScore, coordinationCost);

  return {
    deal,
    buyerUtility,
    sellerUtility,
    balancedScore,
    sellerMargin: sellerEcon.grossMargin,
    totalBuyerCost: buyerEcon.totalLandedCost,
    totalSellerRevenue: sellerEcon.grossRevenue,
    riskScore,
    coordinationCost,
    isFeasible: validation.passed,
    rejectionReasons: validation.reasons,
  };
}

/**
 * Checks if deal A dominates deal B (Pareto Dominance)
 * Deal A dominates B if A is at least as good in all utilities and strictly better in at least one.
 */
export function dominates(a: ScoredDeal, b: ScoredDeal): boolean {
  if (!a.isFeasible || !b.isFeasible) return false;

  const buyerBetterOrEqual = a.buyerUtility >= b.buyerUtility - 1e-6;
  const sellerBetterOrEqual = a.sellerUtility >= b.sellerUtility - 1e-6;

  const buyerStrictlyBetter = a.buyerUtility > b.buyerUtility + 1e-4;
  const sellerStrictlyBetter = a.sellerUtility > b.sellerUtility + 1e-4;

  return buyerBetterOrEqual && sellerBetterOrEqual && (buyerStrictlyBetter || sellerStrictlyBetter);
}

/**
 * Filters a list of scored deals down to the Pareto Frontier (non-dominated set)
 */
export function findParetoFrontier(scoredDeals: ScoredDeal[]): ScoredDeal[] {
  const feasibleDeals = scoredDeals.filter((d) => d.isFeasible);
  const frontier: ScoredDeal[] = [];

  for (const d of feasibleDeals) {
    let isDominated = false;
    for (const other of feasibleDeals) {
      if (other !== d && dominates(other, d)) {
        isDominated = true;
        break;
      }
    }
    if (!isDominated) {
      frontier.push(d);
    }
  }

  return frontier;
}

/**
 * Ranks deals and assigns recommendation labels
 */
export function rankAndCategorizeDeals(
  paretoDeals: ScoredDeal[]
): Record<RecommendationCategory, ScoredDeal | undefined> {
  if (paretoDeals.length === 0) {
    return {
      BEST_BUYER: undefined,
      BEST_SELLER: undefined,
      BEST_BALANCED: undefined,
      LOWEST_RISK: undefined,
      BEST_LONG_TERM: undefined,
    };
  }

  // Sort copies by respective criteria
  const bestBuyer = [...paretoDeals].sort((a, b) => b.buyerUtility - a.buyerUtility)[0];
  const bestSeller = [...paretoDeals].sort((a, b) => b.sellerUtility - a.sellerUtility)[0];
  const bestBalanced = [...paretoDeals].sort((a, b) => b.balancedScore - a.balancedScore)[0];
  const lowestRisk = [...paretoDeals].sort((a, b) => a.riskScore - b.riskScore)[0];
  const bestLongTerm = [...paretoDeals].sort(
    (a, b) => (b.deal.contractMonths ?? 1) - (a.deal.contractMonths ?? 1)
  )[0];

  if (bestBuyer) bestBuyer.recommendationCategory = 'BEST_BUYER';
  if (bestSeller) bestSeller.recommendationCategory = 'BEST_SELLER';
  if (bestBalanced) bestBalanced.recommendationCategory = 'BEST_BALANCED';
  if (lowestRisk) lowestRisk.recommendationCategory = 'LOWEST_RISK';
  if (bestLongTerm) bestLongTerm.recommendationCategory = 'BEST_LONG_TERM';

  return {
    BEST_BUYER: bestBuyer,
    BEST_SELLER: bestSeller,
    BEST_BALANCED: bestBalanced,
    LOWEST_RISK: lowestRisk,
    BEST_LONG_TERM: bestLongTerm,
  };
}
