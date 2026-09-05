/**
 * Seller Agent Implementation
 * Reference: Section 7 & 49 PRODUCT_SPEC.md & Section 93 DECISION_ENGINE_SPEC.md
 * 
 * Responsibilities:
 * 1. Receive shareable buyer requirements.
 * 2. Invoke Decision Engine to compute initial offers and evaluate counter-offers.
 * 3. Strictly protect private seller economics (product cost, minimum margin, target margin).
 * 4. NEVER commit below seller floor or bypass Decision Engine validations.
 */

import type {
  CanonicalDeal,
  SellerPolicy,
  BuyerPolicy,
  SupplierFacts,
  ScoredDeal,
} from '../types/index.ts';
import type { ShareableBuyerRequirement } from './buyerAgent.ts';
import { calculateSellerEconomics } from '../engine/economics.ts';
import { validateHardConstraints } from '../engine/constraints.ts';
import { scoreDeal, findParetoFrontier, rankAndCategorizeDeals } from '../engine/optimizer.ts';
import { generateSingleSupplierCandidates } from '../engine/candidates.ts';
import { evaluateSellerConcession } from '../engine/concessions.ts';

export class SellerAgent {
  /**
   * Generates an initial commercial offer for a buyer requirement using Decision Engine
   */
  proposeInitialOffer(
    requirement: ShareableBuyerRequirement,
    sellerPolicy: SellerPolicy,
    buyerPolicy: BuyerPolicy,
    supplierFacts: SupplierFacts
  ): CanonicalDeal | undefined {
    const prodConfig = sellerPolicy.products[requirement.productId];
    if (!prodConfig) return undefined;

    const baseItem = {
      productId: requirement.productId,
      quantity: requirement.quantity,
      unitPrice: prodConfig.basePrice,
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

    const initialDeal = ranked.BEST_SELLER ?? ranked.BEST_BALANCED ?? pareto[0]?.deal;
    return initialDeal ? this.createShareableOffer(initialDeal.deal) : undefined;
  }

  /**
   * Evaluates a counter-offer from Buyer Agent.
   * Strictly uses Decision Engine to ensure minimum margin floor is NOT violated.
   */
  evaluateBuyerCounter(
    buyerCounter: CanonicalDeal,
    sellerPolicy: SellerPolicy,
    buyerPolicy: BuyerPolicy,
    supplierFacts: SupplierFacts
  ): {
    accepted: boolean;
    sellerEcon: ReturnType<typeof calculateSellerEconomics>;
    counterProposal?: CanonicalDeal;
    reason: string;
  } {
    const sellerEcon = calculateSellerEconomics(buyerCounter, sellerPolicy);

    // Rule: Seller Agent CANNOT accept an offer below seller economic floor
    if (!sellerEcon.isValidMargin) {
      // Find an alternative concession using Decision Engine
      const alternative = this.proposeAlternativeConcession(
        buyerCounter,
        sellerPolicy,
        buyerPolicy,
        supplierFacts
      );

      return {
        accepted: false,
        sellerEcon,
        counterProposal: alternative,
        reason: `Proposed counter of ₹${buyerCounter.items[0]?.unitPrice}/unit is below seller minimum margin floor (${(sellerPolicy.minMargin * 100).toFixed(1)}%). Rejection enforced by Decision Engine (BELOW_SELLER_FLOOR).`,
      };
    }

    // Evaluate if counter is acceptable to seller utility
    const scoredCounter = scoreDeal(buyerCounter, buyerPolicy, sellerPolicy, supplierFacts);
    if (scoredCounter.sellerUtility >= 0.5) {
      return {
        accepted: true,
        sellerEcon,
        reason: `Counter offer accepted. Seller margin: ${(sellerEcon.grossMargin * 100).toFixed(1)}%, Seller utility: ${scoredCounter.sellerUtility.toFixed(2)}.`,
      };
    }

    // Propose alternative if counter is valid margin but low utility
    const alternative = this.proposeAlternativeConcession(
      buyerCounter,
      sellerPolicy,
      buyerPolicy,
      supplierFacts
    );

    return {
      accepted: false,
      sellerEcon,
      counterProposal: alternative,
      reason: `Counter offer margin is valid (${(sellerEcon.grossMargin * 100).toFixed(1)}%), but seller utility (${scoredCounter.sellerUtility.toFixed(2)}) prefers a give/get exchange.`,
    };
  }

  /**
   * Generates a conditional concession counter-offer via Decision Engine
   */
  private proposeAlternativeConcession(
    buyerCounter: CanonicalDeal,
    sellerPolicy: SellerPolicy,
    buyerPolicy: BuyerPolicy,
    supplierFacts: SupplierFacts
  ): CanonicalDeal | undefined {
    const baseItem = {
      productId: buyerCounter.items[0]?.productId ?? 'prod-1',
      quantity: Math.round((buyerCounter.items[0]?.quantity ?? 100) * 1.2),
      unitPrice: Math.max(
        buyerCounter.items[0]?.unitPrice ?? 0,
        Math.ceil(sellerPolicy.products[buyerCounter.items[0]?.productId ?? 'prod-1']?.productCost ?? 0) / (1 - sellerPolicy.minMargin)
      ),
    };

    const candidates = generateSingleSupplierCandidates(
      buyerPolicy,
      sellerPolicy,
      supplierFacts,
      baseItem
    );

    const validCandidates = candidates.filter((d) => {
      const econ = calculateSellerEconomics(d, sellerPolicy);
      return econ.isValidMargin;
    });

    const scored = validCandidates.map((d) => scoreDeal(d, buyerPolicy, sellerPolicy, supplierFacts));
    const pareto = findParetoFrontier(scored);
    const ranked = rankAndCategorizeDeals(pareto);

    const alt = ranked.BEST_SELLER ?? ranked.BEST_BALANCED ?? pareto[0]?.deal;
    return alt ? this.createShareableOffer(alt.deal) : undefined;
  }

  /**
   * Strips private cost & margin details to create shareable offer
   */
  createShareableOffer(deal: CanonicalDeal): CanonicalDeal {
    return {
      id: deal.id,
      supplierId: deal.supplierId,
      items: deal.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        // Notice: productCost is intentionally omitted to preserve privacy!
      })),
      deliveryDays: deal.deliveryDays,
      paymentTerms: deal.paymentTerms,
      contractMonths: deal.contractMonths,
      shippingCost: deal.shippingCost,
      installationCost: deal.installationCost,
      warrantyMonths: deal.warrantyMonths,
      conditions: deal.conditions ? [...deal.conditions] : undefined,
      expeditedDelivery: deal.expeditedDelivery,
    };
  }
}
