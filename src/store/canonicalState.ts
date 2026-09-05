import { useState, useEffect, useCallback } from 'react';
import type {
  BuyerPolicy,
  SellerPolicy,
  SupplierFacts,
  CanonicalDeal,
  ScoredDeal,
  AuditEvent,
  DecisionStatus,
} from '../types/index.ts';
import type { AgentMessage } from '../agents/orchestrator.ts';
import { NegotiationOrchestrator } from '../agents/orchestrator.ts';
import { scoreDeal, findParetoFrontier } from '../engine/optimizer.ts';
import { generateSingleSupplierCandidates } from '../engine/candidates.ts';
import { AuditLogger } from '../engine/explanation.ts';
import { CANONICAL_SCENARIOS, type CanonicalScenario } from '../data/canonicalScenarios.ts';
import { MOCK_SUPPLIERS } from '../data/mockSuppliers.ts';

export type UserRole = 'landing' | 'buyer' | 'seller' | 'admin';
export type ViewTab = 'control_room' | 'what_if' | 'audit' | 'contract' | 'payment';

export interface CanonicalState {
  role: UserRole;
  activeTab: ViewTab;
  activeScenario: CanonicalScenario;
  round: number;
  maxRounds: number;
  status: DecisionStatus;
  buyerPolicy: BuyerPolicy;
  sellerPolicy: SellerPolicy;
  supplierFacts: SupplierFacts;
  currentDeal: CanonicalDeal;
  scoredDeal?: ScoredDeal;
  paretoDeals: ScoredDeal[];
  dialogueHistory: AgentMessage[];
  auditTrail: AuditEvent[];
  humanApproved: boolean;
  paymentId?: string;
  orderId?: string;

  // Actions
  setRole: (role: UserRole) => void;
  setActiveTab: (tab: ViewTab) => void;
  loadScenario: (scenarioId: string) => void;
  startCustomNegotiation: (
    productName: string,
    quantity: number,
    targetBudget: number,
    maxBudget: number,
    deliveryDays: number,
    paymentPreference: string,
    supplierId?: string
  ) => void;
  nextRound: () => void;
  approveDeal: () => void;
  rejectDeal: () => void;
  modifyParameters: (
    quantity: number,
    targetBudget: number,
    deliveryDays: number,
    paymentTerms: string
  ) => void;
  resetNegotiation: () => void;
  setPaymentDetails: (payId: string, ordId: string) => void;
}

export function useCanonicalState(): CanonicalState {
  const [role, setRoleState] = useState<UserRole>('landing');
  const [activeTab, setActiveTab] = useState<ViewTab>('control_room');

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    setActiveTab('control_room');
  }, []);
  const [activeScenario, setActiveScenario] = useState<CanonicalScenario>(CANONICAL_SCENARIOS[0]);
  const [round, setRound] = useState<number>(1);
  const [maxRounds] = useState<number>(4);
  const [status, setStatus] = useState<DecisionStatus>('FEASIBLE');

  const [buyerPolicy, setBuyerPolicy] = useState<BuyerPolicy>(CANONICAL_SCENARIOS[0].buyerPolicy);
  const [sellerPolicy, setSellerPolicy] = useState<SellerPolicy>(CANONICAL_SCENARIOS[0].sellerPolicy);
  const [supplierFacts, setSupplierFacts] = useState<SupplierFacts>(CANONICAL_SCENARIOS[0].supplierFacts);

  // Initial canonical deal
  const [currentDeal, setCurrentDeal] = useState<CanonicalDeal>({
    id: 'deal-canon-01',
    supplierId: CANONICAL_SCENARIOS[0].sellerPolicy.supplierId,
    items: [
      {
        productId: 'bearing-6205',
        quantity: CANONICAL_SCENARIOS[0].buyerPolicy.requiredQuantity,
        unitPrice: Math.round(CANONICAL_SCENARIOS[0].buyerPolicy.targetTotalBudget / CANONICAL_SCENARIOS[0].buyerPolicy.requiredQuantity),
      },
    ],
    deliveryDays: CANONICAL_SCENARIOS[0].buyerPolicy.requiredDeliveryDays,
    paymentTerms: '30_days',
  });

  const [scoredDeal, setScoredDeal] = useState<ScoredDeal | undefined>(undefined);
  const [paretoDeals, setParetoDeals] = useState<ScoredDeal[]>([]);
  const [dialogueHistory, setDialogueHistory] = useState<AgentMessage[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [humanApproved, setHumanApproved] = useState<boolean>(false);
  const [paymentId, setPaymentId] = useState<string | undefined>(undefined);
  const [orderId, setOrderId] = useState<string | undefined>(undefined);

  const auditLogger = new AuditLogger();

  // Score current deal & compute Pareto frontier dynamically whenever state changes
  useEffect(() => {
    if (currentDeal && currentDeal.items && currentDeal.items.length > 0) {
      // Ensure unitPrice * quantity === totalPrice
      const scored = scoreDeal(currentDeal, buyerPolicy, sellerPolicy, supplierFacts);
      setScoredDeal(scored);

      const baseItem = {
        productId: currentDeal.items[0]?.productId ?? 'bearing-6205',
        quantity: currentDeal.items[0]?.quantity ?? buyerPolicy.requiredQuantity,
        unitPrice: currentDeal.items[0]?.unitPrice ?? Math.round((buyerPolicy.targetTotalBudget || 360000) / buyerPolicy.requiredQuantity),
      };

      const candidates = generateSingleSupplierCandidates(
        buyerPolicy,
        sellerPolicy,
        supplierFacts,
        baseItem
      );

      const scoredCandidates = candidates.map((d) =>
        scoreDeal(d, buyerPolicy, sellerPolicy, supplierFacts)
      );

      const frontier = findParetoFrontier(scoredCandidates);
      setParetoDeals(frontier);
    }
  }, [currentDeal, buyerPolicy, sellerPolicy, supplierFacts]);

  // Load a canonical scenario
  const loadScenario = useCallback((scenarioId: string) => {
    const sc = CANONICAL_SCENARIOS.find((s) => s.id === scenarioId) || CANONICAL_SCENARIOS[0];
    setActiveScenario(sc);
    setBuyerPolicy(sc.buyerPolicy);
    setSellerPolicy(sc.sellerPolicy);
    setSupplierFacts(sc.supplierFacts);
    setHumanApproved(false);
    setRound(1);

    const initDeal: CanonicalDeal = {
      id: `deal-${sc.id}-r1`,
      supplierId: sc.sellerPolicy.supplierId,
      items: [
        {
          productId: 'bearing-6205',
          quantity: sc.buyerPolicy.requiredQuantity,
          unitPrice: Math.round((sc.buyerPolicy.targetTotalBudget || 360000) / sc.buyerPolicy.requiredQuantity),
        },
      ],
      deliveryDays: sc.buyerPolicy.requiredDeliveryDays,
      paymentTerms: '30_days',
    };

    setCurrentDeal(initDeal);

    // Run orchestrator to populate dialogue and audit logs
    const orchestrator = new NegotiationOrchestrator();
    const result = orchestrator.runNegotiation(
      sc.promptText,
      sc.buyerPolicy,
      sc.sellerPolicy,
      sc.supplierFacts,
      4
    );

    setStatus(result.status);
    setRound(result.roundsCount || 1);
    setDialogueHistory(result.dialogueHistory);
    setAuditTrail(result.auditTrail);

    if (result.finalDeal) {
      setCurrentDeal(result.finalDeal);
    }
  }, []);

  // Start custom user negotiation
  const startCustomNegotiation = useCallback(
    (
      productName: string,
      quantity: number,
      targetBudget: number,
      maxBudget: number,
      deliveryDays: number,
      paymentPreference: string,
      selectedSupplierId?: string
    ) => {
      const matchedSupplier = MOCK_SUPPLIERS.find(s => s.supplierId === selectedSupplierId) || MOCK_SUPPLIERS[0];
      const customBuyerPolicy: BuyerPolicy = {
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

      setBuyerPolicy(customBuyerPolicy);
      setSellerPolicy(matchedSupplier.policy);
      setSupplierFacts(matchedSupplier.facts);
      setHumanApproved(false);

      const orchestrator = new NegotiationOrchestrator();
      const result = orchestrator.runNegotiation(
        `Procure ${quantity} units of ${productName} (Target budget ₹${targetBudget.toLocaleString()}, delivery within ${deliveryDays} days).`,
        customBuyerPolicy,
        matchedSupplier.policy,
        matchedSupplier.facts,
        4
      );

      setStatus(result.status);
      setRound(result.roundsCount || 1);
      setDialogueHistory(result.dialogueHistory);
      setAuditTrail(result.auditTrail);

      if (result.finalDeal) {
        setCurrentDeal(result.finalDeal);
      }

      if (role === 'landing') {
        setRole('buyer');
      }
      setActiveTab('control_room');
    },
    [role]
  );

  const nextRound = useCallback(() => {
    if (round < maxRounds) {
      const nextR = round + 1;
      setRound(nextR);

      // Advance deal terms deterministically
      const updatedQty = Math.round(currentDeal.items[0].quantity * 1.05);
      const updatedPrice = Math.round(currentDeal.items[0].unitPrice * 0.95);
      const nextDeal: CanonicalDeal = {
        ...currentDeal,
        items: [{ productId: 'bearing-6205', quantity: updatedQty, unitPrice: updatedPrice }],
        paymentTerms: nextR === 3 ? 'upfront' : currentDeal.paymentTerms,
      };

      setCurrentDeal(nextDeal);

      const newMsg: AgentMessage = {
        round: nextR,
        sender: 'decision_engine',
        text: `Round ${nextR} Decision Engine Evaluation: Counter proposal generated. Quantity adjusted to ${updatedQty} units at ₹${updatedPrice}/unit. Status: FEASIBLE. Pareto optimal candidate updated.`,
      };

      setDialogueHistory((prev) => [...prev, newMsg]);

      const ev = auditLogger.log(
        'decision_engine',
        `EVALUATE_ROUND_${nextR}`,
        { deal: nextDeal },
        { status: 'FEASIBLE' },
        ['pareto_candidate_evaluation'],
        'FEASIBLE'
      );
      setAuditTrail((prev) => [...prev, ev]);
    }
  }, [round, maxRounds, currentDeal]);

  const approveDeal = useCallback(() => {
    setHumanApproved(true);
    setStatus('APPROVED');
    setActiveTab('contract');

    const ev = auditLogger.log(
      'human_user',
      'APPROVE_DEAL',
      { deal: currentDeal },
      { status: 'APPROVED' },
      ['human_authority_approval'],
      'APPROVED',
      true
    );
    setAuditTrail((prev) => [...prev, ev]);
  }, [currentDeal]);

  const rejectDeal = useCallback(() => {
    setHumanApproved(false);
    setStatus('NO_DEAL');

    const ev = auditLogger.log(
      'human_user',
      'REJECT_DEAL',
      { deal: currentDeal },
      { status: 'NO_DEAL' },
      ['human_authority_rejection'],
      'NO_DEAL',
      true
    );
    setAuditTrail((prev) => [...prev, ev]);
  }, [currentDeal]);

  const modifyParameters = useCallback(
    (quantity: number, targetBudget: number, deliveryDays: number, paymentTerms: string) => {
      const updatedPolicy: BuyerPolicy = {
        ...buyerPolicy,
        requiredQuantity: quantity,
        targetTotalBudget: targetBudget,
        latestAcceptableDeliveryDays: deliveryDays,
      };

      setBuyerPolicy(updatedPolicy);

      const unitPrice = Math.round(targetBudget / quantity);
      const modifiedDeal: CanonicalDeal = {
        ...currentDeal,
        items: [{ productId: 'bearing-6205', quantity, unitPrice }],
        deliveryDays,
        paymentTerms,
      };

      setCurrentDeal(modifiedDeal);

      const ev = auditLogger.log(
        'human_user',
        'MODIFY_PARAMETERS',
        { quantity, targetBudget, deliveryDays, paymentTerms },
        { recalculatedDeal: modifiedDeal },
        ['human_parameter_override_recalculated'],
        'FEASIBLE'
      );

      setAuditTrail((prev) => [...prev, ev]);

      const modMessage: AgentMessage = {
        round,
        sender: 'decision_engine',
        text: `Human Parameter Override Recalculated: New Quantity = ${quantity}, Target Budget = ₹${targetBudget.toLocaleString()}, Delivery = ${deliveryDays}d, Payment = ${paymentTerms}. Decision Engine reran optimization.`,
      };
      setDialogueHistory((prev) => [...prev, modMessage]);
    },
    [buyerPolicy, currentDeal, round]
  );

  const resetNegotiation = useCallback(() => {
    loadScenario('scenario-01');
  }, [loadScenario]);

  const setPaymentDetails = useCallback((payId: string, ordId: string) => {
    setPaymentId(payId);
    setOrderId(ordId);
    setStatus('STOP'); // or paid state
  }, []);

  return {
    role,
    activeTab,
    activeScenario,
    round,
    maxRounds,
    status,
    buyerPolicy,
    sellerPolicy,
    supplierFacts,
    currentDeal,
    scoredDeal,
    paretoDeals,
    dialogueHistory,
    auditTrail,
    humanApproved,
    paymentId,
    orderId,

    setRole,
    setActiveTab,
    loadScenario,
    startCustomNegotiation,
    nextRound,
    approveDeal,
    rejectDeal,
    modifyParameters,
    resetNegotiation,
    setPaymentDetails,
  };
}
