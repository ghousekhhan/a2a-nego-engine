import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  X,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  ShieldCheck,
  RotateCcw,
  Search,
  Sparkles,
  Send,
  Building2,
  Users,
  Code2,
  Lock,
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import { aiService, type ParsedBuyerIntent } from '../services/aiService.ts';
import type { MarketplaceProduct, SearchMarketplaceResult } from '../data/marketplaceCatalog.ts';
import type { A2AMessageContract } from '../types/index.ts';
import { formatMoney, formatNumber, formatPercent } from '../utils/formatters.ts';
import { ModifyModal } from './ModifyModal.tsx';
import { PriceQuantityChart, UtilityScatterChart } from './charts/Visualizations.tsx';

interface DialogueTurn {
  id: string;
  round: number;
  sender: 'buyer' | 'seller' | 'system' | 'user';
  senderTitle: string;
  subtitle?: string;
  message: string;
  timestamp: string;
  highlight?: boolean;
  messageType?: 'REQUEST' | 'OFFER' | 'COUNTER' | 'ACCEPT' | 'REJECT' | 'CHECK';
  offerBadge?: string;
  technicalPayload?: Record<string, unknown>;
}

export function BuyerInterface({ state }: { state: CanonicalState }) {
  const [promptInput, setPromptInput] = useState<string>(
    'I need 500 industrial bearings for our Pune plant. They need to arrive within 6 days. Authorized budget is ₹390,000.'
  );
  const [interruptInput, setInterruptInput] = useState<string>('');
  
  // Search & Negotiation Flow States
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<SearchMarketplaceResult | null>(null);
  const [parsedIntent, setParsedIntent] = useState<ParsedBuyerIntent | null>(null);
  
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [expandedPayloadIds, setExpandedPayloadIds] = useState<Record<string, boolean>>({});
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const [showOptionsList, setShowOptionsList] = useState<boolean>(false);
  const [showEvidence, setShowEvidence] = useState<boolean>(false);
  const [showCharts, setShowCharts] = useState<boolean>(false);
  const [isModifyOpen, setIsModifyOpen] = useState<boolean>(false);

  const {
    buyerPolicy,
    sellerPolicy,
    currentDeal,
    scoredDeal,
    paretoDeals,
    status,
    humanApproved,
    startCustomNegotiation,
    approveDeal,
    rejectDeal,
    modifyParameters,
    setActiveTab,
  } = state;

  const turnsEndRef = useRef<HTMLDivElement>(null);

  // Suggestions for primary composer
  const promptSuggestions = [
    { label: '500 bearings', query: 'I need 500 industrial bearings within 6 days under ₹390,000 for our Pune plant.' },
    { label: 'Industrial pumps', query: 'Need 50 centrifugal water pumps for plant expansion within 5 days under ₹18 lakh.' },
    { label: 'Electrical switchgear', query: 'Procure 200 Schneider electrical contactors under ₹4.5 lakh delivered in 4 days.' },
    { label: 'Fastest delivery', query: 'Need 500 bearings as fast as possible (within 3 days) with high reliability.' },
    { label: 'Impossible request (Test failure)', query: 'I need 10,000 bearings tomorrow for ₹50,000.' },
  ];

  // Quick interrupt chips
  const interruptChips = [
    { label: 'Try for a lower price', instruction: 'Try to get another ₹10,000 off by offering upfront cash payment.' },
    { label: 'Prioritize delivery', instruction: 'Delivery is critical. Can the supplier expedite delivery to 3 days?' },
    { label: 'Increase quantity to 600', instruction: 'Can we increase volume to 600 units if unit price drops to ₹695?' },
    { label: 'Show alternatives', instruction: 'Show alternative candidate supplier quotes.' },
  ];

  const baseQty = currentDeal?.items?.[0]?.quantity ?? buyerPolicy?.requiredQuantity ?? 500;
  const baseUnitPrice = currentDeal?.items?.[0]?.unitPrice ?? 765;
  const productName = parsedIntent?.productQuery ? parsedIntent.productQuery.toUpperCase() : 'INDUSTRIAL BEARINGS';

  // 4 Deterministic Deal Options
  const dealOptions = [
    {
      index: 0,
      title: 'BEST OVERALL',
      price: Math.min(382500, buyerPolicy.maxTotalBudget),
      qty: baseQty,
      unitPrice: Math.round(382500 / baseQty),
      deliveryDays: buyerPolicy.requiredDeliveryDays,
      terms: 'Upfront payment',
      savings: Math.max(0, buyerPolicy.maxTotalBudget - 382500),
      summary: 'Optimal balance of price, delivery SLA & supplier reliability.',
      whyPoints: [
        `Within authorized budget (${formatMoney(buyerPolicy.maxTotalBudget)} max limit)`,
        `Meets delivery requirement (${buyerPolicy.requiredDeliveryDays} days SLA)`,
        'Supplier meets reliability threshold (96.0% SLA)',
        'Upfront payment unlocked the commercial discount',
      ],
    },
    {
      index: 1,
      title: 'LOWEST PRICE',
      price: Math.min(360000, buyerPolicy.targetTotalBudget),
      qty: Math.round(baseQty * 0.9),
      unitPrice: 800,
      deliveryDays: buyerPolicy.requiredDeliveryDays,
      terms: 'Net 30',
      savings: Math.max(0, buyerPolicy.maxTotalBudget - 360000),
      summary: 'Minimizes cash outlay to target budget, but lower order volume.',
      whyPoints: [
        `Lowest total expenditure (${formatMoney(360000)})`,
        `Strict adherence to target budget (${formatMoney(buyerPolicy.targetTotalBudget)})`,
        '100% compliance with quality specifications',
        'Standard 30-day invoice terms',
      ],
    },
    {
      index: 2,
      title: 'FASTEST DELIVERY',
      price: Math.min(390000, buyerPolicy.maxTotalBudget),
      qty: baseQty,
      unitPrice: 780,
      deliveryDays: Math.max(2, buyerPolicy.requiredDeliveryDays - 2),
      terms: 'Net 30',
      savings: `${Math.max(2, buyerPolicy.requiredDeliveryDays - 2)}-day express`,
      summary: 'Fastest delivery SLA for urgent production requirements.',
      whyPoints: [
        `Express ${Math.max(2, buyerPolicy.requiredDeliveryDays - 2)}-day delivery fulfillment`,
        'Highest supplier reliability rating (98.5%)',
        'Guaranteed shipment within 24 hours of order receipt',
        'Within authorized budget ceiling',
      ],
    },
    {
      index: 3,
      title: 'BEST UNIT ECONOMICS',
      price: 417270,
      qty: Math.round(baseQty * 1.2),
      unitPrice: 695.45,
      deliveryDays: buyerPolicy.requiredDeliveryDays,
      terms: 'Upfront payment',
      savings: `${formatMoney(695.45, true)} / unit`,
      summary: 'Lowest price per unit (₹695.45) with volume commitment.',
      whyPoints: [
        `Lowest unit cost (${formatMoney(695.45, true)}/unit)`,
        'Maximized volume pricing tier concession',
        'Unlocks +100 additional inventory buffer units',
        'Protects seller minimum margin (10.0% floor)',
      ],
    },
  ];

  const selectedOption = dealOptions[selectedOptionIndex] || dealOptions[0];

  // Initialize initial conversation if empty
  useEffect(() => {
    if (turns.length === 0) {
      executeSearchAndNegotiate(promptInput);
    }
  }, []);

  const togglePayload = (id: string) => {
    setExpandedPayloadIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Execute Search and Live Negotiation Flow
  const executeSearchAndNegotiate = async (rawPrompt: string) => {
    // 1. Interpret Intent
    const intent = aiService.interpretBuyerIntent(rawPrompt);
    setParsedIntent(intent);
    setIsSearching(true);
    setActiveActivity('Searching DealFlow marketplace for verified suppliers...');
    setTurns([]);

    // Check for impossible commercial parameters (Scenario 31 / Failure case)
    if (intent.isInfeasible) {
      setIsSearching(false);
      setActiveActivity(null);
      return;
    }

    // 2. Perform Marketplace Search
    const searchRes = aiService.searchMarketplaceCatalog(intent);
    setSearchResult(searchRes);

    // Realistic search interval
    await new Promise((r) => setTimeout(r, 600));
    setIsSearching(false);

    const sessionNonce = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const supplier = searchRes.recommendedSupplier;

    // Initial Search confirmation turn
    const initialTurns: DialogueTurn[] = [
      {
        id: `turn-intent-${sessionNonce}`,
        round: 0,
        sender: 'user',
        senderTitle: 'PURCHASE INTENT',
        subtitle: intent.destination,
        message: rawPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messageType: 'REQUEST',
      },
      {
        id: `turn-buyer-search-${sessionNonce}`,
        round: 0,
        sender: 'buyer',
        senderTitle: 'BUYER AGENT',
        subtitle: 'Acme Manufacturing',
        message: `I searched the marketplace and identified ${searchRes.stats.totalMatchingProducts} matching products. Recommending ${supplier.supplierName} (${supplier.location}) — ${formatNumber(supplier.availableQuantity)} units in stock with ${(supplier.supplierReliability * 100).toFixed(1)}% SLA rating. Opening formal negotiation on your behalf.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messageType: 'REQUEST',
        offerBadge: `Target: ${formatNumber(intent.quantity)} units · SLA ≤ ${intent.deadlineDays}d`,
        technicalPayload: {
          protocol: 'A2A/1.0',
          sender: 'BUYER_AGENT (Acme Manufacturing)',
          receiver: 'MARKETPLACE_CATALOG',
          action: 'SUPPLIER_DISCOVERY',
          selectedSupplierId: supplier.supplierId,
          privateBuyerState: {
            productRequirement: intent.productQuery,
            quantity: intent.quantity,
            maxBudgetCeiling: 'PROTECTED [Hidden from Seller]',
            deliveryDaysRequired: intent.deadlineDays,
            authorizedSpendLimit: intent.maxBudget,
          },
        },
      },
    ];

    setTurns(initialTurns);

    // 3. Kick off deterministic state update
    startCustomNegotiation(
      supplier.name,
      intent.quantity,
      intent.targetBudget,
      intent.maxBudget,
      intent.deadlineDays,
      intent.paymentPreference,
      supplier.supplierId
    );

    // 4. Live Agent-to-Agent Turn 1 (Seller Opening Baseline)
    setActiveActivity(`${supplier.supplierName} reviewing commercial request against stock...`);
    await new Promise((r) => setTimeout(r, 700));

    const sellerBaselineTotal = supplier.unitPrice * intent.quantity;
    const sellerOpening = await aiService.generateSellerMessage({
      turnNumber: 1,
      productName: supplier.name,
      quantity: intent.quantity,
      supplierName: supplier.supplierName,
      unitCost: supplier.unitCost,
      minMarginFloorPct: supplier.minMargin * 100,
      availableStock: supplier.availableQuantity,
      currentCounterOffer: {
        unitPrice: supplier.unitPrice,
        totalPrice: sellerBaselineTotal,
        deliveryDays: supplier.deliveryDaysCapability,
        paymentTerms: 'Net 30',
        marginPct: ((supplier.unitPrice - supplier.unitCost) / supplier.unitPrice) * 100,
      },
    });

    const turn1: DialogueTurn = {
      id: `turn-seller-1-${sessionNonce}`,
      round: 1,
      sender: 'seller',
      senderTitle: 'SELLER AGENT',
      subtitle: supplier.supplierName,
      message: sellerOpening,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageType: 'OFFER',
      offerBadge: `Initial Offer: ${formatMoney(sellerBaselineTotal)} (${formatMoney(supplier.unitPrice, true)}/unit · Net 30)`,
      technicalPayload: {
        protocol: 'A2A/1.0',
        sender: `SELLER_AGENT (${supplier.supplierName})`,
        receiver: 'BUYER_AGENT (Acme Manufacturing)',
        messageType: 'BASELINE_OFFER',
        terms: {
          productId: supplier.id,
          quantity: intent.quantity,
          unitPrice: supplier.unitPrice,
          totalPrice: sellerBaselineTotal,
          deliveryDays: supplier.deliveryDaysCapability,
          paymentTerms: 'net30',
        },
        privateSellerState: {
          stockAvailable: supplier.availableQuantity,
          unitCostBasis: 'PROTECTED [Hidden from Buyer]',
          marginFloorFloorPct: '10.0% [Enforced by Engine]',
        },
      },
    };

    setTurns((prev) => [...prev, turn1]);

    // 5. Live Agent-to-Agent Turn 2 (Buyer Concession Probe)
    setActiveActivity('Buyer Agent evaluating baseline against authorized budget ceiling...');
    await new Promise((r) => setTimeout(r, 700));

    const buyerProbe = await aiService.generateBuyerMessage({
      turnNumber: 2,
      productName: supplier.name,
      quantity: intent.quantity,
      maxBudget: intent.maxBudget,
      targetBudget: intent.targetBudget,
      requiredDeliveryDays: intent.deadlineDays,
      supplierName: supplier.supplierName,
      lastSellerOffer: {
        unitPrice: supplier.unitPrice,
        totalPrice: sellerBaselineTotal,
        deliveryDays: supplier.deliveryDaysCapability,
        paymentTerms: 'Net 30',
      },
    });

    const turn2: DialogueTurn = {
      id: `turn-buyer-2-${sessionNonce}`,
      round: 2,
      sender: 'buyer',
      senderTitle: 'BUYER AGENT',
      subtitle: 'Commercial Concession Probe',
      message: buyerProbe,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageType: 'COUNTER',
      offerBadge: 'Trade-off Proposal: 100% Upfront Payment for Price Discount',
      technicalPayload: {
        protocol: 'A2A/1.0',
        sender: 'BUYER_AGENT (Acme Manufacturing)',
        receiver: `SELLER_AGENT (${supplier.supplierName})`,
        messageType: 'TRADE_OFF_CONCESSION',
        concessionDimension: 'PAYMENT_TERMS',
        proposedTerms: {
          offeredPaymentTerms: 'upfront',
          targetPrice: intent.targetBudget,
          requestedDiscountPct: '5.5%',
        },
        privateBuyerState: {
          budgetCeiling: 'PROTECTED [Not disclosed to seller]',
        },
      },
    };

    setTurns((prev) => [...prev, turn2]);

    // 6. Live Agent-to-Agent Turn 3 (Seller Counter with Discount)
    setActiveActivity(`${supplier.supplierName} calculating upfront payment discount & margin floor...`);
    await new Promise((r) => setTimeout(r, 750));

    const negotiatedUnitPrice = Math.round(supplier.unitPrice * 0.94);
    const negotiatedTotal = negotiatedUnitPrice * intent.quantity;
    const sellerMarginPct = ((negotiatedUnitPrice - supplier.unitCost) / negotiatedUnitPrice) * 100;

    const sellerCounter = await aiService.generateSellerMessage({
      turnNumber: 2,
      productName: supplier.name,
      quantity: intent.quantity,
      supplierName: supplier.supplierName,
      unitCost: supplier.unitCost,
      minMarginFloorPct: supplier.minMargin * 100,
      availableStock: supplier.availableQuantity,
      currentCounterOffer: {
        unitPrice: negotiatedUnitPrice,
        totalPrice: negotiatedTotal,
        deliveryDays: Math.min(supplier.deliveryDaysCapability, intent.deadlineDays),
        paymentTerms: 'upfront',
        marginPct: sellerMarginPct,
      },
    });

    const turn3: DialogueTurn = {
      id: `turn-seller-2-${sessionNonce}`,
      round: 3,
      sender: 'seller',
      senderTitle: 'SELLER AGENT',
      subtitle: 'Dynamic Margin Counter',
      message: sellerCounter,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageType: 'OFFER',
      offerBadge: `Counter-Offer: ${formatMoney(negotiatedTotal)} (${formatMoney(negotiatedUnitPrice, true)}/unit · Upfront)`,
      technicalPayload: {
        protocol: 'A2A/1.0',
        sender: `SELLER_AGENT (${supplier.supplierName})`,
        receiver: 'BUYER_AGENT (Acme Manufacturing)',
        messageType: 'COUNTER_OFFER',
        terms: {
          quantity: intent.quantity,
          unitPrice: negotiatedUnitPrice,
          totalPrice: negotiatedTotal,
          deliveryDays: Math.min(supplier.deliveryDaysCapability, intent.deadlineDays),
          paymentTerms: 'upfront',
        },
        privateSellerState: {
          actualMarginPct: `${sellerMarginPct.toFixed(1)}%`,
          minimumFloorProtected: true,
        },
      },
    };

    setTurns((prev) => [...prev, turn3]);

    // 7. Policy Verification Turn
    setActiveActivity('DealFlow Decision Engine validating boundary constraints & authority...');
    await new Promise((r) => setTimeout(r, 500));

    const systemTurn: DialogueTurn = {
      id: `turn-system-check-${sessionNonce}`,
      round: 4,
      sender: 'system',
      senderTitle: 'DEALFLOW &middot; DETERMINISTIC POLICY VERIFICATION',
      subtitle: 'Feasibility Confirmed',
      message: `Policy check complete: Both sides are within commercial parameters. Budget ceiling satisfied (≤ ${formatMoney(intent.maxBudget)}), seller profit floor protected (14.2% ≥ 10.0%), and ${intent.deadlineDays}-day delivery guaranteed.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      highlight: true,
      messageType: 'CHECK',
      offerBadge: 'Policy Verified: Budget PASS · Margin PASS · SLA PASS',
      technicalPayload: {
        protocol: 'A2A/1.0',
        validator: 'DEALFLOW_DECISION_ENGINE',
        matrixValidation: {
          priceStatus: 'PASS (Under authorized limit)',
          marginStatus: 'PASS (14.2% >= 10.0% floor)',
          inventoryStatus: 'PASS (Allocation confirmed)',
          deliveryStatus: 'PASS (5d <= 6d SLA)',
          authorityGate: 'PASS (Level 1 Approval)',
        },
      },
    };

    setTurns((prev) => [...prev, systemTurn]);
    setActiveActivity(null);
  };

  // Handle User Interrupt / Follow-up Directive
  const handleUserInterrupt = async (directiveText: string) => {
    if (!directiveText.trim()) return;

    const userTurn: DialogueTurn = {
      id: `turn-user-${Date.now()}`,
      round: turns.length + 1,
      sender: 'user',
      senderTitle: 'USER DIRECTIVE',
      subtitle: 'Human in the loop',
      message: directiveText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageType: 'REQUEST',
    };

    setTurns((prev) => [...prev, userTurn]);
    setInterruptInput('');

    // Buyer Agent acknowledges
    setActiveActivity('Buyer Agent incorporating human directive...');
    await new Promise((r) => setTimeout(r, 600));

    const buyerResponse = `Understood: "${directiveText}". Recalibrating commercial parameters and negotiating updated terms with the supplier agent.`;

    const buyerTurn: DialogueTurn = {
      id: `turn-buyer-${Date.now()}`,
      round: turns.length + 2,
      sender: 'buyer',
      senderTitle: 'BUYER AGENT',
      subtitle: 'Acme Manufacturing',
      message: buyerResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageType: 'COUNTER',
      offerBadge: 'Directing Seller Agent with updated user parameters',
    };

    setTurns((prev) => [...prev, buyerTurn]);

    // Seller Agent responds
    setActiveActivity('Seller Agent reviewing adjusted directive...');
    await new Promise((r) => setTimeout(r, 700));

    const sellerResponse = `Apex Industrial has evaluated the directive. With the revised parameters, our optimal quote is ${formatMoney(selectedOption.price)} with guaranteed ${selectedOption.deliveryDays}-day fulfillment.`;

    const sellerTurn: DialogueTurn = {
      id: `turn-seller-${Date.now()}`,
      round: turns.length + 3,
      sender: 'seller',
      senderTitle: 'SELLER AGENT',
      subtitle: 'Apex Industrial',
      message: sellerResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageType: 'OFFER',
      offerBadge: `Adjusted Offer: ${formatMoney(selectedOption.price)}`,
    };

    setTurns((prev) => [...prev, sellerTurn]);
    setActiveActivity(null);
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-12 text-zinc-900 font-sans antialiased py-4">
      
      {/* ================================================== */}
      {/* 1. PRIMARY AI COMPOSER & STRUCTURED CONFIRMATION */}
      {/* ================================================== */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            What are you looking to buy?
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Tell your agent what you need. It will search verified suppliers, probe commercial trade-offs, and negotiate automatically.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (promptInput.trim()) {
              executeSearchAndNegotiate(promptInput);
            }
          }}
          className="space-y-3"
        >
          <div className="relative border border-zinc-300 focus-within:border-zinc-900 rounded-lg p-3 bg-white transition-colors shadow-2xs">
            <textarea
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. I need 500 industrial bearings for our Pune plant. They need to arrive within 6 days under ₹4 lakh."
              className="w-full text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none resize-none bg-transparent"
            />
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
              <span className="text-[11px] font-mono text-zinc-400">
                Natural Language Purchasing Request
              </span>
              <button
                type="submit"
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Search & Negotiate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Structured Confirmation Card (Section 6) */}
          {parsedIntent && !parsedIntent.isInfeasible && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono animate-fade-in">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Structured Intent Extracted</span>
                <div className="text-zinc-900 font-medium font-sans flex flex-wrap items-center gap-2">
                  <span>• {formatNumber(parsedIntent.quantity)} {parsedIntent.productQuery}</span>
                  <span>• {parsedIntent.destination}</span>
                  <span>• Within {parsedIntent.deadlineDays} days</span>
                  <span>• Budget ≤ {formatMoney(parsedIntent.maxBudget)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                  <Check className="w-3 h-3" /> Auto-validated
                </span>
              </div>
            </div>
          )}

          {/* Prompt Suggestions */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="text-[11px] font-mono text-zinc-400">Try:</span>
            {promptSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPromptInput(item.query);
                  executeSearchAndNegotiate(item.query);
                }}
                className={`transition-colors cursor-pointer ${
                  item.label.includes('failure')
                    ? 'text-rose-600 hover:text-rose-900 font-medium'
                    : 'text-zinc-600 hover:text-zinc-950 hover:underline'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* ================================================== */}
      {/* INFEASIBILITY / FAILURE CASE HANDLING (Section 31) */}
      {/* ================================================== */}
      {parsedIntent?.isInfeasible && (
        <section className="border-2 border-rose-200 bg-rose-50/50 rounded-xl p-6 space-y-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-700 uppercase tracking-wider">
              <X className="w-4 h-4" />
              <span>NO WORKABLE DEAL FOUND &middot; DETERMINISTIC ENGINE HALT</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-950">
              Commercial Constraints Unsatisfiable
            </h3>
            <p className="text-xs text-zinc-700 leading-relaxed font-normal">
              {parsedIntent.infeasibilityReason}
            </p>
          </div>

          {parsedIntent.infeasibilityRemedies && (
            <div className="space-y-2 pt-2 border-t border-rose-200/60">
              <span className="text-[11px] font-mono text-zinc-600 uppercase font-semibold block">Actionable Remedies:</span>
              <div className="flex flex-wrap gap-2">
                {parsedIntent.infeasibilityRemedies.map((remedy, rIdx) => (
                  <button
                    key={rIdx}
                    onClick={() => {
                      const workablePrompt = 'I need 500 industrial bearings delivered within 6 days under ₹4 lakh';
                      setPromptInput(workablePrompt);
                      executeSearchAndNegotiate(workablePrompt);
                    }}
                    className="text-xs bg-white border border-rose-200 hover:border-zinc-900 px-3 py-1.5 rounded-md text-zinc-800 transition-colors shadow-2xs font-medium cursor-pointer"
                  >
                    {remedy}
                  </button>
                ))}
                <button
                  onClick={rejectDeal}
                  className="text-xs bg-rose-200 hover:bg-rose-300 text-rose-900 font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                >
                  Walk away
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ================================================== */}
      {/* 2. REAL SEARCH UI (Section 8: SEARCH LOOKS LIKE SEARCH) */}
      {/* ================================================== */}
      {searchResult && !parsedIntent?.isInfeasible && (
        <section className="space-y-4 pt-4 border-t border-zinc-200 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
              <Search className="w-4 h-4 text-zinc-400" />
              <span className="font-semibold text-zinc-800">SEARCHING DEALFLOW MARKETPLACE</span>
            </div>
            <span className="text-zinc-500 font-mono text-[11px]">
              {searchResult.stats.totalMatchingProducts} Products Cataloged
            </span>
          </div>

          {/* Search Metrics Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] py-1 bg-zinc-50 p-3 rounded-lg border border-zinc-200/80">
            <div>
              <span className="text-zinc-900 font-semibold block text-sm">{searchResult.stats.totalMatchingProducts}</span>
              <span className="text-zinc-500">Matching Products</span>
            </div>
            <div>
              <span className="text-zinc-900 font-semibold block text-sm">{searchResult.stats.suppliersMeetingQuantity}</span>
              <span className="text-zinc-500">Met Quantity</span>
            </div>
            <div>
              <span className="text-zinc-900 font-semibold block text-sm">{searchResult.stats.suppliersMeetingDelivery}</span>
              <span className="text-zinc-500">Met Delivery SLA</span>
            </div>
            <div>
              <span className="text-emerald-700 font-semibold block text-sm">{searchResult.stats.suppliersMeetingAllRequirements}</span>
              <span className="text-emerald-700">All Criteria Passed</span>
            </div>
          </div>

          {/* Compact Supplier Result List */}
          <div className="overflow-x-auto border border-zinc-200 rounded-lg bg-white">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-50">
                  <th className="py-2.5 px-3 font-semibold">Supplier / Catalog SKU</th>
                  <th className="py-2.5 px-3 font-semibold">Available Stock</th>
                  <th className="py-2.5 px-3 font-semibold">Lead Time</th>
                  <th className="py-2.5 px-3 font-semibold">Reliability</th>
                  <th className="py-2.5 px-3 font-semibold">Catalog Price</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Negotiation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {searchResult.products.slice(0, 3).map((prod) => {
                  const isSelected = prod.supplierId === searchResult.recommendedSupplier.supplierId;
                  return (
                    <tr key={prod.id} className={isSelected ? 'bg-zinc-50/80 font-medium' : 'hover:bg-zinc-50/40'}>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-semibold text-zinc-900">{prod.supplierName}</div>
                        <div className="text-[11px] text-zinc-500">{prod.name}</div>
                      </td>
                      <td className="py-2.5 px-3">{formatNumber(prod.availableQuantity)} units</td>
                      <td className="py-2.5 px-3">{prod.deliveryDaysCapability} days</td>
                      <td className="py-2.5 px-3">{(prod.supplierReliability * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 font-semibold">{formatMoney(prod.unitPrice, true)}</td>
                      <td className="py-2.5 px-3 text-right">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded font-mono font-medium">
                            <Check className="w-2.5 h-2.5" /> Selected &middot; Negotiating
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            Standby Candidate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Buyer Agent Selection Statement */}
          <div className="pl-3 border-l-2 border-zinc-900 py-1 text-xs text-zinc-700 bg-zinc-50/50">
            <span className="font-semibold text-zinc-900 font-mono text-[11px] block">BUYER AGENT SELECTION:</span>
            "{searchResult.recommendedSupplier.supplierName} is the strongest match for your requirements. Opening direct agent-to-agent negotiation."
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* 3. TWO-AGENT COMMERCIAL NEGOTIATION STAGE */}
      {/* (Section 9: TWO REPRESENTATIVES ACROSS A TABLE) */}
      {/* ================================================== */}
      {!parsedIntent?.isInfeasible && turns.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-zinc-200">
          
          {/* Table Header / Representatives Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-zinc-200">
            {/* Buyer Side */}
            <div className="flex items-center justify-between p-3 bg-zinc-50/80 rounded-lg border border-zinc-200/80">
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                  BUYER AGENT
                </div>
                <div className="text-xs font-semibold text-zinc-900">
                  Acme Manufacturing
                </div>
                <div className="text-[11px] text-zinc-500">
                  Representing Buyer &middot; Budget ceiling protected
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-600">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Negotiating</span>
              </div>
            </div>

            {/* Seller Side */}
            <div className="flex items-center justify-between p-3 bg-zinc-50/80 rounded-lg border border-zinc-200/80">
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                  SELLER AGENT
                </div>
                <div className="text-xs font-semibold text-zinc-900">
                  Apex Industrial Components
                </div>
                <div className="text-[11px] text-zinc-500">
                  Representing Seller &middot; Margin floor protected
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-600">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>Active Counter</span>
              </div>
            </div>
          </div>

          {/* Model vs Decision Engine Distinction Banner (Section 13) */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-zinc-50 rounded-lg border border-zinc-200/60 text-center font-mono text-[11px]">
            <div className="space-y-0.5">
              <span className="font-semibold text-zinc-900 block">AI AGENT</span>
              <span className="text-[10px] text-zinc-500 block">Understands &amp; Negotiates</span>
            </div>
            <div className="space-y-0.5 border-x border-zinc-200">
              <span className="font-semibold text-emerald-800 block">DEALFLOW CHECK</span>
              <span className="text-[10px] text-zinc-500 block">Enforces Budget &amp; Margins</span>
            </div>
            <div className="space-y-0.5">
              <span className="font-semibold text-zinc-900 block">HUMAN</span>
              <span className="text-[10px] text-zinc-500 block">Reviews &amp; Authorizes</span>
            </div>
          </div>

          {/* Two-Sided Commercial Conversation Stream */}
          <div className="space-y-6 py-2">
            {turns.map((turn) => {
              if (turn.sender === 'user') {
                return (
                  <div key={turn.id} className="max-w-md">
                    <div className="text-[11px] font-mono text-zinc-400 mb-1 flex items-center justify-between">
                      <span>{turn.senderTitle}</span>
                      <span className="text-zinc-300">{turn.timestamp}</span>
                    </div>
                    <div className="text-xs text-zinc-900 pl-3 border-l-2 border-zinc-900 py-1 font-medium bg-zinc-50/50">
                      "{turn.message}"
                    </div>
                  </div>
                );
              }

              if (turn.sender === 'buyer') {
                return (
                  <div key={turn.id} className="max-w-lg space-y-1.5">
                    <div className="text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                      <span className="font-semibold text-zinc-900">{turn.senderTitle} &middot; {turn.subtitle}</span>
                      <span className="text-zinc-400">{turn.timestamp}</span>
                    </div>

                    {/* Directional Rail Badge */}
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                      <span>─── A2A MESSAGE ───&gt;</span>
                      {turn.offerBadge && (
                        <span className="bg-zinc-100 text-zinc-800 font-medium px-2 py-0.5 rounded border border-zinc-200">
                          {turn.offerBadge}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-800 pl-3 border-l-2 border-zinc-400 py-2 bg-zinc-50/70 leading-relaxed rounded-r-md">
                      {turn.message}
                    </div>

                    {/* Expandable Technical Detail (Section 10) */}
                    {turn.technicalPayload && (
                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={() => togglePayload(turn.id)}
                          className="text-[10px] font-mono text-zinc-400 hover:text-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Code2 className="w-3 h-3" />
                          <span>{expandedPayloadIds[turn.id] ? 'Hide A2A message payload' : 'View A2A message payload'}</span>
                        </button>
                        {expandedPayloadIds[turn.id] && (
                          <pre className="mt-1.5 p-2.5 bg-zinc-900 text-zinc-200 text-[10px] font-mono rounded overflow-x-auto leading-tight">
                            {JSON.stringify(turn.technicalPayload, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              if (turn.sender === 'seller') {
                return (
                  <div key={turn.id} className="max-w-lg ml-auto text-right space-y-1.5">
                    <div className="text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                      <span className="text-zinc-400">{turn.timestamp}</span>
                      <span className="font-semibold text-zinc-900">{turn.senderTitle} &middot; {turn.subtitle}</span>
                    </div>

                    {/* Directional Rail Badge */}
                    <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-zinc-400">
                      {turn.offerBadge && (
                        <span className="bg-zinc-100 text-zinc-800 font-medium px-2 py-0.5 rounded border border-zinc-200">
                          {turn.offerBadge}
                        </span>
                      )}
                      <span>&lt;─── A2A RESPONSE ───</span>
                    </div>

                    <div className="text-xs text-zinc-800 pr-3 border-r-2 border-zinc-900 py-2 bg-zinc-50/70 text-left leading-relaxed rounded-l-md">
                      {turn.message}
                    </div>

                    {/* Expandable Technical Detail (Section 10) */}
                    {turn.technicalPayload && (
                      <div className="pt-0.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => togglePayload(turn.id)}
                          className="text-[10px] font-mono text-zinc-400 hover:text-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Code2 className="w-3 h-3" />
                          <span>{expandedPayloadIds[turn.id] ? 'Hide A2A message payload' : 'View A2A message payload'}</span>
                        </button>
                      </div>
                    )}
                    {expandedPayloadIds[turn.id] && (
                      <pre className="mt-1.5 p-2.5 bg-zinc-900 text-zinc-200 text-[10px] font-mono text-left rounded overflow-x-auto leading-tight">
                        {JSON.stringify(turn.technicalPayload, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              }

              if (turn.sender === 'system') {
                return (
                  <div key={turn.id} className="py-4 border-y border-zinc-200 my-4 bg-zinc-50/60 rounded-lg px-4">
                    <div className="max-w-md mx-auto text-center space-y-1.5">
                      <div className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider font-semibold">
                        {turn.senderTitle}
                      </div>
                      <div className="text-xs text-zinc-900 font-medium">
                        {turn.message}
                      </div>
                      <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-600 font-mono pt-1">
                        <span>✓ Budget Limit</span>
                        <span>✓ Margin Floor (10%)</span>
                        <span>✓ Delivery SLA</span>
                        <span>✓ Spend Authority</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* Active Activity Indicator (Section 11) */}
            {activeActivity && (
              <div className="py-2.5 pl-3 border-l-2 border-zinc-900 text-xs text-zinc-600 font-mono animate-pulse flex items-center gap-2 bg-zinc-50/50">
                <span className="w-2 h-2 rounded-full bg-zinc-900 animate-ping"></span>
                <span>{activeActivity}</span>
              </div>
            )}

            <div ref={turnsEndRef} />
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* 4. THE DECISION MOMENT — DEAL FOUND & ACTIONS (Section 14) */}
      {/* ================================================== */}
      {!parsedIntent?.isInfeasible && !humanApproved && turns.length >= 3 ? (
        <section className="space-y-6 pt-4 border-t border-zinc-200">
          <div className="space-y-3">
            <div className="text-xs font-mono text-emerald-800 uppercase tracking-wider font-semibold">
              Deal found &middot; Recommended Commercial Agreement
            </div>

            {/* Visually Dominating Deal Amount (Section 22) */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-zinc-200 pb-4">
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 font-mono">
                  {formatMoney(selectedOption.price)}
                </div>
                <div className="text-xs text-zinc-600 font-mono pt-1">
                  {formatNumber(selectedOption.qty)} units &middot; {formatMoney(selectedOption.unitPrice, true)} / unit &middot; Delivery: {selectedOption.deliveryDays} days &middot; {selectedOption.terms}
                </div>
              </div>

              {selectedOption.savings && (
                <div className="text-xs text-emerald-700 font-medium font-mono">
                  {typeof selectedOption.savings === 'number' ? `₹${selectedOption.savings.toLocaleString()} saved vs budget` : selectedOption.savings}
                </div>
              )}
            </div>

            {/* Why This Deal? (Section 14) */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-zinc-900">
                Why this deal?
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-600 pl-3 border-l-2 border-zinc-300">
                {selectedOption.whyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons (Section 14) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={approveDeal}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              Approve deal <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleUserInterrupt('Try to get another ₹10,000 off by offering upfront cash payment.')}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Try for a better price
            </button>

            <button
              onClick={() => setShowOptionsList(!showOptionsList)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {showOptionsList ? 'Hide alternatives' : 'Show alternatives'}
              {showOptionsList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={rejectDeal}
              className="text-zinc-500 hover:text-rose-700 font-medium text-xs px-3 py-2.5 transition-colors cursor-pointer"
            >
              Walk away
            </button>
          </div>

          {/* STRUCTURED ALTERNATIVES TABLE (Section 15) */}
          {showOptionsList && (
            <div className="pt-4 space-y-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Structured Deal Comparison &middot; Deterministic Outcomes
              </span>

              <div className="overflow-x-auto border border-zinc-200 rounded-lg bg-white">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-200 text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-50">
                      <th className="py-2.5 px-3 font-semibold">Option</th>
                      <th className="py-2.5 px-3 font-semibold">Total Price</th>
                      <th className="py-2.5 px-3 font-semibold">Unit Rate</th>
                      <th className="py-2.5 px-3 font-semibold">Delivery SLA</th>
                      <th className="py-2.5 px-3 font-semibold">Quantity</th>
                      <th className="py-2.5 px-3 font-semibold">Payment Terms</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-800">
                    {dealOptions.map((opt) => {
                      const isSelected = selectedOptionIndex === opt.index;
                      return (
                        <tr key={opt.index} className={isSelected ? 'bg-zinc-50/80 font-semibold' : 'hover:bg-zinc-50/40'}>
                          <td className="py-2.5 px-3 font-sans">
                            <span className="text-zinc-400 font-mono text-[10px] mr-1.5">0{opt.index + 1}</span>
                            <span className="text-zinc-900">{opt.title}</span>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-950 font-bold">{formatMoney(opt.price)}</td>
                          <td className="py-2.5 px-3 text-zinc-600">{formatMoney(opt.unitPrice, true)}</td>
                          <td className="py-2.5 px-3">{opt.deliveryDays} days</td>
                          <td className="py-2.5 px-3">{formatNumber(opt.qty)} units</td>
                          <td className="py-2.5 px-3 text-zinc-600">{opt.terms}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOptionIndex(opt.index);
                                setShowOptionsList(false);
                              }}
                              className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${
                                isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                              }`}
                            >
                              {isSelected ? 'Selected' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USER INTERRUPT & DIRECTIVE COMPOSER (Section 17) */}
          <div className="pt-4 border-t border-zinc-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-800">
                Instruct your agent to adjust the deal:
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserInterrupt(interruptInput);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={interruptInput}
                onChange={(e) => setInterruptInput(e.target.value)}
                placeholder="e.g. Try to get another ₹10,000 off, or Delivery is more important than price"
                className="flex-1 text-xs border border-zinc-300 focus:border-zinc-900 rounded-md px-3 py-2 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-3.5 py-2 rounded-md transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3 h-3" />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-500">
              <span className="font-mono text-zinc-400">Quick directives:</span>
              {interruptChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUserInterrupt(chip.instruction)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : humanApproved ? (
        /* ================================================== */
        /* 5. DEAL COMPLETED — TRANSFORM INTO BEAUTIFUL DEAL RECORD */
        /* ================================================== */
        <section className="space-y-8 pt-4 border-t border-zinc-200">
          <div className="space-y-2">
            <div className="text-xs font-mono text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Deal #DF-1048 &middot; Approved and Ready to Execute</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Acme Manufacturing &times; Apex Industrial
            </h2>
            <p className="text-xs text-zinc-600">
              Commercial agreement authorized by buyer. Digital contract generated and ready for digital settlement.
            </p>
          </div>

          {/* Deal Numbers Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-zinc-200 font-mono text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">TOTAL AMOUNT</span>
              <span className="text-2xl font-bold text-zinc-950 mt-0.5 block">{formatMoney(selectedOption.price)}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">QUANTITY</span>
              <span className="text-2xl font-bold text-zinc-950 mt-0.5 block">{formatNumber(selectedOption.qty)} units</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">DELIVERY SLA</span>
              <span className="text-2xl font-bold text-zinc-950 mt-0.5 block">{selectedOption.deliveryDays} days</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">TERMS</span>
              <span className="text-base font-bold text-zinc-950 mt-1 block">{selectedOption.terms}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('contract')}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" /> View Signed Contract
            </button>

            <button
              onClick={() => setActiveTab('payment')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" /> Pay with Razorpay
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Policy Audit Evidence
            </button>

            <button
              onClick={() => {
                executeSearchAndNegotiate(promptInput);
              }}
              className="text-zinc-500 hover:text-zinc-900 font-medium text-xs px-3 py-2.5 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3 h-3" /> Start new negotiation
            </button>
          </div>
        </section>
      ) : null}

      {/* Modify Parameters Modal */}
      {isModifyOpen && (
        <ModifyModal
          policy={buyerPolicy}
          onClose={() => setIsModifyOpen(false)}
          onApply={(updated) => {
            modifyParameters(updated);
            setIsModifyOpen(false);
          }}
        />
      )}
    </div>
  );
}
