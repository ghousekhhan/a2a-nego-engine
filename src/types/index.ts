/**
 * Core Data Models & Schemas for A2A Deal Decision Engine
 * Reference: PRODUCT_SPEC.md & DECISION_ENGINE_SPEC.md
 */

export type DecisionStatus =
  | 'FEASIBLE'
  | 'INFEASIBLE'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_INFORMATION'
  | 'HUMAN_REVIEW'
  | 'NO_DEAL'
  | 'STOP'
  | 'ESCALATE'
  | 'RECOMMEND';

export type ActionType =
  | 'ASK'
  | 'OFFER'
  | 'COUNTER'
  | 'CONDITIONAL_OFFER'
  | 'BUNDLE_OFFER'
  | 'TRADE_OFFER'
  | 'ACCEPT'
  | 'REJECT'
  | 'ESCALATE'
  | 'STOP';

export type RecommendationCategory =
  | 'BEST_BUYER'
  | 'BEST_SELLER'
  | 'BEST_BALANCED'
  | 'LOWEST_RISK'
  | 'BEST_LONG_TERM';

// Canonical item in a deal
export interface DealItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  productCost?: number;
  supplierId?: string;
}

// Canonical Deal Representation (Section 5 DECISION_ENGINE_SPEC)
export interface CanonicalDeal {
  id?: string;
  items: DealItem[];
  deliveryDays: number;
  paymentTerms: 'upfront' | '15_days' | '30_days' | '60_days' | string;
  contractMonths?: number;
  shippingCost?: number;
  installationCost?: number;
  warrantyMonths?: number;
  supplierId: string;
  conditions?: string[];
  expeditedDelivery?: boolean;
}

// Single product shorthand deal for convenience
export interface SingleProductDeal {
  productId: string;
  quantity: number;
  unitPrice: number;
  deliveryDays: number;
  paymentTerms: string;
  contractMonths?: number;
  supplierId: string;
  warrantyMonths?: number;
  expeditedDelivery?: boolean;
  conditions?: string[];
}

// Buyer Policy & Parameters (Section 8 PRODUCT_SPEC & Section 50 PRODUCT_SPEC)
export interface BuyerWeights {
  price: number;
  delivery: number;
  quality: number;
  reliability: number;
  payment?: number;
  warranty?: number;
}

export interface BuyerPolicy {
  maxTotalBudget: number;
  targetTotalBudget?: number;
  maxUnitPrice?: number;
  requiredQuantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  preferredQuantity?: number;
  requiredDeliveryDays: number;
  latestAcceptableDeliveryDays: number;
  preferredDeliveryDays?: number;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
  delayCostPerDay?: number; // Economic cost of late delivery
  expectedDelayCostIfUnexpedited?: number; // Economic risk cost
  minQuality?: number; // 0 to 1
  minSupplierReliability: number; // 0 to 1
  requiredCertification?: boolean;
  requiredWarrantyMonths?: number;
  substitutionAllowed?: boolean;
  acceptableBrands?: string[];
  acceptablePaymentTerms?: string[];
  annualCostOfCapital?: number; // e.g. 0.12 (12%)
  flexibilityValuePerUnit?: number; // value of contract flexibility
  weights: BuyerWeights;
  humanApprovalThreshold?: number;
  maxAutonomousSpend?: number;
}

// Seller Economics & Policy (Section 9 PRODUCT_SPEC & Section 49 PRODUCT_SPEC)
export interface ProductSellerConfig {
  productId: string;
  productCost: number;
  basePrice: number;
  operatingCostPerUnit?: number;
  availableInventory: number;
}

export interface SellerStrategyWeights {
  profit: number;
  volume: number;
  cashflow: number;
  inventory: number;
  customer: number;
  risk: number;
  complexity?: number;
}

export interface SellerPolicy {
  supplierId: string;
  products: Record<string, ProductSellerConfig>;
  targetMargin: number; // e.g. 0.18 (18%)
  minMargin: number; // e.g. 0.10 (10%)
  maxDiscount?: number; // e.g. 0.08 (8%)
  minOrderQuantity?: number;
  operatingCostPerUnit?: number;
  logisticsCostPerOrder?: number;
  paymentCostRate?: number; // e.g. 0.01 (1%)
  expediteCostPerOrder?: number; // e.g. ₹4000
  annualCostOfCapital?: number; // e.g. 0.12 (12%)
  inventoryPressure?: 'low' | 'medium' | 'high';
  paymentTerms: string[];
  maxNegotiationRounds?: number;
  humanApprovalRequiredAbove?: number;
  weights: SellerStrategyWeights;
}

// Reliability & History for Supplier
export interface SupplierFacts {
  supplierId: string;
  reliabilityScore: number; // 0 to 1
  qualityScore: number; // 0 to 1
  deliveryVarianceDays?: number;
  certificationAvailable?: boolean | 'UNKNOWN';
}

// Economics result
export interface SellerEconomicsResult {
  grossRevenue: number;
  totalCost: number;
  variableCost: number;
  grossProfit: number;
  grossMargin: number;
  minRequiredRevenue: number;
  isValidMargin: boolean;
}

export interface BuyerEconomicsResult {
  productPriceTotal: number;
  shippingCost: number;
  taxes: number;
  installationCost: number;
  financingCost: number;
  expectedDelayCost: number;
  expectedFailureCost: number;
  totalLandedCost: number;
  withinBudget: boolean;
}

// Scored & Evaluated Deal
export interface ScoredDeal {
  deal: CanonicalDeal;
  buyerUtility: number;
  sellerUtility: number;
  balancedScore: number;
  sellerMargin: number;
  totalBuyerCost: number;
  totalSellerRevenue: number;
  riskScore: number;
  coordinationCost: number;
  recommendationCategory?: RecommendationCategory;
  isFeasible: boolean;
  rejectionReasons: string[];
}

// No-Deal Certificate
export interface NoDealCertificate {
  status: 'NO_DEAL';
  buyerCeiling: number;
  sellerFloor: number;
  gap: number;
  testedAlternativesCount: number;
  gapClosingVariables: string[];
  reason: string;
}

// Validation Details
export interface ValidationMatrix {
  price: 'PASS' | 'FAIL' | 'REVIEW';
  margin: 'PASS' | 'FAIL' | 'REVIEW';
  inventory: 'PASS' | 'FAIL' | 'REVIEW';
  delivery: 'PASS' | 'FAIL' | 'REVIEW';
  payment: 'PASS' | 'FAIL' | 'REVIEW';
  policy: 'PASS' | 'FAIL' | 'REVIEW';
  authority: 'PASS' | 'FAIL' | 'REVIEW';
  substitution: 'PASS' | 'FAIL' | 'REVIEW';
  certification: 'PASS' | 'FAIL' | 'UNKNOWN' | 'REVIEW';
}

export interface HardConstraintResult {
  passed: boolean;
  reasons: string[];
  matrix: ValidationMatrix;
  requiresInformation?: boolean;
  requiresHumanReview?: boolean;
  missingFields?: string[];
}

// Explanation & Audit
export interface DecisionExplanation {
  what: string;
  why: string;
  impact: string;
  condition: string;
  financialImpact: number;
  primaryReason: string;
}

export interface AuditEvent {
  timestamp: string;
  actor: string;
  action: ActionType | string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  rulesTriggered: string[];
  decision: DecisionStatus;
  approvalRequired: boolean;
}

// State Machine context & state
export interface NegotiationState {
  round: number;
  maxRounds: number;
  currentDeal?: CanonicalDeal;
  lastOfferBy?: 'buyer' | 'seller';
  history: CanonicalDeal[];
  isComplete: boolean;
  status: DecisionStatus;
  minMeaningfulUtilityGain?: number;
  minMeaningfulSaving?: number;
}

// What-If
export interface WhatIfQuery {
  quantity?: number;
  maxTotalBudget?: number;
  deliveryDays?: number;
  paymentTerms?: string;
  contractMonths?: number;
  substitutionAllowed?: boolean;
  expeditedDelivery?: boolean;
}

export interface WhatIfResult {
  query: WhatIfQuery;
  baselineDeal?: ScoredDeal;
  newBestDeal?: ScoredDeal;
  priceDelta: number;
  buyerUtilityDelta: number;
  unitPriceSaving: number;
  additionalSpend: number;
  recommendation: string;
  tradeoffExplanation: string;
  requiresHumanApproval: boolean;
}

// ==================================================
// A2A MESSAGE CONTRACT & EVENT PROTOCOL (Section 3)
// ==================================================
export interface A2ABuyerPrivateState {
  productRequirement: string;
  quantity: number;
  maxBudgetHidden: boolean;
  deliveryDaysRequired: number;
  urgency: string;
  authorizedBudget?: number; // Only accessible by Buyer Agent internally
}

export interface A2ASellerPrivateState {
  stockAvailable: number;
  marginFloorProtected: boolean;
  deliveryCapability: number;
  cogsHidden: boolean;
  unitCostBasis?: number; // Only accessible by Seller Agent internally
  minMarginFloorPct?: number; // Only accessible by Seller Agent internally
}

export interface A2ADecisionEngineVerification {
  budgetStatus: 'PASS' | 'FAIL';
  marginStatus: 'PASS' | 'FAIL';
  inventoryStatus: 'PASS' | 'FAIL';
  slaStatus: 'PASS' | 'FAIL';
  authorityTier: string;
  isFeasible: boolean;
}

export interface A2AMessageContract {
  id: string;
  round: number;
  senderAgent: 'buyer' | 'seller' | 'system' | 'user';
  receiverAgent: 'buyer' | 'seller' | 'user' | 'all';
  messageType: 'REQUEST' | 'OFFER' | 'COUNTER' | 'ACCEPT' | 'REJECT' | 'CHECK';
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unitPrice: number;
  deliveryDays: number;
  paymentTerms: string;
  timestamp: string;
  humanReadableMessage: string;
  agentActivity?: string;
  technicalDetails?: {
    buyerPrivateState?: A2ABuyerPrivateState;
    sellerPrivateState?: A2ASellerPrivateState;
    decisionEngineCheck?: A2ADecisionEngineVerification;
  };
  payload?: Record<string, unknown>;
}

export interface A2AEventRailItem {
  id: string;
  timestamp: string;
  actor: 'BUYER AGENT' | 'SELLER AGENT' | 'DEALFLOW CHECK' | 'HUMAN';
  action: string;
  detail: string;
  type: 'info' | 'offer' | 'counter' | 'verification' | 'deal';
}

