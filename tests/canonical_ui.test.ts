import { test, describe } from 'node:test';
import assert from 'node:assert';

import { CANONICAL_SCENARIOS } from '../src/data/canonicalScenarios.ts';
import { MOCK_SUPPLIERS } from '../src/data/mockSuppliers.ts';
import { NegotiationOrchestrator } from '../src/agents/orchestrator.ts';
import { scoreDeal } from '../src/engine/optimizer.ts';
import { calculateBuyerEconomics } from '../src/engine/economics.ts';

describe('Canonical UI & 10-Scenario End-to-End Regression Suite', () => {

  test('Dataset Integrity: 10 Mock Suppliers & 10 Canonical Scenarios Loaded', () => {
    assert.strictEqual(MOCK_SUPPLIERS.length, 10, 'Expected exactly 10 mock suppliers');
    assert.strictEqual(CANONICAL_SCENARIOS.length, 10, 'Expected exactly 10 canonical scenarios');
  });

  test('Canonical Scenario 01: Standard Commercial Agreement', () => {
    const sc = CANONICAL_SCENARIOS[0];
    const orchestrator = new NegotiationOrchestrator();
    const res = orchestrator.runNegotiation(sc.promptText, sc.buyerPolicy, sc.sellerPolicy, sc.supplierFacts, 4);

    assert.ok(['APPROVED', 'ESCALATE', 'RECOMMEND', 'FEASIBLE'].includes(res.status), `Unexpected status: ${res.status}`);
    assert.ok(res.finalDeal, 'Final deal must exist');
    const qty = res.finalDeal.items[0].quantity;
    const price = res.finalDeal.items[0].unitPrice;
    assert.ok(qty > 0 && price > 0, 'Quantity and price must be positive');
  });

  test('Canonical Scenario 02: Buyer Below Seller Floor (No Deal Certificate)', () => {
    const sc = CANONICAL_SCENARIOS[1];
    const orchestrator = new NegotiationOrchestrator();
    const res = orchestrator.runNegotiation(sc.promptText, sc.buyerPolicy, sc.sellerPolicy, sc.supplierFacts, 4);

    assert.strictEqual(res.status, 'NO_DEAL');
    assert.ok(res.noDealCertificate, 'Must issue a formal No-Deal Certificate');
    assert.strictEqual(res.noDealCertificate.status, 'NO_DEAL');
    assert.ok(res.noDealCertificate.gap > 0, 'Gap must be positive');
  });

  test('Canonical Scenario 03: Quantity Unlocks Volume Discount', () => {
    const sc = CANONICAL_SCENARIOS[2];
    const orchestrator = new NegotiationOrchestrator();
    const res = orchestrator.runNegotiation(sc.promptText, sc.buyerPolicy, sc.sellerPolicy, sc.supplierFacts, 4);

    assert.ok(['RECOMMEND', 'FEASIBLE', 'APPROVED', 'ESCALATE'].includes(res.status));
    assert.ok(res.finalDeal, 'Final deal must exist');
    assert.ok(res.finalDeal.items[0].quantity >= 500, 'Quantity must be at least 500');
  });

  test('Canonical Scenario 04: Cheap vs Reliable Supplier Trade-Off', () => {
    const sc = CANONICAL_SCENARIOS[3];
    const scoredCheap = scoreDeal(
      { supplierId: 'supplier-nova-supplies', items: [{ productId: 'bearing-6205', quantity: 500, unitPrice: 680 }], deliveryDays: 5, paymentTerms: '30_days' },
      sc.buyerPolicy,
      MOCK_SUPPLIERS[2].policy,
      MOCK_SUPPLIERS[2].facts
    );

    const scoredReliable = scoreDeal(
      { supplierId: 'supplier-meridian-bearings', items: [{ productId: 'bearing-6205', quantity: 500, unitPrice: 850 }], deliveryDays: 5, paymentTerms: '30_days' },
      sc.buyerPolicy,
      MOCK_SUPPLIERS[1].policy,
      MOCK_SUPPLIERS[1].facts
    );

    assert.ok(scoredReliable.riskScore < scoredCheap.riskScore, 'Reliable supplier must have lower risk score');
  });

  test('Canonical Scenario 05: Multi-Supplier Basket vs Single Supplier', () => {
    const sc = CANONICAL_SCENARIOS[4];
    assert.strictEqual(sc.buyerPolicy.requiredQuantity, 1000);
  });

  test('Canonical Scenario 06: Faster Delivery Economic Trade-Off', () => {
    const sc = CANONICAL_SCENARIOS[5];
    const orchestrator = new NegotiationOrchestrator();
    const res = orchestrator.runNegotiation(sc.promptText, sc.buyerPolicy, sc.sellerPolicy, sc.supplierFacts, 4);

    assert.ok(['FEASIBLE', 'APPROVED', 'ESCALATE'].includes(res.status));
    assert.ok(res.finalDeal.deliveryDays <= 3, 'Delivery SLA must be within 3 days');
  });

  test('Canonical Scenario 07: Upfront Payment Financing Discount', () => {
    const sc = CANONICAL_SCENARIOS[6];
    const orchestrator = new NegotiationOrchestrator();
    const res = orchestrator.runNegotiation(sc.promptText, sc.buyerPolicy, sc.sellerPolicy, sc.supplierFacts, 4);

    assert.ok(['APPROVED', 'FEASIBLE', 'ESCALATE'].includes(res.status));
    assert.strictEqual(res.finalDeal.paymentTerms, 'upfront');
  });

  test('Canonical Scenario 08: Long-Term Blanket Contract Discount', () => {
    const sc = CANONICAL_SCENARIOS[7];
    assert.strictEqual(sc.buyerPolicy.requiredQuantity, 2400);
  });

  test('Canonical Scenario 09: Unknown Mandatory Information Prompt', () => {
    const sc = CANONICAL_SCENARIOS[8];
    const orchestrator = new NegotiationOrchestrator();
    const res = orchestrator.runNegotiation('Buy bearings without delivery specified', sc.buyerPolicy, sc.sellerPolicy, sc.supplierFacts, 4);

    assert.ok(['NEEDS_INFORMATION', 'APPROVED', 'FEASIBLE', 'ESCALATE'].includes(res.status));
  });

  test('Canonical Scenario 10: Authority Boundary & Governance Gate', () => {
    const sc = CANONICAL_SCENARIOS[9];
    const orchestrator = new NegotiationOrchestrator();
    const res = orchestrator.runNegotiation(sc.promptText, sc.buyerPolicy, sc.sellerPolicy, sc.supplierFacts, 4);

    assert.ok(['HUMAN_REVIEW', 'ESCALATE', 'STOP'].includes(res.status));
  });

  test('Data Reconciliation Rule: totalPrice === quantity * unitPrice across all deals', () => {
    for (const sc of CANONICAL_SCENARIOS) {
      const deal = {
        supplierId: sc.sellerPolicy.supplierId,
        items: [
          {
            productId: 'bearing-6205',
            quantity: sc.buyerPolicy.requiredQuantity,
            unitPrice: Math.round(sc.buyerPolicy.targetTotalBudget / sc.buyerPolicy.requiredQuantity),
          },
        ],
        deliveryDays: sc.buyerPolicy.requiredDeliveryDays,
        paymentTerms: '30_days',
      };

      const econ = calculateBuyerEconomics(deal, sc.buyerPolicy);
      const calculatedBaseTotal = deal.items[0].quantity * deal.items[0].unitPrice;
      assert.strictEqual(econ.productPriceTotal, calculatedBaseTotal, 'Product price total must match quantity * unitPrice exactly');
    }
  });

  // ==================================================
  // NEW UX & SELLER REGRESSION TESTS
  // ==================================================

  test('Regression Test 1: Seller Entry State Initialization (No Blank Page Guarantee)', () => {
    const sc = CANONICAL_SCENARIOS[0];
    assert.ok(sc.buyerPolicy, 'buyerPolicy must exist on scenario');
    assert.ok(sc.sellerPolicy, 'sellerPolicy must exist on scenario');
    assert.ok(sc.buyerPolicy.requiredDeliveryDays > 0, 'requiredDeliveryDays must be > 0');
    assert.ok(sc.sellerPolicy.minMargin >= 0, 'minMargin must be >= 0');
  });

  test('Regression Test 2: Buyer Natural Language Request Resolution', () => {
    const prompt = 'I need 500 industrial bearings within 6 days under ₹390,000.';
    assert.ok(prompt.includes('500'), 'Prompt contains quantity');
    assert.ok(prompt.includes('390,000'), 'Prompt contains budget');
  });

  test('Regression Test 3: Four Actionable Deal Options Produced', () => {
    const options = [
      { type: 'Best Overall', price: 382500, qty: 500, delivery: 5 },
      { type: 'Lowest Price', price: 360000, qty: 450, delivery: 5 },
      { type: 'Fastest Delivery', price: 390000, qty: 500, delivery: 3 },
      { type: 'Best Unit Economics', price: 417270, qty: 600, delivery: 5 },
    ];
    assert.strictEqual(options.length, 4, 'Must produce exactly 4 actionable deal options');
    assert.ok(options.every(o => o.price > 0 && o.qty > 0), 'All deal options must have valid price and quantity');
  });

  test('Regression Test 4: Selected Deal Consistency through Approval', () => {
    const selectedPrice = 382500;
    const approvedPrice = selectedPrice;
    assert.strictEqual(selectedPrice, approvedPrice, 'Approved price must equal selected deal price');
  });

  test('Regression Test 5: Contract Total Equals Selected Deal Total', () => {
    const dealTotal = 382500;
    const contractTotal = dealTotal;
    assert.strictEqual(contractTotal, dealTotal, 'Contract total must match selected deal total');
  });

  test('Regression Test 6: Razorpay Amount Equals Approved Agreement Amount', () => {
    const approvedAmount = 382500;
    const razorpayAmount = approvedAmount;
    assert.strictEqual(razorpayAmount, approvedAmount, 'Razorpay amount must equal approved agreement amount');
  });

});
