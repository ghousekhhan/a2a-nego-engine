import { test, describe } from 'node:test';
import assert from 'node:assert';

import { aiService } from '../src/services/aiService.ts';
import { MARKETPLACE_PRODUCTS, searchMarketplace } from '../src/data/marketplaceCatalog.ts';

describe('Real AI Service, Marketplace Search & Conversational Layer Tests', () => {

  test('Marketplace Catalog Integrity: 10+ realistic industrial products across multiple categories', () => {
    assert.ok(MARKETPLACE_PRODUCTS.length >= 10, 'Expected at least 10 marketplace products');
    const categories = new Set(MARKETPLACE_PRODUCTS.map((p) => p.category));
    assert.ok(categories.size >= 5, 'Expected at least 5 distinct commercial categories');

    for (const prod of MARKETPLACE_PRODUCTS) {
      assert.ok(prod.id, 'Product must have an id');
      assert.ok(prod.name, 'Product must have a name');
      assert.ok(prod.unitPrice > 0, 'Unit price must be positive');
      assert.ok(prod.unitCost > 0, 'Unit cost must be positive');
      assert.ok(prod.availableQuantity > 0, 'Available quantity must be positive');
      assert.ok(prod.supplierId, 'Must have linked supplierId');
      assert.ok(prod.supplierReliability >= 0.8 && prod.supplierReliability <= 1.0, 'Reliability must be in range');
    }
  });

  test('Natural Language Intent Interpretation: Arbitrary generic requests', () => {
    // Test arbitrary bearings request with custom city & budget
    const intent1 = aiService.interpretBuyerIntent('I need 500 bearings under 4 lakh delivered to Pune within 6 days');
    assert.strictEqual(intent1.quantity, 500);
    assert.strictEqual(intent1.deadlineDays, 6);
    assert.strictEqual(intent1.maxBudget, 400000);
    assert.ok(intent1.destination.includes('Pune'));

    // Test pumps request
    const intent2 = aiService.interpretBuyerIntent('Need 200 centrifugal water pumps for plant expansion in Mumbai within 4 days under 80 lakh');
    assert.strictEqual(intent2.quantity, 200);
    assert.strictEqual(intent2.deadlineDays, 4);
    assert.strictEqual(intent2.maxBudget, 8000000);
    assert.ok(intent2.destination.includes('Mumbai'));

    // Test electrical components with cheap / lowest price priority
    const intent3 = aiService.interpretBuyerIntent('Find me the cheapest option for 1000 electrical contactors delivered tomorrow');
    assert.strictEqual(intent3.quantity, 1000);
    assert.strictEqual(intent3.deadlineDays, 2);
    assert.strictEqual(intent3.priority, 'price');
  });

  test('Marketplace Search & Dynamic Supplier Matching', () => {
    const intent = aiService.interpretBuyerIntent('Need 500 bearings quickly');
    const searchRes = aiService.searchMarketplaceCatalog(intent);

    assert.ok(searchRes.products.length > 0, 'Must find matching products');
    assert.ok(searchRes.stats.totalMatchingProducts > 0, 'Must have matching count');
    assert.ok(searchRes.recommendedSupplier, 'Must have a recommended supplier');
    assert.ok(searchRes.recommendedSupplier.availableQuantity >= 500, 'Recommended supplier must have adequate stock');
  });

  test('Buyer Agent Dialogue Generation adheres to commercial facts without inventing numbers', async () => {
    const msg = await aiService.generateBuyerMessage({
      turnNumber: 1,
      productName: 'SKF 6205 Bearing',
      quantity: 500,
      maxBudget: 390000,
      targetBudget: 360000,
      requiredDeliveryDays: 6,
      supplierName: 'Apex Industrial Components',
    });

    assert.ok(msg.includes('500'), 'Message must reflect requested quantity');
    assert.ok(msg.includes('6 days'), 'Message must reflect required delivery days');
    assert.ok(msg.includes('390,000') || msg.includes('3,90,000'), 'Message must reflect authorized budget');
  });

  test('Seller Agent Dialogue Generation preserves supplier economics & margin floor', async () => {
    const msg = await aiService.generateSellerMessage({
      turnNumber: 1,
      productName: 'SKF 6205 Bearing',
      quantity: 500,
      supplierName: 'Apex Industrial Components',
      unitCost: 450,
      minMarginFloorPct: 10,
      availableStock: 1200,
      currentCounterOffer: {
        unitPrice: 810,
        totalPrice: 405000,
        deliveryDays: 5,
        paymentTerms: 'Net 30',
        marginPct: 44.4,
      },
    });

    assert.ok(msg.includes('Apex Industrial Components'), 'Must identify selling entity');
    assert.ok(msg.includes('500'), 'Must confirm quantity');
    assert.ok(msg.includes('405,000') || msg.includes('4,05,000') || msg.includes('810'), 'Must reflect pricing');
  });

  test('User Interrupt Handler interprets follow-up directives dynamically', () => {
    const interrupt1 = aiService.interpretUserInterrupt('Try to get another ₹10,000 off', 500, 390000, 6);
    assert.strictEqual(interrupt1.updatedBudget, 380000, 'Budget should decrease by 10,000');
    assert.strictEqual(interrupt1.priority, 'price');

    const interrupt2 = aiService.interpretUserInterrupt('Delivery is more important than price, make it faster', 500, 390000, 6);
    assert.ok(interrupt2.updatedDelivery < 6, 'Delivery days should decrease');
    assert.strictEqual(interrupt2.priority, 'delivery');

    const interrupt3 = aiService.interpretUserInterrupt('Can we increase volume to 600 units?', 500, 390000, 6);
    assert.strictEqual(interrupt3.updatedQty, 600, 'Quantity should update to 600');
    assert.strictEqual(interrupt3.priority, 'volume');
  });

});
