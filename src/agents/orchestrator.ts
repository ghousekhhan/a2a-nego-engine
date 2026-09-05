/**
 * Agent-to-Agent Negotiation Loop Orchestrator
 * Reference: Section 3 & 65 PRODUCT_SPEC.md & Section 73 DECISION_ENGINE_SPEC.md
 * 
 * Architecture Enforcement:
 * 1. Agents are NOT decision makers.
 * 2. Every proposed offer passes through the deterministic Decision Engine.
 * 3. Strict privacy boundaries: Buyer max budget and Seller product cost/min margin
 *    are NEVER included in the opposite agent's messages.
 */

import type {
  BuyerPolicy,
  SellerPolicy,
  SupplierFacts,
  CanonicalDeal,
  DecisionStatus,
  NoDealCertificate,
  DecisionExplanation,
  AuditEvent,
  NegotiationState,
} from '../types/index.ts';
import { BuyerAgent } from './buyerAgent.ts';
import type { ShareableBuyerRequirement } from './buyerAgent.ts';
import { SellerAgent } from './sellerAgent.ts';
import { validateHardConstraints } from '../engine/constraints.ts';
import { scoreDeal } from '../engine/optimizer.ts';
import { evaluateNextNegotiationStep } from '../engine/stateMachine.ts';
import { checkReservationOverlap, generateNoDealCertificate } from '../engine/reservation.ts';
import { generateDecisionExplanation, AuditLogger } from '../engine/explanation.ts';

export interface AgentMessage {
  round: number;
  sender: 'buyer_agent' | 'seller_agent' | 'decision_engine' | 'user';
  text: string;
  payload?: Record<string, unknown>;
}

export interface NegotiationResult {
  status: DecisionStatus;
  finalDeal?: CanonicalDeal;
  noDealCertificate?: NoDealCertificate;
  explanation?: DecisionExplanation;
  roundsCount: number;
  dialogueHistory: AgentMessage[];
  auditTrail: AuditEvent[];
  privacyPassed: boolean;
}

export class NegotiationOrchestrator {
  private buyerAgent = new BuyerAgent();
  private sellerAgent = new SellerAgent();
  private auditLogger = new AuditLogger();

  runNegotiation(
    userRequest: string | Partial<BuyerPolicy>,
    buyerPolicyOverrides: Partial<BuyerPolicy>,
    sellerPolicy: SellerPolicy,
    supplierFacts: SupplierFacts,
    maxRounds: number = 5
  ): NegotiationResult {
    this.auditLogger.clear();
    const dialogueHistory: AgentMessage[] = [];
    let privacyPassed = true;

    // 1. Buyer Request & Intent Parsing
    const requestText =
      typeof userRequest === 'string'
        ? userRequest
        : `Request for ${userRequest.requiredQuantity ?? 100} units with budget ₹${userRequest.maxTotalBudget ?? 150000}`;

    dialogueHistory.push({
      round: 0,
      sender: 'user',
      text: requestText,
    });

    const parsed = this.buyerAgent.parseNaturalLanguageRequest(requestText, buyerPolicyOverrides);
    const buyerPolicy = parsed.policy;
    const shareableReq = this.buyerAgent.createShareableMessage(parsed.requirement);

    this.auditLogger.log(
      'buyer_agent',
      'PARSE_INTENT',
      { requestText },
      { buyerPolicy, shareableReq },
      ['buyer_intent_parsing'],
      'FEASIBLE'
    );

    // PRIVACY VERIFICATION CHECK #1: Shareable requirement must NOT contain maxTotalBudget
    if ('maxTotalBudget' in (shareableReq as unknown as Record<string, unknown>)) {
      privacyPassed = false;
    }

    dialogueHistory.push({
      round: 0,
      sender: 'buyer_agent',
      text: `Parsed requirements: ${shareableReq.quantity} units of ${shareableReq.productId}, delivery within ${shareableReq.deliveryDays} days.`,
      payload: shareableReq as unknown as Record<string, unknown>,
    });

    // 2. Decision Engine validates Buyer hard constraints on initial requirement
    const prodConfig = sellerPolicy.products[shareableReq.productId];
    const initialUnitPrice = prodConfig ? prodConfig.basePrice : 1000;
    const dummyInitialDeal: CanonicalDeal = {
      supplierId: sellerPolicy.supplierId,
      items: [{ productId: shareableReq.productId, quantity: shareableReq.quantity, unitPrice: initialUnitPrice }],
      deliveryDays: shareableReq.deliveryDays,
      paymentTerms: '30_days',
    };

    const initialVal = validateHardConstraints(dummyInitialDeal, buyerPolicy, sellerPolicy, supplierFacts);

    // Check for Unknown mandatory fields (Scenario 09)
    if (initialVal.requiresInformation) {
      dialogueHistory.push({
        round: 0,
        sender: 'decision_engine',
        text: `Mandatory information missing: [${(initialVal.missingFields ?? []).join(', ')}]. Escalating to user/supplier.`,
      });
      return {
        status: 'NEEDS_INFORMATION',
        roundsCount: 0,
        dialogueHistory,
        auditTrail: this.auditLogger.getEvents(),
        privacyPassed,
      };
    }

    // Check for empty reservation overlap (Scenario 08)
    const buyerCeilingPerUnit = Math.floor(buyerPolicy.maxTotalBudget / shareableReq.quantity);
    const sellerFloorPerUnit = prodConfig
      ? Math.ceil(prodConfig.productCost / (1 - sellerPolicy.minMargin))
      : 1000;

    const overlap = checkReservationOverlap(buyerCeilingPerUnit, sellerFloorPerUnit);
    if (!overlap.overlap) {
      const cert = generateNoDealCertificate(
        buyerPolicy.maxTotalBudget,
        sellerFloorPerUnit * shareableReq.quantity,
        1,
        `Buyer ceiling (₹${buyerPolicy.maxTotalBudget}) is below seller minimum floor (₹${
          sellerFloorPerUnit * shareableReq.quantity
        }).`
      );

      this.auditLogger.log(
        'decision_engine',
        'RESERVATION_CHECK',
        { buyerCeilingPerUnit, sellerFloorPerUnit },
        { cert },
        ['no_reservation_overlap'],
        'NO_DEAL'
      );

      dialogueHistory.push({
        round: 0,
        sender: 'decision_engine',
        text: cert.reason,
        payload: cert as unknown as Record<string, unknown>,
      });

      return {
        status: 'NO_DEAL',
        noDealCertificate: cert,
        roundsCount: 0,
        dialogueHistory,
        auditTrail: this.auditLogger.getEvents(),
        privacyPassed,
      };
    }

    // 3. Seller Agent proposes initial offer via Decision Engine
    const initialSellerOffer = this.sellerAgent.proposeInitialOffer(
      shareableReq,
      sellerPolicy,
      buyerPolicy,
      supplierFacts
    );

    if (!initialSellerOffer) {
      const cert = generateNoDealCertificate(buyerPolicy.maxTotalBudget, sellerFloorPerUnit * shareableReq.quantity, 1);
      return {
        status: 'NO_DEAL',
        noDealCertificate: cert,
        roundsCount: 0,
        dialogueHistory,
        auditTrail: this.auditLogger.getEvents(),
        privacyPassed,
      };
    }

    // PRIVACY VERIFICATION CHECK #2: Shareable seller offer must NOT expose productCost or minMargin
    if (
      'productCost' in (initialSellerOffer.items[0] ?? {}) ||
      'minMargin' in (initialSellerOffer as unknown as Record<string, unknown>)
    ) {
      privacyPassed = false;
    }

    let currentDeal = initialSellerOffer;
    const state: NegotiationState = {
      round: 1,
      maxRounds,
      currentDeal: initialSellerOffer,
      history: [initialSellerOffer],
      isComplete: false,
      status: 'FEASIBLE',
      minMeaningfulUtilityGain: 0.01,
    };

    dialogueHistory.push({
      round: 1,
      sender: 'seller_agent',
      text: `Offered ${currentDeal.items[0]?.quantity} units at ₹${currentDeal.items[0]?.unitPrice}/unit with ${currentDeal.deliveryDays}d delivery (${currentDeal.paymentTerms}).`,
      payload: currentDeal as unknown as Record<string, unknown>,
    });

    // 4. Negotiation Round-by-Round Loop
    while (state.round <= maxRounds) {
      // Step A: Decision Engine evaluates proposed deal
      const nextDecision = evaluateNextNegotiationStep(
        state,
        currentDeal,
        buyerPolicy,
        sellerPolicy,
        supplierFacts
      );

      this.auditLogger.log(
        'decision_engine',
        nextDecision.action,
        { round: state.round, deal: currentDeal },
        { nextDecision },
        ['evaluate_next_step'],
        nextDecision.status,
        nextDecision.approvalRequired
      );

      if (nextDecision.status === 'APPROVED') {
        const scored = scoreDeal(currentDeal, buyerPolicy, sellerPolicy, supplierFacts);
        const explanation = generateDecisionExplanation(scored, undefined, 'Final Agreement');

        dialogueHistory.push({
          round: state.round,
          sender: 'decision_engine',
          text: `Agreement Reached! ${explanation.what}. ${explanation.why}`,
          payload: scored as unknown as Record<string, unknown>,
        });

        return {
          status: 'APPROVED',
          finalDeal: currentDeal,
          explanation,
          roundsCount: state.round,
          dialogueHistory,
          auditTrail: this.auditLogger.getEvents(),
          privacyPassed,
        };
      }

      if (nextDecision.status === 'STOP') {
        const scored = scoreDeal(state.currentDeal ?? currentDeal, buyerPolicy, sellerPolicy, supplierFacts);
        const explanation = generateDecisionExplanation(scored, undefined, 'Negotiation Finalized');

        dialogueHistory.push({
          round: state.round,
          sender: 'decision_engine',
          text: `Negotiation Finalized. ${nextDecision.reason}`,
        });

        return {
          status: 'APPROVED',
          finalDeal: state.currentDeal ?? currentDeal,
          explanation,
          roundsCount: state.round,
          dialogueHistory,
          auditTrail: this.auditLogger.getEvents(),
          privacyPassed,
        };
      }

      if (nextDecision.status === 'REJECTED' || nextDecision.status === 'ESCALATE') {
        dialogueHistory.push({
          round: state.round,
          sender: 'decision_engine',
          text: `Status: ${nextDecision.status}. ${nextDecision.reason}`,
        });
        return {
          status: nextDecision.status,
          finalDeal: currentDeal,
          roundsCount: state.round,
          dialogueHistory,
          auditTrail: this.auditLogger.getEvents(),
          privacyPassed,
        };
      }

      // Step B: Buyer Agent formulates counter-offer using Decision Engine
      const buyerCounter = this.buyerAgent.proposeCounter(
        buyerPolicy,
        sellerPolicy,
        supplierFacts,
        currentDeal
      );

      if (!buyerCounter) {
        // No better counter found -> accept current deal if feasible
        const scored = scoreDeal(currentDeal, buyerPolicy, sellerPolicy, supplierFacts);
        if (scored.isFeasible) {
          const explanation = generateDecisionExplanation(scored, undefined, 'Accepted Current Offer');
          return {
            status: 'APPROVED',
            finalDeal: currentDeal,
            explanation,
            roundsCount: state.round,
            dialogueHistory,
            auditTrail: this.auditLogger.getEvents(),
            privacyPassed,
          };
        }
        break;
      }

      // Decision Engine validates Buyer counter against Buyer budget (Rule 3)
      const buyerCounterVal = validateHardConstraints(buyerCounter, buyerPolicy, sellerPolicy, supplierFacts);
      if (!buyerCounterVal.passed && buyerCounterVal.matrix.price === 'FAIL') {
        // Buyer counter violates buyer hard budget
        const cert = generateNoDealCertificate(buyerPolicy.maxTotalBudget, sellerFloorPerUnit * shareableReq.quantity, state.round);
        return {
          status: 'NO_DEAL',
          noDealCertificate: cert,
          roundsCount: state.round,
          dialogueHistory,
          auditTrail: this.auditLogger.getEvents(),
          privacyPassed,
        };
      }

      dialogueHistory.push({
        round: state.round,
        sender: 'buyer_agent',
        text: `Counter-offer: ${buyerCounter.items[0]?.quantity} units at ₹${buyerCounter.items[0]?.unitPrice}/unit.`,
        payload: buyerCounter as unknown as Record<string, unknown>,
      });

      // Step C: Seller Agent evaluates counter-offer using Decision Engine (Rule 2)
      const sellerEval = this.sellerAgent.evaluateBuyerCounter(
        buyerCounter,
        sellerPolicy,
        buyerPolicy,
        supplierFacts
      );

      this.auditLogger.log(
        'seller_agent',
        sellerEval.accepted ? 'ACCEPT_COUNTER' : 'REJECT_COUNTER',
        { buyerCounter },
        { sellerEval },
        ['seller_floor_margin_check'],
        sellerEval.accepted ? 'APPROVED' : 'REJECTED'
      );

      if (sellerEval.accepted) {
        currentDeal = buyerCounter;
        state.history.push(currentDeal);
        const scored = scoreDeal(currentDeal, buyerPolicy, sellerPolicy, supplierFacts);
        const explanation = generateDecisionExplanation(scored, undefined, 'Seller Accepted Counter');

        dialogueHistory.push({
          round: state.round,
          sender: 'seller_agent',
          text: sellerEval.reason,
        });

        return {
          status: 'APPROVED',
          finalDeal: currentDeal,
          explanation,
          roundsCount: state.round,
          dialogueHistory,
          auditTrail: this.auditLogger.getEvents(),
          privacyPassed,
        };
      }

      // Seller proposed a counter-proposal
      if (sellerEval.counterProposal) {
        currentDeal = sellerEval.counterProposal;
        state.history.push(currentDeal);

        dialogueHistory.push({
          round: state.round,
          sender: 'seller_agent',
          text: `Counter rejected (below floor or low utility). Alternative proposed: ${currentDeal.items[0]?.quantity} units at ₹${currentDeal.items[0]?.unitPrice}/unit (${currentDeal.paymentTerms}).`,
          payload: currentDeal as unknown as Record<string, unknown>,
        });
      } else {
        // Rejection without counter -> No deal
        const cert = generateNoDealCertificate(buyerPolicy.maxTotalBudget, sellerFloorPerUnit * shareableReq.quantity, state.round);
        return {
          status: 'NO_DEAL',
          noDealCertificate: cert,
          roundsCount: state.round,
          dialogueHistory,
          auditTrail: this.auditLogger.getEvents(),
          privacyPassed,
        };
      }

      state.round++;
    }

    // Default if max rounds reached
    const finalScored = scoreDeal(currentDeal, buyerPolicy, sellerPolicy, supplierFacts);
    if (finalScored.isFeasible) {
      return {
        status: 'APPROVED',
        finalDeal: currentDeal,
        explanation: generateDecisionExplanation(finalScored, undefined, 'Max Rounds Accepted Feasible'),
        roundsCount: state.round - 1,
        dialogueHistory,
        auditTrail: this.auditLogger.getEvents(),
        privacyPassed,
      };
    }

    return {
      status: 'STOP',
      roundsCount: state.round - 1,
      dialogueHistory,
      auditTrail: this.auditLogger.getEvents(),
      privacyPassed,
    };
  }
}
