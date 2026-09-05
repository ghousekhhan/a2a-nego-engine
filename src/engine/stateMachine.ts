/**
 * Negotiation State Machine & Stopping Rules Engine
 * Reference: Section 21-22 PRODUCT_SPEC.md & Section 43-46 DECISION_ENGINE_SPEC.md
 */

import type {
  CanonicalDeal,
  BuyerPolicy,
  SellerPolicy,
  SupplierFacts,
  NegotiationState,
  ActionType,
  ScoredDeal,
  DecisionStatus,
} from '../types/index.ts';
import { validateHardConstraints } from './constraints.ts';
import { scoreDeal } from './optimizer.ts';

export interface NextActionDecision {
  action: ActionType;
  status: DecisionStatus;
  proposedDeal?: CanonicalDeal;
  reason: string;
  approvalRequired: boolean;
  missingFields?: string[];
}

/**
 * Checks stopping rules and evaluates the next optimal action in the negotiation loop
 */
export function evaluateNextNegotiationStep(
  state: NegotiationState,
  proposedDeal: CanonicalDeal,
  buyerPolicy: BuyerPolicy,
  sellerPolicy: SellerPolicy,
  supplierFacts: SupplierFacts
): NextActionDecision {
  // Rule 1: Validation & Constraints Check
  const validation = validateHardConstraints(proposedDeal, buyerPolicy, sellerPolicy, supplierFacts);

  // Check for Unknown / Missing mandatory information
  if (validation.requiresInformation) {
    return {
      action: 'ASK',
      status: 'NEEDS_INFORMATION',
      proposedDeal,
      reason: `Mandatory information missing: [${(validation.missingFields ?? []).join(', ')}]`,
      approvalRequired: false,
      missingFields: validation.missingFields,
    };
  }

  // Check for Hard Constraint Failures (e.g. Below seller floor, budget exceeded)
  if (!validation.passed) {
    // If it's a seller floor violation without possible adjustment, reject
    const belowSellerFloor = validation.reasons.some((r) => r.includes('BELOW_SELLER_FLOOR'));
    return {
      action: 'REJECT',
      status: 'REJECTED',
      proposedDeal,
      reason: validation.reasons.join('; '),
      approvalRequired: false,
    };
  }

  // Check for Human Authority Escalation
  if (validation.requiresHumanReview) {
    return {
      action: 'ESCALATE',
      status: 'ESCALATE',
      proposedDeal,
      reason: `Transaction amount exceeds autonomous decision authority. Human approval required.`,
      approvalRequired: true,
    };
  }

  // Score the proposed deal
  const currentScored = scoreDeal(proposedDeal, buyerPolicy, sellerPolicy, supplierFacts);

  // Rule 2: Maximum rounds reached
  if (state.round >= state.maxRounds) {
    return {
      action: 'STOP',
      status: 'STOP',
      proposedDeal,
      reason: `Maximum negotiation rounds limit (${state.maxRounds}) reached. Stopping negotiation.`,
      approvalRequired: false,
    };
  }

  // Rule 3: Marginal Improvement Stopping Rule (Section 45 DECISION_ENGINE_SPEC & Scenario 12)
  if (state.currentDeal) {
    const prevScored = scoreDeal(state.currentDeal, buyerPolicy, sellerPolicy, supplierFacts);
    const buyerGain = currentScored.buyerUtility - prevScored.buyerUtility;
    const minThreshold = state.minMeaningfulUtilityGain ?? 0.01;

    if (buyerGain >= 0 && buyerGain < minThreshold) {
      return {
        action: 'STOP',
        status: 'STOP',
        proposedDeal: state.currentDeal,
        reason: `Potential utility improvement (${buyerGain.toFixed(4)}) is below configured materiality threshold (${minThreshold}). Finalizing current deal.`,
        approvalRequired: false,
      };
    }
  }

  // If deal is completely feasible and acceptable to both parties
  return {
    action: 'ACCEPT',
    status: 'APPROVED',
    proposedDeal,
    reason: `Deal is fully feasible and satisfies all economic, operational, and policy constraints.`,
    approvalRequired: false,
  };
}
