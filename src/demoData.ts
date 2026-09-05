import type { BuyerPolicy, SellerPolicy, SupplierFacts, CanonicalDeal } from './types/index.ts';

export const SEEDED_PRODUCT = {
  productId: 'bearing-6205',
  name: 'SKF 6205-2RS1 Deep Groove Ball Bearing',
  specification: '25mm x 52mm x 15mm, Rubber Sealed, C3 Clearance, Dynamic Load 14.8kN',
  category: 'Industrial MRO / Power Transmission',
};

export const SEEDED_BUYER_POLICY: BuyerPolicy = {
  maxTotalBudget: 400000, // ₹4.0L Max Authority Ceiling
  targetTotalBudget: 360000, // ₹3.6L Target Budget
  requiredQuantity: 500,
  minQuantity: 450,
  maxQuantity: 650,
  preferredQuantity: 550,
  requiredDeliveryDays: 5,
  latestAcceptableDeliveryDays: 5,
  preferredDeliveryDays: 4,
  minSupplierReliability: 0.85,
  requiredCertification: true,
  weights: {
    price: 0.45,
    delivery: 0.25,
    quality: 0.15,
    reliability: 0.15,
  },
  humanApprovalThreshold: 350000,
};

export const SEEDED_SELLER_POLICY: SellerPolicy = {
  supplierId: 'supplier-alpha-mro',
  products: {
    'bearing-6205': {
      productId: 'bearing-6205',
      productCost: 450, // ₹450 unit cost
      basePrice: 820, // ₹820 base price
      operatingCostPerUnit: 15,
      availableInventory: 1200,
    },
  },
  targetMargin: 0.22,
  minMargin: 0.10, // Minimum profit margin floor = 10% (Floor unit price ≈ ₹516)
  paymentTerms: ['upfront', '15_days', '30_days'],
  expediteCostPerOrder: 3500,
  annualCostOfCapital: 0.12,
  inventoryPressure: 'high',
  weights: {
    profit: 0.40,
    volume: 0.30,
    cashflow: 0.15,
    inventory: 0.10,
    customer: 0.05,
    risk: 0.05,
  },
  humanApprovalRequiredAbove: 500000,
};

export const SEEDED_SUPPLIER_FACTS: SupplierFacts = {
  supplierId: 'supplier-alpha-mro',
  reliabilityScore: 0.96, // 96% Reliability
  qualityScore: 0.94, // 94% Quality
  deliveryVarianceDays: 0.5,
  certificationAvailable: true, // ISO 9001 & CE Certified
};

// Seeded Round 1 Deal: 500 units @ ₹820/unit = ₹410,000
export const ROUND1_DEAL: CanonicalDeal = {
  id: 'deal-r1',
  supplierId: 'supplier-alpha-mro',
  items: [{ productId: 'bearing-6205', quantity: 500, unitPrice: 820 }],
  deliveryDays: 5,
  paymentTerms: '30_days',
  contractMonths: 1,
};

// Seeded Round 2 Deal: 550 units @ ₹718.181818.../unit = ₹395,000
export const ROUND2_DEAL: CanonicalDeal = {
  id: 'deal-r2',
  supplierId: 'supplier-alpha-mro',
  items: [{ productId: 'bearing-6205', quantity: 550, unitPrice: 395000 / 550 }],
  deliveryDays: 5,
  paymentTerms: '30_days',
  contractMonths: 1,
};

// Seeded Round 3 / Final Approved Deal: 550 units @ ₹695.454545.../unit = ₹382,500
export const ROUND3_DEAL: CanonicalDeal = {
  id: 'deal-r3-final',
  supplierId: 'supplier-alpha-mro',
  items: [{ productId: 'bearing-6205', quantity: 550, unitPrice: 382500 / 550 }],
  deliveryDays: 4,
  paymentTerms: 'upfront',
  contractMonths: 1,
  expeditedDelivery: true,
  conditions: ['quantity >= 550', 'payment = upfront'],
};
