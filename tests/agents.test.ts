import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import type {
  BuyerPolicy,
  SellerPolicy,
  SupplierFacts,
  CanonicalDeal,
} from '../src/types/index.ts';
import { BuyerAgent } from '../src/agents/buyerAgent.ts';
import { SellerAgent } from '../src/agents/sellerAgent.ts';
import { NegotiationOrchestrator } from '../src/agents/orchestrator.ts';
import { calculateSellerEconomics } from '../src/engine/economics.ts';
import { validateHardConstraints } from '../src/engine/constraints.ts';
import { runWhatIfAnalysis } from '../src/engine/whatIf.ts';
import { generateDecisionExplanation } from '../src/engine/explanation.ts';
import { scoreDeal } from '../src/engine/optimizer.ts';
import { ROUND1_DEAL, ROUND2_DEAL, ROUND3_DEAL } from '../src/demoData.ts';

describe('Agent Layer & Regression Fix Automated Tests', () => {
  const sellerPolicy: SellerPolicy = {
    supplierId: 'supplier-1',
    products: {
      'bearing-6205': { productId: 'bearing-6205', productCost: 500, basePrice: 800, availableInventory: 1000 },
    },
    targetMargin: 0.20,
    minMargin: 0.10, // Floor unit price = 500 / 0.90 = ₹555.56
    paymentTerms: ['upfront', '30_days'],
    weights: { profit: 0.5, volume: 0.3, cashflow: 0.1, inventory: 0.1, customer: 0, risk: 0 },
  };

  const supplierFacts: SupplierFacts = {
    supplierId: 'supplier-1',
    reliabilityScore: 0.95,
    qualityScore: 0.9,
    certificationAvailable: true,
  };

  // Test 1: Buyer submits natural-language request and gets structured requirements.
  test('Test 1: Buyer parses natural-language request into structured requirements', () => {
    const buyerAgent = new BuyerAgent();
    const reqText = 'I need 500 bearings within 5 days under ₹4 lakh';
    const parsed = buyerAgent.parseNaturalLanguageRequest(reqText);

    assert.equal(parsed.policy.requiredQuantity, 500);
    assert.equal(parsed.policy.latestAcceptableDeliveryDays, 5);
    assert.equal(parsed.policy.maxTotalBudget, 400000);
    assert.equal(parsed.requirement.quantity, 500);
    assert.equal(parsed.requirement.deliveryDays, 5);
  });

  // Test 2: Seller cannot submit an offer below its economic floor.
  test('Test 2: Seller Agent rejects counter below economic floor', () => {
    const sellerAgent = new SellerAgent();
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 300000,
      requiredQuantity: 500,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    // Floor price is ~₹556. Buyer proposes ₹500 (unit cost, margin = 0%)
    const invalidCounter: CanonicalDeal = {
      supplierId: 'supplier-1',
      items: [{ productId: 'bearing-6205', quantity: 500, unitPrice: 500 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    const evalResult = sellerAgent.evaluateBuyerCounter(invalidCounter, sellerPolicy, buyerPolicy, supplierFacts);

    assert.equal(evalResult.accepted, false);
    assert.equal(evalResult.sellerEcon.isValidMargin, false);
    assert.ok(evalResult.reason.includes('BELOW_SELLER_FLOOR'));
  });

  // Test 3: Buyer cannot accept an offer above its hard budget.
  test('Test 3: Buyer cannot accept an offer above its hard budget', () => {
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 300000, // Max budget = 3 Lakh (₹600/unit for 500 units)
      requiredQuantity: 500,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    // Seller offers ₹700/unit * 500 = ₹350,000 > ₹300,000 budget
    const expensiveDeal: CanonicalDeal = {
      supplierId: 'supplier-1',
      items: [{ productId: 'bearing-6205', quantity: 500, unitPrice: 700 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    const validation = validateHardConstraints(expensiveDeal, buyerPolicy, sellerPolicy, supplierFacts);

    assert.equal(validation.passed, false);
    assert.equal(validation.matrix.price, 'FAIL');
  });

  // Test 4: Unknown mandatory information triggers NEEDS_INFORMATION.
  test('Test 4: Unknown mandatory information triggers NEEDS_INFORMATION', () => {
    const orchestrator = new NegotiationOrchestrator();
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 400000,
      requiredQuantity: 100,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      requiredCertification: true,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const unknownFacts: SupplierFacts = {
      supplierId: 'supplier-1',
      reliabilityScore: 0.9,
      qualityScore: 0.9,
      certificationAvailable: 'UNKNOWN',
    };

    const result = orchestrator.runNegotiation(
      'I need 100 bearings with required certification',
      buyerPolicy,
      sellerPolicy,
      unknownFacts
    );

    assert.equal(result.status, 'NEEDS_INFORMATION');
  });

  // Test 5: Agents cannot bypass the Decision Engine.
  test('Test 5: Agents cannot bypass the Decision Engine', () => {
    const sellerAgent = new SellerAgent();
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 400000,
      requiredQuantity: 100,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const offer = sellerAgent.proposeInitialOffer(
      { productId: 'bearing-6205', quantity: 100, deliveryDays: 5 },
      sellerPolicy,
      buyerPolicy,
      supplierFacts
    );

    assert.ok(offer);
    const sellerEcon = calculateSellerEconomics(offer, sellerPolicy);
    const buyerVal = validateHardConstraints(offer, buyerPolicy, sellerPolicy, supplierFacts);

    // Assert the offer generated by agent is 100% compliant with Decision Engine
    assert.equal(sellerEcon.isValidMargin, true);
    assert.equal(buyerVal.passed, true);
  });

  // Test 6: A valid negotiation reaches ACCEPT (APPROVED).
  test('Test 6: Valid negotiation reaches ACCEPT / APPROVED', () => {
    const orchestrator = new NegotiationOrchestrator();
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 400000,
      requiredQuantity: 500,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const result = orchestrator.runNegotiation(
      'I need 500 bearings within 5 days under ₹4 lakh',
      buyerPolicy,
      sellerPolicy,
      supplierFacts
    );

    assert.equal(result.status, 'APPROVED');
    assert.ok(result.finalDeal);
    assert.ok(result.explanation);
    assert.ok(result.dialogueHistory.length > 0);
  });

  // Test 7: An impossible negotiation reaches NO_DEAL.
  test('Test 7: Impossible negotiation reaches NO_DEAL', () => {
    const orchestrator = new NegotiationOrchestrator();

    // Buyer budget ₹200/unit < Seller floor ₹556/unit
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 100000, // ₹100,000 for 500 units = ₹200/unit
      requiredQuantity: 500,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const result = orchestrator.runNegotiation(
      'I need 500 bearings under ₹1 lakh',
      buyerPolicy,
      sellerPolicy,
      supplierFacts
    );

    assert.equal(result.status, 'NO_DEAL');
    assert.ok(result.noDealCertificate);
    assert.equal(result.noDealCertificate.status, 'NO_DEAL');
    assert.ok(result.noDealCertificate.gap > 0);
  });

  // Test 8: Private buyer/seller economics are never included in the opposite agent's message.
  test('Test 8: Private buyer/seller economics are never included in the opposite agent message', () => {
    const orchestrator = new NegotiationOrchestrator();
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 400000,
      requiredQuantity: 500,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const result = orchestrator.runNegotiation(
      'I need 500 bearings within 5 days under ₹4 lakh',
      buyerPolicy,
      sellerPolicy,
      supplierFacts
    );

    assert.equal(result.privacyPassed, true);

    // Verify dialogue history payloads for buyer & seller messages
    for (const msg of result.dialogueHistory) {
      if (msg.sender === 'buyer_agent' && msg.payload) {
        assert.equal('maxTotalBudget' in msg.payload, false);
      }
      if (msg.sender === 'seller_agent' && msg.payload) {
        assert.equal('productCost' in msg.payload, false);
        assert.equal('minMargin' in msg.payload, false);
      }
    }
  });

  // Regression Test for Problem 2: What-If Quantity Query = 600
  test('Regression Test 2 (Problem 2): What-if query quantity=600 yields result quantity=600', () => {
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 500000,
      requiredQuantity: 500,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const baselineDeal: CanonicalDeal = {
      supplierId: 'supplier-1',
      items: [{ productId: 'bearing-6205', quantity: 500, unitPrice: 700 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    const result = runWhatIfAnalysis(
      { quantity: 600 },
      baselineDeal,
      buyerPolicy,
      sellerPolicy,
      supplierFacts
    );

    assert.ok(result.newBestDeal);
    assert.equal(result.newBestDeal.deal.items[0]?.quantity, 600);
  });

  // Regression Test for Problem 3: Budget Authority Ceiling Exceeded
  test('Regression Test 3 (Problem 3): Budget increase exceeding max authority ceiling is BLOCKED / REQUIRES_APPROVAL', () => {
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 400000, // Max authorized budget ceiling
      targetTotalBudget: 360000,
      requiredQuantity: 500,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const baselineDeal: CanonicalDeal = {
      supplierId: 'supplier-1',
      items: [{ productId: 'bearing-6205', quantity: 500, unitPrice: 750 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    // Query requesting budget ₹420,000 > max authorized ceiling ₹400,000
    const result = runWhatIfAnalysis(
      { maxTotalBudget: 420000 },
      baselineDeal,
      buyerPolicy,
      sellerPolicy,
      supplierFacts
    );

    assert.equal(result.requiresHumanApproval, true);
    assert.ok(result.recommendation.includes('BLOCKED') || result.recommendation.includes('EXECUTIVE APPROVAL'));
  });

  // Regression Test for Problem 4: State Consistency (totalPrice === quantity * unitPrice)
  test('Regression Test 4 (Problem 4): State consistency - totalPrice === quantity * unitPrice across all rounds', () => {
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 400000,
      requiredQuantity: 500,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const deals = [ROUND1_DEAL, ROUND2_DEAL, ROUND3_DEAL];

    for (const deal of deals) {
      const scored = scoreDeal(deal, buyerPolicy, sellerPolicy, supplierFacts);
      const qty = deal.items[0]?.quantity ?? 0;
      const unitPrice = deal.items[0]?.unitPrice ?? 0;
      const expectedTotal = Math.round(qty * unitPrice);

      assert.equal(scored.totalBuyerCost, expectedTotal);
    }
  });

  // Regression Test for Problem 5: Explanation Consistency
  test('Regression Test 5 (Problem 5): Explanation dynamically matches actual CanonicalDeal properties', () => {
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 400000,
      requiredQuantity: 550,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const scored = scoreDeal(ROUND3_DEAL, buyerPolicy, sellerPolicy, supplierFacts);
    const explanation = generateDecisionExplanation(scored, undefined, 'Final Agreement');

    assert.ok(explanation.what.includes('550 units'));
    assert.ok(explanation.what.includes('695.45'));
    assert.ok(explanation.what.includes('upfront'));
    assert.ok(explanation.what.includes('4d delivery'));
    assert.ok(explanation.condition.includes('550 units'));
    assert.ok(explanation.condition.includes('upfront'));
  });

});
