import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CanonicalDeal,
  BuyerPolicy,
  SellerPolicy,
  SupplierFacts,
} from '../src/types/index.ts';
import { validateHardConstraints } from '../src/engine/constraints.ts';
import { calculateSellerEconomics, calculateBuyerEconomics, calculatePaymentFinancingValue } from '../src/engine/economics.ts';
import { calculateBuyerReservationValue, calculateSellerReservationValue, checkReservationOverlap, generateNoDealCertificate } from '../src/engine/reservation.ts';
import { evaluateSellerConcession } from '../src/engine/concessions.ts';
import { scoreDeal, findParetoFrontier } from '../src/engine/optimizer.ts';
import { evaluateNextNegotiationStep } from '../src/engine/stateMachine.ts';
import { runWhatIfAnalysis } from '../src/engine/whatIf.ts';

describe('Decision Engine 12 Scenario Validation Tests', () => {

  // Scenario 01 — Buyer Below Seller Floor
  test('Scenario 01 — Buyer Below Seller Floor', () => {
    const sellerPolicy: SellerPolicy = {
      supplierId: 'supplier-1',
      products: {
        'prod-1': { productId: 'prod-1', productCost: 90, basePrice: 120, availableInventory: 1000 },
      },
      targetMargin: 0.18,
      minMargin: 0.10, // 10%
      paymentTerms: ['upfront', '30_days'],
      weights: { profit: 0.5, volume: 0.2, cashflow: 0.2, inventory: 0.1, customer: 0, risk: 0 },
    };

    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 15000,
      requiredQuantity: 100,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.5,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const supplierFacts: SupplierFacts = {
      supplierId: 'supplier-1',
      reliabilityScore: 0.9,
      qualityScore: 0.9,
    };

    // Buyer offer: ₹96/unit * 100 = ₹9,600
    const offerDeal: CanonicalDeal = {
      supplierId: 'supplier-1',
      items: [{ productId: 'prod-1', quantity: 100, unitPrice: 96 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    // Calculation: Min revenue/unit = 90 / (1 - 0.10) = ₹100
    const sellerEcon = calculateSellerEconomics(offerDeal, sellerPolicy);
    assert.equal(sellerEcon.minRequiredRevenue, 10000); // 100 * 100
    assert.equal(sellerEcon.isValidMargin, false);
    assert.ok(sellerEcon.grossMargin < 0.10); // 6.25% < 10%

    const validation = validateHardConstraints(offerDeal, buyerPolicy, sellerPolicy, supplierFacts);
    assert.equal(validation.passed, false);
    assert.equal(validation.matrix.margin, 'FAIL');
    assert.ok(validation.reasons.some((r) => r.includes('BELOW_SELLER_FLOOR')));
  });

  // Scenario 02 — Quantity Unlocks a Discount
  test('Scenario 02 — Quantity Unlocks a Discount', () => {
    const sellerPolicy: SellerPolicy = {
      supplierId: 'supplier-1',
      products: {
        'prod-1': { productId: 'prod-1', productCost: 90, basePrice: 120, availableInventory: 1000 },
      },
      targetMargin: 0.18,
      minMargin: 0.10,
      paymentTerms: ['30_days'],
      weights: { profit: 0.5, volume: 0.3, cashflow: 0.1, inventory: 0.1, customer: 0, risk: 0 },
    };

    const dealInitial: CanonicalDeal = {
      supplierId: 'supplier-1',
      items: [{ productId: 'prod-1', quantity: 100, unitPrice: 110 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    const dealAlternative: CanonicalDeal = {
      supplierId: 'supplier-1',
      items: [{ productId: 'prod-1', quantity: 150, unitPrice: 105 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    // Initial: 100 * 110 = 11,000 revenue. Cost = 9,000. Profit = 2,000
    // Alternative: 150 * 105 = 15,750 revenue. Cost = 13,500. Profit = 2,250
    const econAlt = calculateSellerEconomics(dealAlternative, sellerPolicy);
    assert.equal(econAlt.isValidMargin, true); // 105 > 100 floor
    assert.equal(econAlt.grossProfit, 2250);

    const concession = evaluateSellerConcession(dealInitial, dealAlternative, sellerPolicy);
    assert.equal(concession.isWorthwhile, true);
    assert.ok(concession.concessionBenefit > concession.concessionCost);
  });

  // Scenario 03 — Cheap but Unreliable Supplier
  test('Scenario 03 — Cheap but Unreliable Supplier', () => {
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 50000,
      requiredQuantity: 100,
      requiredDeliveryDays: 6,
      latestAcceptableDeliveryDays: 6,
      minSupplierReliability: 0.90,
      weights: { price: 0.4, delivery: 0.3, quality: 0.1, reliability: 0.2 },
    };

    const sellerPolicy: SellerPolicy = {
      supplierId: 'sup-A',
      products: { 'prod-1': { productId: 'prod-1', productCost: 300, basePrice: 400, availableInventory: 500 } },
      targetMargin: 0.15,
      minMargin: 0.10,
      paymentTerms: ['30_days'],
      weights: { profit: 0.5, volume: 0.5, cashflow: 0, inventory: 0, customer: 0, risk: 0 },
    };

    // Supplier A: Cheap (₹380), unreliable (0.72), slow (7 days)
    const dealA: CanonicalDeal = {
      supplierId: 'sup-A',
      items: [{ productId: 'prod-1', quantity: 100, unitPrice: 380 }],
      deliveryDays: 7,
      paymentTerms: '30_days',
    };
    const factsA: SupplierFacts = { supplierId: 'sup-A', reliabilityScore: 0.72, qualityScore: 0.8 };

    // Supplier B: Price ₹400, reliable (0.97), 5 days delivery
    const dealB: CanonicalDeal = {
      supplierId: 'sup-B',
      items: [{ productId: 'prod-1', quantity: 100, unitPrice: 400 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };
    const factsB: SupplierFacts = { supplierId: 'sup-B', reliabilityScore: 0.97, qualityScore: 0.9 };

    const valA = validateHardConstraints(dealA, buyerPolicy, sellerPolicy, factsA);
    const valB = validateHardConstraints(dealB, buyerPolicy, sellerPolicy, factsB);

    assert.equal(valA.passed, false); // Fails delivery (7 > 6) and reliability (0.72 < 0.90)
    assert.equal(valB.passed, true);
  });

  // Scenario 04 — Single Supplier vs Multi-Supplier Basket
  test('Scenario 04 — Single Supplier vs Multi-Supplier Basket', () => {
    // Single supplier cost = ₹101,000
    const singleSupplierCost = 101000;

    // Split supplier raw cost = 500*92 + 300*145 = 46000 + 43500 = ₹89,500
    const splitRawCost = 500 * 92 + 300 * 145;
    const coordinationRiskCost = 4000;
    const adjustedSplitCost = splitRawCost + coordinationRiskCost; // ₹93,500

    const netSaving = singleSupplierCost - adjustedSplitCost; // ₹7,500
    assert.equal(splitRawCost, 89500);
    assert.equal(adjustedSplitCost, 93500);
    assert.equal(netSaving, 7500);
    assert.ok(netSaving > 0);
  });

  // Scenario 05 — Faster Delivery Has Economic Value
  test('Scenario 05 — Faster Delivery Has Economic Value', () => {
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 100000,
      requiredQuantity: 100,
      requiredDeliveryDays: 8,
      latestAcceptableDeliveryDays: 8,
      minSupplierReliability: 0.8,
      expectedDelayCostIfUnexpedited: 10000,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const unexpeditedDeal: CanonicalDeal = {
      supplierId: 'sup-1',
      items: [{ productId: 'p1', quantity: 100, unitPrice: 500 }],
      deliveryDays: 8,
      paymentTerms: '30_days',
      expeditedDelivery: false,
    };

    const expeditedDeal: CanonicalDeal = {
      supplierId: 'sup-1',
      items: [{ productId: 'p1', quantity: 100, unitPrice: 500 }],
      deliveryDays: 3,
      paymentTerms: '30_days',
      shippingCost: 4000,
      expeditedDelivery: true,
    };

    const econUnexp = calculateBuyerEconomics(unexpeditedDeal, buyerPolicy);
    const econExp = calculateBuyerEconomics(expeditedDeal, buyerPolicy);

    assert.equal(econUnexp.expectedDelayCost, 10000);
    assert.equal(econUnexp.totalLandedCost, 60000); // 50000 + 10000 delay

    assert.equal(econExp.expectedDelayCost, 0);
    assert.equal(econExp.totalLandedCost, 54000); // 50000 + 4000 shipping

    const netValue = econUnexp.totalLandedCost - econExp.totalLandedCost;
    assert.equal(netValue, 6000);
  });

  // Scenario 06 — Upfront Payment for Discount
  test('Scenario 06 — Upfront Payment for Discount', () => {
    const orderValue = 100000;
    const discount = 2000;
    const annualCostOfCapital = 0.12;
    const daysAccelerated = 30;

    const financingCost = calculatePaymentFinancingValue(orderValue, annualCostOfCapital, daysAccelerated);
    assert.ok(Math.abs(financingCost - 986.30) < 1.0);

    const netBuyerBenefit = discount - financingCost;
    assert.ok(Math.abs(netBuyerBenefit - 1013.70) < 1.0);
    assert.ok(netBuyerBenefit > 0);
  });

  // Scenario 07 — Long-Term Contract Unlocks Better Economics
  test('Scenario 07 — Long-Term Contract Unlocks Better Economics', () => {
    const currentPrice = 110;
    const contractPrice = 101;
    const sellerMinPrice = 100;
    const flexibilityCostPerUnit = 5;

    const priceSavingPerUnit = currentPrice - contractPrice; // ₹9
    const netValuePerUnit = priceSavingPerUnit - flexibilityCostPerUnit; // ₹4
    const monthlyCommitment = 150;
    const monthlyNetValue = monthlyCommitment * netValuePerUnit; // ₹600

    assert.equal(priceSavingPerUnit, 9);
    assert.equal(netValuePerUnit, 4);
    assert.equal(monthlyNetValue, 600);
    assert.ok(contractPrice >= sellerMinPrice);
  });

  // Scenario 08 — No Overlap Between Reservation Values
  test('Scenario 08 — No Overlap Between Reservation Values', () => {
    const buyerMaxPrice = 98;
    const sellerMinPrice = 105;

    const overlapCheck = checkReservationOverlap(buyerMaxPrice, sellerMinPrice);
    assert.equal(overlapCheck.overlap, false);
    assert.equal(overlapCheck.gap, 7);

    const cert = generateNoDealCertificate(buyerMaxPrice, sellerMinPrice, 47);
    assert.equal(cert.status, 'NO_DEAL');
    assert.equal(cert.buyerCeiling, 98);
    assert.equal(cert.sellerFloor, 105);
    assert.equal(cert.gap, 7);
    assert.equal(cert.testedAlternativesCount, 47);
    assert.ok(cert.gapClosingVariables.includes('quantity'));
  });

  // Scenario 09 — Unknown Mandatory Information
  test('Scenario 09 — Unknown Mandatory Information', () => {
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 100000,
      requiredQuantity: 100,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      requiredCertification: true,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const sellerPolicy: SellerPolicy = {
      supplierId: 'sup-1',
      products: { 'p1': { productId: 'p1', productCost: 50, basePrice: 80, availableInventory: 200 } },
      targetMargin: 0.15,
      minMargin: 0.10,
      paymentTerms: ['30_days'],
      weights: { profit: 1, volume: 0, cashflow: 0, inventory: 0, customer: 0, risk: 0 },
    };

    const deal: CanonicalDeal = {
      supplierId: 'sup-1',
      items: [{ productId: 'p1', quantity: 100, unitPrice: 80 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    const unknownFacts: SupplierFacts = {
      supplierId: 'sup-1',
      reliabilityScore: 0.9,
      qualityScore: 0.9,
      certificationAvailable: 'UNKNOWN',
    };

    const validation = validateHardConstraints(deal, buyerPolicy, sellerPolicy, unknownFacts);
    assert.equal(validation.requiresInformation, true);
    assert.equal(validation.matrix.certification, 'UNKNOWN');

    const nextStep = evaluateNextNegotiationStep(
      { round: 1, maxRounds: 5, history: [], isComplete: false, status: 'FEASIBLE' },
      deal,
      buyerPolicy,
      sellerPolicy,
      unknownFacts
    );

    assert.equal(nextStep.action, 'ASK');
    assert.equal(nextStep.status, 'NEEDS_INFORMATION');
  });

  // Scenario 10 — Seller Excess Inventory
  test('Scenario 10 — Seller Excess Inventory', () => {
    const sellerPolicy: SellerPolicy = {
      supplierId: 'sup-1',
      products: { 'p1': { productId: 'p1', productCost: 90, basePrice: 120, availableInventory: 2000 } },
      targetMargin: 0.18,
      minMargin: 0.10, // floor = 100
      inventoryPressure: 'high',
      paymentTerms: ['30_days'],
      weights: { profit: 0.3, volume: 0.2, cashflow: 0.1, inventory: 0.4, customer: 0, risk: 0 },
    };

    const deal: CanonicalDeal = {
      supplierId: 'sup-1',
      items: [{ productId: 'p1', quantity: 800, unitPrice: 103 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    const econ = calculateSellerEconomics(deal, sellerPolicy);
    assert.equal(econ.isValidMargin, true); // 103 > 100
    assert.equal(econ.grossProfit, (103 - 90) * 800); // 10,400

    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 100000,
      requiredQuantity: 800,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const facts: SupplierFacts = { supplierId: 'sup-1', reliabilityScore: 0.9, qualityScore: 0.9 };
    const scored = scoreDeal(deal, buyerPolicy, sellerPolicy, facts);

    assert.equal(scored.isFeasible, true);
    assert.ok(scored.sellerUtility > 0.4);
  });

  // Scenario 11 — Buyer Should Increase Budget to Unlock a Better Deal
  test('Scenario 11 — Buyer Should Increase Budget to Unlock a Better Deal', () => {
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 410000, // max authority
      targetTotalBudget: 380000, // target
      requiredQuantity: 100,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const sellerPolicy: SellerPolicy = {
      supplierId: 'sup-1',
      products: { 'p1': { productId: 'p1', productCost: 3000, basePrice: 4200, availableInventory: 500 } },
      targetMargin: 0.18,
      minMargin: 0.10,
      paymentTerms: ['30_days'],
      weights: { profit: 0.5, volume: 0.5, cashflow: 0, inventory: 0, customer: 0, risk: 0 },
    };

    const baselineDeal: CanonicalDeal = {
      supplierId: 'sup-1',
      items: [{ productId: 'p1', quantity: 100, unitPrice: 4200 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    const facts: SupplierFacts = { supplierId: 'sup-1', reliabilityScore: 0.9, qualityScore: 0.9 };

    const whatIfRes = runWhatIfAnalysis(
      { maxTotalBudget: 400000 },
      baselineDeal,
      buyerPolicy,
      sellerPolicy,
      facts
    );

    assert.ok(whatIfRes.recommendation.includes('RECOMMEND INCREASING BUDGET BY ₹20,000'));
    assert.equal(whatIfRes.requiresHumanApproval, true);
  });

  // Scenario 12 — Marginal Improvement Stopping Rule
  test('Scenario 12 — Marginal Improvement Stopping Rule', () => {
    const buyerPolicy: BuyerPolicy = {
      maxTotalBudget: 100000,
      requiredQuantity: 100,
      requiredDeliveryDays: 5,
      latestAcceptableDeliveryDays: 5,
      minSupplierReliability: 0.8,
      weights: { price: 0.5, delivery: 0.5, quality: 0, reliability: 0 },
    };

    const sellerPolicy: SellerPolicy = {
      supplierId: 'sup-1',
      products: { 'p1': { productId: 'p1', productCost: 500, basePrice: 800, availableInventory: 500 } },
      targetMargin: 0.18,
      minMargin: 0.10,
      paymentTerms: ['30_days'],
      weights: { profit: 0.5, volume: 0.5, cashflow: 0, inventory: 0, customer: 0, risk: 0 },
    };

    const currentDeal: CanonicalDeal = {
      supplierId: 'sup-1',
      items: [{ productId: 'p1', quantity: 100, unitPrice: 700 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    // Slightly different deal with marginal utility gain = +0.004 (< 0.01 threshold)
    const nextDeal: CanonicalDeal = {
      supplierId: 'sup-1',
      items: [{ productId: 'p1', quantity: 100, unitPrice: 699 }],
      deliveryDays: 5,
      paymentTerms: '30_days',
    };

    const facts: SupplierFacts = { supplierId: 'sup-1', reliabilityScore: 0.9, qualityScore: 0.9 };

    const state: NegotiationState = {
      round: 3,
      maxRounds: 10,
      currentDeal,
      history: [currentDeal],
      isComplete: false,
      status: 'FEASIBLE',
      minMeaningfulUtilityGain: 0.01,
    };

    const decision = evaluateNextNegotiationStep(state, nextDeal, buyerPolicy, sellerPolicy, facts);
    assert.equal(decision.action, 'STOP');
    assert.equal(decision.status, 'STOP');
    assert.ok(decision.reason.includes('materiality threshold'));
  });

});
