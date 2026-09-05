/**
 * Buyer Agent Implementation
 * Reference: Section 7 & 50 PRODUCT_SPEC.md & Section 93 DECISION_ENGINE_SPEC.md
 * 
 * Responsibilities:
 * 1. Convert natural language request into structured buyer policy and requirement.
 * 2. Formulate shareable buyer requirement (stripping private budget/utility weights).
 * 3. Invoke Decision Engine for deal evaluation, scoring, and counter-offer selection.
 * 4. Translate Decision Engine outputs into natural language messages.
 * 5. NEVER decide prices, bypass hard constraints, or reveal max budget.
 */

import type {
  BuyerPolicy,
  CanonicalDeal,
  SellerPolicy,
  SupplierFacts,
  ScoredDeal,
  NegotiationState,
} from '../types/index.ts';
import { validateHardConstraints } from '../engine/constraints.ts';
import { scoreDeal, findParetoFrontier, rankAndCategorizeDeals } from '../engine/optimizer.ts';
import { generateSingleSupplierCandidates } from '../engine/candidates.ts';
import { generateDecisionExplanation } from '../engine/explanation.ts';

export interface ShareableBuyerRequirement {
  productId: string;
  quantity: number;
  deliveryDays: number;
  paymentTerms?: string;
  targetPricePerUnit?: number;
  requiredCertification?: boolean;
}

export class BuyerAgent {
  /**
   * Parses a natural language user request into structured requirements and policy defaults
   */
  parseNaturalLanguageRequest(
    userMessage: string,
    policyOverrides: Partial<BuyerPolicy> = {}
  ): { policy: BuyerPolicy; requirement: ShareableBuyerRequirement } {
    let quantity = 100;
    let deliveryDays = 5;
    let maxTotalBudget = 150000;
    let productId = 'bearing-6205';
    let targetPricePerUnit: number | undefined = undefined;

    // Pattern extraction for quantity
    const qtyMatch = userMessage.match(/(\d+)\s*(units|bearings|items|pieces|pcs)/i);
    if (qtyMatch && qtyMatch[1]) {
      quantity = parseInt(qtyMatch[1], 10);
    }

    // Pattern extraction for delivery days
    const delMatch = userMessage.match(/within\s*(\d+)\s*days|in\s*(\d+)\s*days|(\d+)\s*days/i);
    if (delMatch) {
      const daysStr = delMatch[1] || delMatch[2] || delMatch[3];
      if (daysStr) deliveryDays = parseInt(daysStr, 10);
    }

    // Pattern extraction for budget (e.g. under ₹4 lakh, under ₹1.5L, ₹150000, 400000)
    const budgetLakhMatch = userMessage.match(/under\s*₹?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|l)/i);
    if (budgetLakhMatch && budgetLakhMatch[1]) {
      maxTotalBudget = parseFloat(budgetLakhMatch[1]) * 100000;
    } else {
      const budgetDirectMatch = userMessage.match(/budget\s*(?:of)?\s*₹?\s*(\d+)|under\s*₹?\s*(\d+)/i);
      if (budgetDirectMatch) {
        const val = budgetDirectMatch[1] || budgetDirectMatch[2];
        if (val) maxTotalBudget = parseInt(val, 10);
      }
    }

    const policy: BuyerPolicy = {
      maxTotalBudget: policyOverrides.maxTotalBudget ?? maxTotalBudget,
      targetTotalBudget: policyOverrides.targetTotalBudget ?? Math.round(maxTotalBudget * 0.9),
      requiredQuantity: policyOverrides.requiredQuantity ?? quantity,
      requiredDeliveryDays: policyOverrides.requiredDeliveryDays ?? deliveryDays,
      latestAcceptableDeliveryDays: policyOverrides.latestAcceptableDeliveryDays ?? deliveryDays,
      preferredDeliveryDays: policyOverrides.preferredDeliveryDays ?? Math.max(1, deliveryDays - 1),
      minSupplierReliability: policyOverrides.minSupplierReliability ?? 0.8,
      weights: policyOverrides.weights ?? {
        price: 0.4,
        delivery: 0.25,
        quality: 0.2,
        reliability: 0.15,
      },
      ...policyOverrides,
    };

    const requirement: ShareableBuyerRequirement = {
      productId: policyOverrides.acceptableBrands?.[0] ?? productId,
      quantity: policy.requiredQuantity,
      deliveryDays: policy.latestAcceptableDeliveryDays,
      targetPricePerUnit,
      requiredCertification: policy.requiredCertification,
    };

    return { policy, requirement };
  }

  /**
   * Filters out private parameters to create shareable requirement for Seller Agent.
   * Ensures maxTotalBudget and internal utility weights NEVER cross the boundary.
   */
  createShareableMessage(requirement: ShareableBuyerRequirement): ShareableBuyerRequirement {
    return {
      productId: requirement.productId,
      quantity: requirement.quantity,
      deliveryDays: requirement.deliveryDays,
      paymentTerms: requirement.paymentTerms,
      targetPricePerUnit: requirement.targetPricePerUnit,
      requiredCertification: requirement.requiredCertification,
    };
  }

  /**
   * Evaluates an incoming seller offer using the deterministic Decision Engine.
   */
  evaluateOffer(
    offer: CanonicalDeal,
    buyerPolicy: BuyerPolicy,
    sellerPolicy: SellerPolicy,
    supplierFacts: SupplierFacts
  ): { scoredDeal: ScoredDeal; explanation: string } {
    const scoredDeal = scoreDeal(offer, buyerPolicy, sellerPolicy, supplierFacts);
    const explanationObj = generateDecisionExplanation(scoredDeal, undefined, 'Buyer evaluation');

    const explanation = `[Buyer Agent Evaluation] ${explanationObj.what}. Status: ${
      scoredDeal.isFeasible ? 'FEASIBLE' : 'INFEASIBLE'
    }. ${explanationObj.impact}`;

    return { scoredDeal, explanation: explanation };
  }

  /**
   * Proposes a Pareto-optimal counter-offer via the Decision Engine
   */
  proposeCounter(
    buyerPolicy: BuyerPolicy,
    sellerPolicy: SellerPolicy,
    supplierFacts: SupplierFacts,
    currentOffer: CanonicalDeal
  ): CanonicalDeal | undefined {
    const baseItem = {
      productId: currentOffer.items[0]?.productId ?? 'prod-1',
      quantity: currentOffer.items[0]?.quantity ?? buyerPolicy.requiredQuantity,
      unitPrice: Math.round((currentOffer.items[0]?.unitPrice ?? 100) * 0.92),
    };

    const candidates = generateSingleSupplierCandidates(
      buyerPolicy,
      sellerPolicy,
      supplierFacts,
      baseItem
    );

    const scored = candidates.map((d) => scoreDeal(d, buyerPolicy, sellerPolicy, supplierFacts));
    const pareto = findParetoFrontier(scored);
    const ranked = rankAndCategorizeDeals(pareto);

    const bestCounter = ranked.BEST_BUYER ?? ranked.BEST_BALANCED ?? pareto[0];
    return bestCounter?.deal;
  }
}
