/**
 * Reservation Value Engine & No-Deal Certificate Generator
 * Reference: Section 13 PRODUCT_SPEC.md & Section 11-13, 47 DECISION_ENGINE_SPEC.md & Scenario 08
 */

import type {
  CanonicalDeal,
  BuyerPolicy,
  SellerPolicy,
  NoDealCertificate,
} from '../types/index.ts';
import { calculateSellerEconomics } from './economics.ts';

/**
 * Calculates Buyer Reservation Value (Budget ceiling & max acceptable landed cost)
 */
export function calculateBuyerReservationValue(buyerPolicy: BuyerPolicy): number {
  return buyerPolicy.maxTotalBudget;
}

/**
 * Calculates Seller Reservation Value (Minimum acceptable revenue for a specific deal context)
 */
export function calculateSellerReservationValue(
  deal: CanonicalDeal,
  sellerPolicy: SellerPolicy
): number {
  const econ = calculateSellerEconomics(deal, sellerPolicy);
  return econ.minRequiredRevenue;
}

/**
 * Checks if feasible region between Buyer Reservation Value and Seller Reservation Value exists
 */
export function checkReservationOverlap(
  buyerMaxPricePerUnit: number,
  sellerMinPricePerUnit: number
): { overlap: boolean; gap: number } {
  const gap = sellerMinPricePerUnit - buyerMaxPricePerUnit;
  return {
    overlap: gap <= 0,
    gap: Math.max(0, gap),
  };
}

/**
 * Generates a deterministic No-Deal Certificate when negotiations fail or reservation values do not overlap
 */
export function generateNoDealCertificate(
  buyerCeiling: number,
  sellerFloor: number,
  testedAlternativesCount: number = 0,
  additionalReason?: string
): NoDealCertificate {
  const gap = Math.max(0, sellerFloor - buyerCeiling);
  const gapClosingVariables = [
    'quantity',
    'payment timing',
    'delivery',
    'specification',
    'contract duration',
  ];

  return {
    status: 'NO_DEAL',
    buyerCeiling,
    sellerFloor,
    gap,
    testedAlternativesCount,
    gapClosingVariables,
    reason:
      additionalReason ??
      `No feasible deal exists: Buyer ceiling is ₹${buyerCeiling.toLocaleString()}, Seller floor is ₹${sellerFloor.toLocaleString()} (gap: ₹${gap.toLocaleString()}).`,
  };
}
