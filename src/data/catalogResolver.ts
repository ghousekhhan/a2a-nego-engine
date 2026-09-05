import type { BuyerPolicy, SellerPolicy, SupplierFacts } from '../types/index.ts';
import { MOCK_SUPPLIERS, type SupplierCatalogEntry } from './mockSuppliers.ts';

export interface CatalogItem {
  productId: string;
  name: string;
  category: string;
  defaultUnitPrice: number;
  specification: string;
  keywords: string[];
}

export const DETERMINISTIC_CATALOG: CatalogItem[] = [
  {
    productId: 'bearing-6205',
    name: 'SKF 6205-2RS1 Deep Groove Ball Bearing',
    category: 'Industrial Bearings & MRO',
    defaultUnitPrice: 820,
    specification: '25mm x 52mm x 15mm, Rubber Sealed, C3 Clearance',
    keywords: ['bearing', 'bearings', 'skf', 'ball bearing', 'groove'],
  },
  {
    productId: 'motor-ac-15kw',
    name: 'Siemens 15kW 3-Phase AC Induction Motor',
    category: 'Motors & Drives',
    defaultUnitPrice: 42000,
    specification: '15kW, 4-Pole, 1470 RPM, IE3 Premium Efficiency',
    keywords: ['motor', 'motors', 'induction', 'siemens', 'ac motor', 'drive'],
  },
  {
    productId: 'sensor-temp-pt100',
    name: 'Honeywell Industrial PT100 Temperature Sensor',
    category: 'Sensors & Instrumentation',
    defaultUnitPrice: 2400,
    specification: 'Class A RTD, 4-20mA Transmitter, Stainless Steel Probe',
    keywords: ['sensor', 'sensors', 'pt100', 'temperature', 'honeywell', 'rtd'],
  },
  {
    productId: 'valve-gate-3inch',
    name: 'Kirloskar 3-Inch Forged Steel Gate Valve',
    category: 'Valves & Hydraulics',
    defaultUnitPrice: 6500,
    specification: 'Class 300, Flanged Ends, Stellite Faced Trim',
    keywords: ['valve', 'valves', 'gate valve', 'kirloskar', 'flanged'],
  },
  {
    productId: 'fastener-m12-bolt',
    name: 'Unbrako M12x50 High-Tensile Hex Bolts (Box of 100)',
    category: 'Fasteners & Hardware',
    defaultUnitPrice: 1850,
    specification: 'Grade 10.9 Alloy Steel, Zinc Plated, DIN 933',
    keywords: ['fastener', 'fasteners', 'bolt', 'bolts', 'unbrako', 'hex'],
  },
  {
    productId: 'pump-centrifugal-5hp',
    name: 'Crompton 5HP Heavy-Duty Centrifugal Water Pump',
    category: 'Pumps & Fluid Handling',
    defaultUnitPrice: 38000,
    specification: '5HP, 3-Phase, Monoblock, 50m Head, Cast Iron Body',
    keywords: ['pump', 'pumps', 'centrifugal', 'crompton', 'water pump'],
  },
];

export interface ResolvedCommercialRequest {
  catalogItem: CatalogItem;
  matchedSupplier: SupplierCatalogEntry;
  quantity: number;
  targetBudget: number;
  maxBudget: number;
  deliveryDays: number;
  paymentPreference: string;
  buyerPolicy: BuyerPolicy;
  sellerPolicy: SellerPolicy;
  supplierFacts: SupplierFacts;
}

/**
 * Deterministically parses natural language input and resolves catalog item & supplier
 */
export function resolveCommercialRequest(
  inputText: string,
  preferredSupplierId?: string
): ResolvedCommercialRequest {
  const text = inputText.toLowerCase();

  // 1. Resolve Catalog Item by keyword matching
  let matchedItem = DETERMINISTIC_CATALOG[0];
  for (const item of DETERMINISTIC_CATALOG) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      matchedItem = item;
      break;
    }
  }

  // 2. Parse Quantity (default: 500)
  let quantity = 500;
  const qtyMatch = text.match(/(\d+)\s*(units|pcs|bearings|motors|sensors|valves|bolts|pumps|items)/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  // 3. Parse Target Budget (default: calculated from catalog base price * quantity * 0.9)
  let targetBudget = Math.round(quantity * matchedItem.defaultUnitPrice * 0.88);
  const budgetMatch = text.match(/(₹|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|l)?/i);
  if (budgetMatch) {
    let val = parseFloat(budgetMatch[2].replace(/,/g, ''));
    if (budgetMatch[3] && budgetMatch[3].toLowerCase().startsWith('l')) {
      val *= 100000;
    }
    targetBudget = val;
  }

  // 4. Parse Delivery Days (default: 5 days)
  let deliveryDays = 5;
  const deliveryMatch = text.match(/(\d+)\s*(days|day|d)\b/i);
  if (deliveryMatch) {
    deliveryDays = parseInt(deliveryMatch[1], 10);
  }

  const maxBudget = Math.round(targetBudget * 1.12);

  // 5. Select Supplier deterministically
  const matchedSupplier =
    MOCK_SUPPLIERS.find((s) => s.supplierId === preferredSupplierId) ||
    MOCK_SUPPLIERS[0];

  const buyerPolicy: BuyerPolicy = {
    maxTotalBudget: maxBudget,
    targetTotalBudget: targetBudget,
    requiredQuantity: quantity,
    minQuantity: Math.round(quantity * 0.9),
    maxQuantity: Math.round(quantity * 1.2),
    preferredQuantity: quantity,
    requiredDeliveryDays: deliveryDays,
    latestAcceptableDeliveryDays: deliveryDays,
    preferredDeliveryDays: Math.max(1, deliveryDays - 1),
    minSupplierReliability: 0.85,
    requiredCertification: true,
    weights: { price: 0.45, delivery: 0.25, quality: 0.15, reliability: 0.15 },
    humanApprovalThreshold: 350000,
  };

  return {
    catalogItem: matchedItem,
    matchedSupplier,
    quantity,
    targetBudget,
    maxBudget,
    deliveryDays,
    paymentPreference: '30_days',
    buyerPolicy,
    sellerPolicy: matchedSupplier.policy,
    supplierFacts: matchedSupplier.facts,
  };
}
