/**
 * Hard and Soft Constraint Validation Engine
 * Reference: Section 3 & Section 49 DECISION_ENGINE_SPEC.md
 * 
 * Rules:
 * - If a hard constraint fails: deal_status = INFEASIBLE. No utility score can rescue it.
 * - Unknown mandatory field: candidate enters NEEDS_INFORMATION / UNKNOWN state. Unknown != false, Unknown != true.
 */

import type {
  CanonicalDeal,
  BuyerPolicy,
  SellerPolicy,
  SupplierFacts,
  HardConstraintResult,
  ValidationMatrix,
} from '../types/index.ts';
import { calculateSellerEconomics, calculateBuyerEconomics } from './economics.ts';

export function validateHardConstraints(
  deal: CanonicalDeal,
  buyerPolicy: BuyerPolicy,
  sellerPolicy: SellerPolicy,
  supplierFacts: SupplierFacts
): HardConstraintResult {
  const reasons: string[] = [];
  const missingFields: string[] = [];
  let requiresInformation = false;
  let requiresHumanReview = false;

  const matrix: ValidationMatrix = {
    price: 'PASS',
    margin: 'PASS',
    inventory: 'PASS',
    delivery: 'PASS',
    payment: 'PASS',
    policy: 'PASS',
    authority: 'PASS',
    substitution: 'PASS',
    certification: 'PASS',
  };

  // 1. Calculate Economics
  const sellerEcon = calculateSellerEconomics(deal, sellerPolicy);
  const buyerEcon = calculateBuyerEconomics(deal, buyerPolicy);

  // 2. Buyer Budget Constraint (Hard)
  if (buyerEcon.totalLandedCost > buyerPolicy.maxTotalBudget) {
    matrix.price = 'FAIL';
    reasons.push(
      `Buyer total landed cost ₹${buyerEcon.totalLandedCost} exceeds max budget ₹${buyerPolicy.maxTotalBudget}`
    );
  }

  // 3. Buyer Max Unit Price Constraint (Hard, if specified)
  if (buyerPolicy.maxUnitPrice) {
    for (const item of deal.items) {
      if (item.unitPrice > buyerPolicy.maxUnitPrice) {
        matrix.price = 'FAIL';
        reasons.push(
          `Unit price ₹${item.unitPrice} for ${item.productId} exceeds max unit price ₹${buyerPolicy.maxUnitPrice}`
        );
      }
    }
  }

  // 4. Seller Minimum Margin Constraint (Hard)
  if (!sellerEcon.isValidMargin) {
    matrix.margin = 'FAIL';
    reasons.push(
      `Seller margin ${ (sellerEcon.grossMargin * 100).toFixed(2) }% is below required minimum ${ (sellerPolicy.minMargin * 100).toFixed(2) }% (BELOW_SELLER_FLOOR)`
    );
  }

  // 5. Inventory Constraint (Hard)
  for (const item of deal.items) {
    const productConfig = sellerPolicy.products[item.productId];
    if (!productConfig) {
      matrix.inventory = 'FAIL';
      reasons.push(`Product ${item.productId} not found in seller catalog`);
    } else if (item.quantity > productConfig.availableInventory) {
      matrix.inventory = 'FAIL';
      reasons.push(
        `Requested quantity ${item.quantity} exceeds available inventory ${productConfig.availableInventory}`
      );
    }
  }

  // 6. Minimum Order Quantity (Hard, if specified)
  if (sellerPolicy.minOrderQuantity) {
    const totalQty = deal.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQty < sellerPolicy.minOrderQuantity) {
      matrix.policy = 'FAIL';
      reasons.push(
        `Total deal quantity ${totalQty} is below seller minimum order quantity ${sellerPolicy.minOrderQuantity}`
      );
    }
  }

  // 7. Delivery Deadline Constraint (Hard)
  if (deal.deliveryDays > buyerPolicy.latestAcceptableDeliveryDays) {
    matrix.delivery = 'FAIL';
    reasons.push(
      `Delivery time of ${deal.deliveryDays} days exceeds latest acceptable limit of ${buyerPolicy.latestAcceptableDeliveryDays} days`
    );
  }

  // 8. Supplier Reliability Constraint (Hard)
  if (supplierFacts.reliabilityScore < buyerPolicy.minSupplierReliability) {
    matrix.policy = 'FAIL';
    reasons.push(
      `Supplier reliability ${supplierFacts.reliabilityScore} is below buyer minimum threshold ${buyerPolicy.minSupplierReliability}`
    );
  }

  // 9. Required Certification Constraint (Hard / Unknown handling)
  if (buyerPolicy.requiredCertification) {
    if (supplierFacts.certificationAvailable === 'UNKNOWN' || supplierFacts.certificationAvailable === undefined) {
      matrix.certification = 'UNKNOWN';
      requiresInformation = true;
      missingFields.push('certificationStatus');
      reasons.push(`Required certification status is UNKNOWN for supplier ${supplierFacts.supplierId}`);
    } else if (supplierFacts.certificationAvailable === false) {
      matrix.certification = 'FAIL';
      reasons.push(`Required certification is missing for supplier ${supplierFacts.supplierId}`);
    }
  }

  // 10. Payment Terms Acceptance
  if (
    buyerPolicy.acceptablePaymentTerms &&
    buyerPolicy.acceptablePaymentTerms.length > 0 &&
    !buyerPolicy.acceptablePaymentTerms.includes(deal.paymentTerms)
  ) {
    matrix.payment = 'FAIL';
    reasons.push(
      `Payment terms '${deal.paymentTerms}' not in buyer acceptable terms: [${buyerPolicy.acceptablePaymentTerms.join(', ')}]`
    );
  }

  // 11. Human Authority Limits (Escalation trigger)
  if (
    sellerPolicy.humanApprovalRequiredAbove &&
    sellerEcon.grossRevenue > sellerPolicy.humanApprovalRequiredAbove
  ) {
    matrix.authority = 'REVIEW';
    requiresHumanReview = true;
  }

  if (
    buyerPolicy.humanApprovalThreshold &&
    buyerEcon.totalLandedCost > buyerPolicy.humanApprovalThreshold
  ) {
    matrix.authority = 'REVIEW';
    requiresHumanReview = true;
  }

  const passed = matrix.price !== 'FAIL' &&
    matrix.margin !== 'FAIL' &&
    matrix.inventory !== 'FAIL' &&
    matrix.delivery !== 'FAIL' &&
    matrix.payment !== 'FAIL' &&
    matrix.policy !== 'FAIL' &&
    matrix.certification !== 'FAIL';

  return {
    passed,
    reasons,
    matrix,
    requiresInformation,
    requiresHumanReview,
    missingFields,
  };
}
