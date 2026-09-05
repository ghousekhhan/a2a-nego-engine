export interface MarketplaceProduct {
  id: string;
  name: string;
  category: string;
  sku: string;
  specification: string;
  unitPrice: number;
  unitCost: number;
  minMargin: number;
  availableQuantity: number;
  supplierId: string;
  supplierName: string;
  supplierReliability: number;
  deliveryDaysCapability: number;
  location: string;
  quantityBreaks: { minQty: number; discountPct: number }[];
  paymentTerms: string[];
  certifications: string[];
  keywords: string[];
}

export const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  // 1. Industrial Bearings
  {
    id: 'prod-bearing-6205-apex',
    name: 'SKF 6205-2RS1 Deep Groove Ball Bearing',
    category: 'Industrial Bearings & MRO',
    sku: 'SKF-6205-RS1',
    specification: '25mm x 52mm x 15mm, Rubber Sealed, C3 Radial Clearance, Chrome Steel',
    unitPrice: 810,
    unitCost: 450,
    minMargin: 0.10,
    availableQuantity: 1200,
    supplierId: 'supplier-apex-mro',
    supplierName: 'Apex Industrial Components',
    supplierReliability: 0.96,
    deliveryDaysCapability: 5,
    location: 'Pune, Maharashtra',
    quantityBreaks: [
      { minQty: 500, discountPct: 0.055 },
      { minQty: 600, discountPct: 0.141 },
      { minQty: 1000, discountPct: 0.180 },
    ],
    paymentTerms: ['upfront', '15_days', '30_days'],
    certifications: ['ISO 9001:2015', 'SKF Certified Distributor'],
    keywords: ['bearing', 'bearings', 'ball bearing', 'skf', '6205', 'groove', 'pune', 'mro'],
  },
  {
    id: 'prod-bearing-6205-meridian',
    name: 'NSK Precision 6205 High-Load Ball Bearing',
    category: 'Industrial Bearings & MRO',
    sku: 'NSK-6205-DDU',
    specification: '25mm x 52mm x 15mm, Dual Contact Seals, High Speed Grease Fill',
    unitPrice: 850,
    unitCost: 480,
    minMargin: 0.12,
    availableQuantity: 2500,
    supplierId: 'supplier-meridian-bearings',
    supplierName: 'Meridian Bearings & Transmission',
    supplierReliability: 0.985,
    deliveryDaysCapability: 3,
    location: 'Mumbai, Maharashtra',
    quantityBreaks: [
      { minQty: 500, discountPct: 0.082 },
      { minQty: 1000, discountPct: 0.150 },
    ],
    paymentTerms: ['upfront', '30_days', '60_days'],
    certifications: ['ISO 9001', 'OEM Direct Accreditation'],
    keywords: ['bearing', 'bearings', 'nsk', 'precision', 'high load', 'express', 'mumbai'],
  },
  {
    id: 'prod-bearing-6205-nova',
    name: 'General Purpose 6205-ZZ Shielded Bearing',
    category: 'Industrial Bearings & MRO',
    sku: 'GEN-6205-ZZ',
    specification: '25mm x 52mm x 15mm, Metal Shielded, Standard Carbon Steel',
    unitPrice: 680,
    unitCost: 400,
    minMargin: 0.08,
    availableQuantity: 800,
    supplierId: 'supplier-nova-supplies',
    supplierName: 'Nova MRO Discount Supplies',
    supplierReliability: 0.82,
    deliveryDaysCapability: 7,
    location: 'Ahmedabad, Gujarat',
    quantityBreaks: [
      { minQty: 400, discountPct: 0.05 },
      { minQty: 800, discountPct: 0.10 },
    ],
    paymentTerms: ['upfront', '15_days'],
    certifications: ['Standard Factory Compliance'],
    keywords: ['bearing', 'bearings', 'budget', 'cheap', 'lowest price', 'discount', '6205'],
  },

  // 2. Pumps & Fluid Handling
  {
    id: 'prod-pump-centrifugal-5hp',
    name: 'Crompton 5HP Heavy-Duty Centrifugal Water Pump',
    category: 'Pumps & Fluid Handling',
    sku: 'CRP-5HP-CENT',
    specification: '5HP, 3-Phase 415V, Monoblock, 50m Head, 1200 LPM, Cast Iron Impeller',
    unitPrice: 38500,
    unitCost: 24000,
    minMargin: 0.12,
    availableQuantity: 240,
    supplierId: 'supplier-apex-mro',
    supplierName: 'Apex Industrial Components',
    supplierReliability: 0.95,
    deliveryDaysCapability: 5,
    location: 'Pune, Maharashtra',
    quantityBreaks: [
      { minQty: 10, discountPct: 0.05 },
      { minQty: 50, discountPct: 0.10 },
      { minQty: 100, discountPct: 0.15 },
    ],
    paymentTerms: ['upfront', '30_days'],
    certifications: ['BEE 5-Star Energy Certified', 'ISO 9001'],
    keywords: ['pump', 'pumps', 'centrifugal', 'water pump', 'crompton', 'fluid', 'monoblock'],
  },
  {
    id: 'prod-pump-submersible-3hp',
    name: 'Kirloskar 3HP Submersible Borewell Pump Set',
    category: 'Pumps & Fluid Handling',
    sku: 'KIRL-SUB-3HP',
    specification: '3HP, 10-Stage, Stainless Steel 304 Jacket, 80m Head Capacity',
    unitPrice: 28900,
    unitCost: 18500,
    minMargin: 0.11,
    availableQuantity: 310,
    supplierId: 'supplier-meridian-bearings',
    supplierName: 'Meridian Fluid Systems',
    supplierReliability: 0.97,
    deliveryDaysCapability: 4,
    location: 'Ahmedabad, Gujarat',
    quantityBreaks: [
      { minQty: 20, discountPct: 0.06 },
      { minQty: 50, discountPct: 0.12 },
    ],
    paymentTerms: ['upfront', '30_days', '60_days'],
    certifications: ['ISI Marked', 'ISO 9001'],
    keywords: ['pump', 'pumps', 'submersible', 'kirloskar', 'borewell', 'water'],
  },

  // 3. Motors & Drives
  {
    id: 'prod-motor-15kw-siemens',
    name: 'Siemens 15kW 3-Phase AC Induction Motor',
    category: 'Motors & Drives',
    sku: 'SIE-15KW-IE3',
    specification: '15kW (20HP), 4-Pole, 1475 RPM, Foot Mounted (B3), IE3 Premium Efficiency',
    unitPrice: 42500,
    unitCost: 28000,
    minMargin: 0.12,
    availableQuantity: 150,
    supplierId: 'supplier-apex-mro',
    supplierName: 'Apex Industrial Components',
    supplierReliability: 0.96,
    deliveryDaysCapability: 5,
    location: 'Pune, Maharashtra',
    quantityBreaks: [
      { minQty: 10, discountPct: 0.06 },
      { minQty: 25, discountPct: 0.12 },
    ],
    paymentTerms: ['upfront', '30_days'],
    certifications: ['IE3 Certified', 'CE', 'UL Listed'],
    keywords: ['motor', 'motors', 'siemens', 'induction motor', 'drive', '15kw', 'ac motor'],
  },
  {
    id: 'prod-motor-vfd-11kw',
    name: 'ABB 11kW Variable Frequency Drive (VFD)',
    category: 'Motors & Drives',
    sku: 'ABB-ACS580-11KW',
    specification: '11kW / 15HP, 3-Phase 380-480V, IP21 Enclosure, Built-in Modbus RTU',
    unitPrice: 34200,
    unitCost: 22500,
    minMargin: 0.10,
    availableQuantity: 190,
    supplierId: 'supplier-precision-tech',
    supplierName: 'Precision Tech India',
    supplierReliability: 0.99,
    deliveryDaysCapability: 3,
    location: 'Bengaluru, Karnataka',
    quantityBreaks: [
      { minQty: 5, discountPct: 0.05 },
      { minQty: 20, discountPct: 0.10 },
    ],
    paymentTerms: ['upfront', '30_days'],
    certifications: ['CE', 'RoHS', 'TUV Certified'],
    keywords: ['vfd', 'drive', 'variable frequency', 'abb', 'inverter', 'motor drive'],
  },

  // 4. Industrial Valves & Hydraulics
  {
    id: 'prod-valve-gate-3inch',
    name: 'L&T 3-Inch Forged Steel Gate Valve (Class 300)',
    category: 'Valves & Hydraulics',
    sku: 'LT-GV-3IN-300',
    specification: 'Class 300, Flanged RF Ends, Stellite Faced Wedge, Rising Stem, WCB Body',
    unitPrice: 7200,
    unitCost: 4400,
    minMargin: 0.12,
    availableQuantity: 450,
    supplierId: 'supplier-meridian-bearings',
    supplierName: 'Meridian Industrial Flow',
    supplierReliability: 0.97,
    deliveryDaysCapability: 4,
    location: 'Chennai, Tamil Nadu',
    quantityBreaks: [
      { minQty: 50, discountPct: 0.07 },
      { minQty: 100, discountPct: 0.14 },
    ],
    paymentTerms: ['upfront', '30_days', '45_days'],
    certifications: ['API 600', 'IBR Certified', 'ISO 9001'],
    keywords: ['valve', 'valves', 'gate valve', 'flanged', 'forged steel', 'flow control'],
  },
  {
    id: 'prod-valve-ball-2inch',
    name: 'Audco 2-Inch Stainless Steel Ball Valve (SS316)',
    category: 'Valves & Hydraulics',
    sku: 'AUD-BV-2IN-SS',
    specification: '3-Piece Design, Full Bore, PTFE Seats, 1000 PSI WOG, Screwed BSP Ends',
    unitPrice: 3800,
    unitCost: 2200,
    minMargin: 0.10,
    availableQuantity: 620,
    supplierId: 'supplier-indus-hardware',
    supplierName: 'Indus Hardware & Flow Components',
    supplierReliability: 0.94,
    deliveryDaysCapability: 3,
    location: 'Delhi NCR',
    quantityBreaks: [
      { minQty: 50, discountPct: 0.08 },
      { minQty: 200, discountPct: 0.15 },
    ],
    paymentTerms: ['upfront', '15_days', '30_days'],
    certifications: ['ISO 9001', 'Fire Safe API 607'],
    keywords: ['valve', 'valves', 'ball valve', 'stainless steel', 'ss316', 'audco'],
  },

  // 5. Industrial Sensors & Instrumentation
  {
    id: 'prod-sensor-temp-pt100',
    name: 'Honeywell Industrial PT100 Temperature Sensor Transmitter',
    category: 'Sensors & Instrumentation',
    sku: 'HON-PT100-420MA',
    specification: 'Class A RTD 3-Wire, 4-20mA Output, SS316 150mm Sheath, Explosion-Proof Head',
    unitPrice: 2450,
    unitCost: 1400,
    minMargin: 0.12,
    availableQuantity: 850,
    supplierId: 'supplier-precision-tech',
    supplierName: 'Precision Tech India',
    supplierReliability: 0.99,
    deliveryDaysCapability: 3,
    location: 'Bengaluru, Karnataka',
    quantityBreaks: [
      { minQty: 100, discountPct: 0.06 },
      { minQty: 300, discountPct: 0.12 },
    ],
    paymentTerms: ['upfront', '30_days'],
    certifications: ['ATEX Certified', 'IECEx', 'NABL Calibrated'],
    keywords: ['sensor', 'sensors', 'pt100', 'temperature', 'honeywell', 'rtd', 'transmitter'],
  },
  {
    id: 'prod-sensor-pressure-trans',
    name: 'Danfoss MBS 3000 Compact Pressure Transmitter',
    category: 'Sensors & Instrumentation',
    sku: 'DAN-MBS-3000-10B',
    specification: '0-10 Bar Gauge, 4-20mA Output, G1/4A Process Connection, Stainless Steel Wetted Parts',
    unitPrice: 4600,
    unitCost: 2800,
    minMargin: 0.11,
    availableQuantity: 520,
    supplierId: 'supplier-vertex-eng',
    supplierName: 'Vertex Engineering Supplies',
    supplierReliability: 0.94,
    deliveryDaysCapability: 4,
    location: 'Pune, Maharashtra',
    quantityBreaks: [
      { minQty: 25, discountPct: 0.05 },
      { minQty: 100, discountPct: 0.12 },
    ],
    paymentTerms: ['upfront', '30_days'],
    certifications: ['CE', 'ISO 9001'],
    keywords: ['sensor', 'sensors', 'pressure', 'transmitter', 'danfoss', 'transducer', 'bar'],
  },

  // 6. Fasteners & Industrial Hardware
  {
    id: 'prod-fastener-m12-bolt',
    name: 'Unbrako M12x50 High-Tensile Hex Head Cap Screws (Pack of 100)',
    category: 'Fasteners & Hardware',
    sku: 'UNB-M12-50-GR109',
    specification: 'Grade 10.9 Alloy Steel, Black Oxide Finish, Fully Threaded, DIN 933 Compliant',
    unitPrice: 1850,
    unitCost: 950,
    minMargin: 0.10,
    availableQuantity: 3400,
    supplierId: 'supplier-indus-hardware',
    supplierName: 'Indus Hardware & Fasteners',
    supplierReliability: 0.95,
    deliveryDaysCapability: 2,
    location: 'Delhi NCR',
    quantityBreaks: [
      { minQty: 200, discountPct: 0.08 },
      { minQty: 500, discountPct: 0.15 },
      { minQty: 1000, discountPct: 0.22 },
    ],
    paymentTerms: ['upfront', '15_days', '30_days'],
    certifications: ['ISO 898-1 Certified', 'Material Test Certificate Available'],
    keywords: ['fastener', 'fasteners', 'bolt', 'bolts', 'm12', 'hex bolt', 'unbrako', 'hardware'],
  },

  // 7. Electrical Components & Switchgear
  {
    id: 'prod-elec-contactor-32a',
    name: 'Schneider Electric TeSys D 32A 3-Pole AC3 Contactor',
    category: 'Electrical Components & Switchgear',
    sku: 'SCH-LC1D32M7',
    specification: '32A (AC-3 415V 15kW), 1 NO + 1 NC Auxiliary, 220V AC 50/60Hz Coil',
    unitPrice: 2150,
    unitCost: 1250,
    minMargin: 0.12,
    availableQuantity: 1100,
    supplierId: 'supplier-apex-mro',
    supplierName: 'Apex Industrial Components',
    supplierReliability: 0.96,
    deliveryDaysCapability: 4,
    location: 'Pune, Maharashtra',
    quantityBreaks: [
      { minQty: 50, discountPct: 0.06 },
      { minQty: 200, discountPct: 0.14 },
    ],
    paymentTerms: ['upfront', '30_days'],
    certifications: ['IEC 60947-4-1', 'UL', 'CSA', 'CE'],
    keywords: ['electrical', 'contactor', 'schneider', 'switchgear', 'relay', '32a', 'tesys'],
  },
  {
    id: 'prod-elec-mcb-63a',
    name: 'L&T 63A 4-Pole C-Curve MCB (10kA Breaking Capacity)',
    category: 'Electrical Components & Switchgear',
    sku: 'LT-MCB-4P-63A',
    specification: '4-Pole, 63A Current Rating, C-Curve Trip Characteristic, 10kA Breaking, DIN Rail',
    unitPrice: 1680,
    unitCost: 980,
    minMargin: 0.10,
    availableQuantity: 1450,
    supplierId: 'supplier-vertex-eng',
    supplierName: 'Vertex Engineering Supplies',
    supplierReliability: 0.93,
    deliveryDaysCapability: 3,
    location: 'Ahmedabad, Gujarat',
    quantityBreaks: [
      { minQty: 50, discountPct: 0.05 },
      { minQty: 200, discountPct: 0.12 },
    ],
    paymentTerms: ['upfront', '15_days', '30_days'],
    certifications: ['IS/IEC 60898-1', 'CE Certified'],
    keywords: ['electrical', 'mcb', 'breaker', 'circuit breaker', 'l&t', 'switchgear', '63a'],
  },

  // 8. Safety Equipment
  {
    id: 'prod-safety-helmet-pack',
    name: 'Karam Industrial Safety Helmets with Ratchet Adjustment (Box of 20)',
    category: 'Safety Equipment & Protective Gear',
    sku: 'KARM-SHEL-RATCH-20',
    specification: 'High Density Polyethylene (HDPE), 4-Point Textile Suspension, ISI Marked IS:2925',
    unitPrice: 4200,
    unitCost: 2500,
    minMargin: 0.10,
    availableQuantity: 600,
    supplierId: 'supplier-indus-hardware',
    supplierName: 'Indus Safety Supplies',
    supplierReliability: 0.95,
    deliveryDaysCapability: 2,
    location: 'Delhi NCR',
    quantityBreaks: [
      { minQty: 25, discountPct: 0.08 },
      { minQty: 100, discountPct: 0.16 },
    ],
    paymentTerms: ['upfront', '30_days'],
    certifications: ['IS:2925:1984', 'DGMS Approved', 'CE EN 397'],
    keywords: ['safety', 'helmet', 'helmets', 'protective gear', 'karam', 'ppe', 'industrial safety'],
  },
];

export interface SearchFilter {
  query?: string;
  category?: string;
  maxDeliveryDays?: number;
  minReliability?: number;
  minQuantity?: number;
  maxBudget?: number;
  priority?: 'price' | 'delivery' | 'reliability' | 'balanced';
}

export interface SearchMarketplaceResult {
  products: MarketplaceProduct[];
  stats: {
    totalMatchingProducts: number;
    suppliersMeetingQuantity: number;
    suppliersMeetingDelivery: number;
    suppliersMeetingAllRequirements: number;
  };
  recommendedSupplier: MarketplaceProduct;
  alternativeSuppliers: MarketplaceProduct[];
}

/**
 * Searches the marketplace catalog based on natural language queries and filters
 */
export function searchMarketplace(
  queryText: string,
  filter: SearchFilter = {}
): SearchMarketplaceResult {
  const q = (queryText || '').toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);

  // 1. Score matching products
  const scored = MARKETPLACE_PRODUCTS.map((product) => {
    let score = 0;
    const textCorpus = `${product.name} ${product.category} ${product.specification} ${product.location} ${product.keywords.join(' ')}`.toLowerCase();

    // Exact word matches
    for (const w of words) {
      if (textCorpus.includes(w)) {
        score += 5;
      }
      if (product.name.toLowerCase().includes(w)) {
        score += 8;
      }
    }

    // Filter checks
    const meetsQty = !filter.minQuantity || product.availableQuantity >= filter.minQuantity;
    const meetsDelivery = !filter.maxDeliveryDays || product.deliveryDaysCapability <= filter.maxDeliveryDays;
    const meetsReliability = !filter.minReliability || product.supplierReliability >= filter.minReliability;

    if (meetsQty) score += 4;
    if (meetsDelivery) score += 4;
    if (meetsReliability) score += 3;

    // Priority bias
    if (filter.priority === 'price') {
      score += (1000 - Math.min(product.unitPrice, 1000)) / 100;
    } else if (filter.priority === 'delivery') {
      score += (10 - Math.min(product.deliveryDaysCapability, 10)) * 2;
    } else if (filter.priority === 'reliability') {
      score += product.supplierReliability * 10;
    }

    return { product, score, meetsQty, meetsDelivery, meetsReliability };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // If no good match, default to bearings products
  const matched = scored.filter((s) => s.score > 5).map((s) => s.product);
  const finalProducts = matched.length > 0 ? matched : MARKETPLACE_PRODUCTS.slice(0, 3);

  const top = finalProducts[0];
  const alternatives = finalProducts.slice(1, 4);

  const totalMatchingProducts = finalProducts.length;
  const suppliersMeetingQuantity = finalProducts.filter(
    (p) => !filter.minQuantity || p.availableQuantity >= filter.minQuantity
  ).length;
  const suppliersMeetingDelivery = finalProducts.filter(
    (p) => !filter.maxDeliveryDays || p.deliveryDaysCapability <= filter.maxDeliveryDays
  ).length;
  const suppliersMeetingAllRequirements = finalProducts.filter(
    (p) =>
      (!filter.minQuantity || p.availableQuantity >= filter.minQuantity) &&
      (!filter.maxDeliveryDays || p.deliveryDaysCapability <= filter.maxDeliveryDays)
  ).length;

  return {
    products: finalProducts,
    stats: {
      totalMatchingProducts,
      suppliersMeetingQuantity: Math.max(1, suppliersMeetingQuantity),
      suppliersMeetingDelivery: Math.max(1, suppliersMeetingDelivery),
      suppliersMeetingAllRequirements: Math.max(1, suppliersMeetingAllRequirements),
    },
    recommendedSupplier: top,
    alternativeSuppliers: alternatives,
  };
}
