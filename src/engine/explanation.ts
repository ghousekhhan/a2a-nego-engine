/**
 * Decision Explanation & Audit Trace Engine
 * Reference: Section 44, 55 PRODUCT_SPEC.md & Section 82-83 DECISION_ENGINE_SPEC.md
 * 
 * Problem 5 Fix: Generate explanations 100% dynamically from the actual CanonicalDeal and engine outputs.
 */

import type {
  CanonicalDeal,
  ScoredDeal,
  DecisionExplanation,
  AuditEvent,
  ActionType,
  DecisionStatus,
} from '../types/index.ts';

/**
 * Generates structured 4-part decision explanation (What, Why, Impact, Condition)
 * dynamically derived from actual CanonicalDeal state.
 */
export function generateDecisionExplanation(
  scoredDeal: ScoredDeal,
  baselineDeal?: ScoredDeal,
  primaryReason: string = 'Optimization'
): DecisionExplanation {
  const deal = scoredDeal.deal;
  const qty = deal.items[0]?.quantity ?? 1;
  const unitPrice = deal.items[0]?.unitPrice ?? 0;
  const totalPrice = scoredDeal.totalBuyerCost;

  const what = `Recommended deal: ₹${totalPrice.toLocaleString()} (${qty} units @ ₹${unitPrice}/unit, ${deal.deliveryDays}d delivery, ${deal.paymentTerms})`;

  let why = `Deal maximizes combined commercial utility while respecting all financial hard constraints (Seller margin: ${(scoredDeal.sellerMargin * 100).toFixed(1)}%).`;
  if (deal.paymentTerms === 'upfront' && qty > 500) {
    why = `Order quantity of ${qty} units combined with upfront payment financing unlocks seller concession while preserving seller margin (${(scoredDeal.sellerMargin * 100).toFixed(1)}%).`;
  } else if (deal.paymentTerms === 'upfront') {
    why = `Upfront payment provides financing benefit to seller, enabling unit price discount to ₹${unitPrice}/unit while maintaining seller margin (${(scoredDeal.sellerMargin * 100).toFixed(1)}%).`;
  } else if (qty > 100) {
    why = `Order quantity of ${qty} units unlocks volume pricing tier while maintaining seller margin (${(scoredDeal.sellerMargin * 100).toFixed(1)}%).`;
  }

  let impact = `Buyer utility: ${scoredDeal.buyerUtility.toFixed(2)}, Seller utility: ${scoredDeal.sellerUtility.toFixed(2)}.`;
  let financialImpact = 0;
  if (baselineDeal) {
    const savings = baselineDeal.totalBuyerCost - scoredDeal.totalBuyerCost;
    financialImpact = savings;
    const delDelta = deal.deliveryDays - baselineDeal.deal.deliveryDays;
    impact = `Saves ₹${savings.toLocaleString()} with ${delDelta >= 0 ? '+' : ''}${delDelta} days delivery. Buyer utility: ${scoredDeal.buyerUtility.toFixed(2)}, Seller utility: ${scoredDeal.sellerUtility.toFixed(2)}.`;
  }

  const conditionsList: string[] = [];
  if (qty > 0) conditionsList.push(`Quantity = ${qty} units`);
  if (deal.paymentTerms) conditionsList.push(`Payment = ${deal.paymentTerms}`);
  if (deal.deliveryDays) conditionsList.push(`Delivery = ${deal.deliveryDays}d`);
  if (deal.contractMonths && deal.contractMonths > 1) conditionsList.push(`Contract = ${deal.contractMonths} months`);

  const condition = conditionsList.length > 0 ? conditionsList.join('; ') : 'Standard commercial terms';

  return {
    what,
    why,
    impact,
    condition,
    financialImpact,
    primaryReason,
  };
}

/**
 * Audit Logger to maintain deterministic immutable history
 */
export class AuditLogger {
  private events: AuditEvent[] = [];

  log(
    actor: string,
    action: ActionType | string,
    input: Record<string, unknown>,
    output: Record<string, unknown>,
    rulesTriggered: string[],
    decision: DecisionStatus,
    approvalRequired: boolean = false
  ): AuditEvent {
    const event: AuditEvent = {
      timestamp: new Date().toISOString(),
      actor,
      action,
      input,
      output,
      rulesTriggered,
      decision,
      approvalRequired,
    };
    this.events.push(event);
    return event;
  }

  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}
