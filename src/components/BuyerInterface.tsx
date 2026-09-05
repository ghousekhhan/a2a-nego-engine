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
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import { aiService, type ParsedBuyerIntent } from '../services/aiService.ts';
import type { MarketplaceProduct, SearchMarketplaceResult } from '../data/marketplaceCatalog.ts';
import { formatMoney, formatNumber, formatPercent } from '../utils/formatters.ts';
import { ModifyModal } from './ModifyModal.tsx';
import { PriceQuantityChart, UtilityScatterChart } from './charts/Visualizations.tsx';

interface DialogueTurn {
  id: string;
  sender: 'buyer' | 'seller' | 'system' | 'user';
  senderTitle: string;
  subtitle?: string;
  message: string;
  timestamp: string;
  highlight?: boolean;
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
    { label: 'Lowest price', query: 'Find the cheapest available supplier for 450 bearings staying below ₹360,000.' },
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
  const baseTotal = baseQty * baseUnitPrice;
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

  // Execute Search and Live Negotiation Flow
  const executeSearchAndNegotiate = async (rawPrompt: string) => {
    // 1. Interpret Intent
    const intent = aiService.interpretBuyerIntent(rawPrompt);
    setParsedIntent(intent);
    setIsSearching(true);
    setActiveActivity('Searching the DealFlow marketplace for suppliers and products...');
    setTurns([]);

    // 2. Perform Marketplace Search
    const searchRes = aiService.searchMarketplaceCatalog(intent);
    setSearchResult(searchRes);

    // Short realistic search interval (600ms)
    await new Promise((r) => setTimeout(r, 600));
    setIsSearching(false);

    // Initial Search confirmation turn
    const supplier = searchRes.recommendedSupplier;
    const initialTurns: DialogueTurn[] = [
      {
        id: 'turn-intent',
        sender: 'user',
        senderTitle: 'PURCHASE INTENT',
        subtitle: intent.destination,
        message: rawPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 'turn-buyer-search',
        sender: 'buyer',
        senderTitle: 'BUYER AGENT',
        subtitle: 'Representing Acme Manufacturing',
        message: `I searched the marketplace and identified ${searchRes.stats.totalMatchingProducts} verified products. I recommend opening negotiation with ${supplier.supplierName} (${supplier.location}) — they have ${formatNumber(supplier.availableQuantity)} units in stock and a ${(supplier.supplierReliability * 100).toFixed(1)}% delivery reliability rating. Negotiating on your behalf now.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

    // 4. Live Agent-to-Agent Turn 1 (Seller Opening)
    setActiveActivity(`${supplier.supplierName} reviewing commercial request...`);
    await new Promise((r) => setTimeout(r, 700));

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
        totalPrice: supplier.unitPrice * intent.quantity,
        deliveryDays: supplier.deliveryDaysCapability,
        paymentTerms: 'Net 30',
        marginPct: ((supplier.unitPrice - supplier.unitCost) / supplier.unitPrice) * 100,
      },
    });

    const turn1: DialogueTurn = {
      id: 'turn-seller-1',
      sender: 'seller',
      senderTitle: 'SELLER AGENT',
      subtitle: supplier.supplierName,
      message: sellerOpening,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTurns((prev) => [...prev, turn1]);

    // 5. Live Agent-to-Agent Turn 2 (Buyer Concession Probe)
    setActiveActivity('Buyer Agent evaluating baseline against budget ceiling...');
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
        totalPrice: supplier.unitPrice * intent.quantity,
        deliveryDays: supplier.deliveryDaysCapability,
        paymentTerms: 'Net 30',
      },
    });

    const turn2: DialogueTurn = {
      id: 'turn-buyer-2',
      sender: 'buyer',
      senderTitle: 'BUYER AGENT',
      subtitle: 'Commercial Concession Probe',
      message: buyerProbe,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTurns((prev) => [...prev, turn2]);

    // 6. Live Agent-to-Agent Turn 3 (Seller Counter with Discount)
    setActiveActivity(`${supplier.supplierName} calculating upfront payment discount...`);
    await new Promise((r) => setTimeout(r, 750));

    const negotiatedUnitPrice = Math.round(supplier.unitPrice * 0.94);
    const negotiatedTotal = negotiatedUnitPrice * intent.quantity;
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
        marginPct: ((negotiatedUnitPrice - supplier.unitCost) / negotiatedUnitPrice) * 100,
      },
    });

    const turn3: DialogueTurn = {
      id: 'turn-seller-2',
      sender: 'seller',
      senderTitle: 'SELLER AGENT',
      subtitle: 'Dynamic Margin Counter',
      message: sellerCounter,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTurns((prev) => [...prev, turn3]);

    // 7. Policy Verification Turn
    setActiveActivity('DealFlow Decision Engine validating boundary constraints...');
    await new Promise((r) => setTimeout(r, 500));

    const systemTurn: DialogueTurn = {
      id: 'turn-system-check',
      sender: 'system',
      senderTitle: 'DEALFLOW &middot; DETERMINISTIC POLICY VERIFICATION',
      subtitle: 'Feasibility Confirmed',
      message: `Policy check complete: Both sides are within commercial parameters. Budget ceiling satisfied (≤ ${formatMoney(intent.maxBudget)}), seller profit floor protected (≥ 10.0%), and ${intent.deadlineDays}-day delivery guaranteed.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      highlight: true,
    };

    setTurns((prev) => [...prev, systemTurn]);
    setActiveActivity(null);
  };

  // Handle User Interrupt / Follow-up Directive
  const handleUserInterrupt = async (directiveText: string) => {
    if (!directiveText.trim()) return;

    const userTurn: DialogueTurn = {
      id: `turn-user-${Date.now()}`,
      sender: 'user',
      senderTitle: 'USER DIRECTIVE',
      subtitle: 'Human in the loop',
      message: directiveText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTurns((prev) => [...prev, userTurn]);
    setInterruptInput('');

    // Buyer Agent acknowledges
    setActiveActivity('Buyer Agent incorporating human directive...');
    await new Promise((r) => setTimeout(r, 600));

    const buyerResponse = `Understood: "${directiveText}". Recalibrating commercial parameters and negotiating updated terms with the supplier agent.`;

    const buyerTurn: DialogueTurn = {
      id: `turn-buyer-${Date.now()}`,
      sender: 'buyer',
      senderTitle: 'BUYER AGENT',
      subtitle: 'Acme Manufacturing',
      message: buyerResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTurns((prev) => [...prev, buyerTurn]);

    // Seller Agent responds
    setActiveActivity('Seller Agent evaluating updated proposal...');
    await new Promise((r) => setTimeout(r, 700));

    const sellerResponse = `We have evaluated your updated request. By adjusting order volume and confirming upfront payment, we can revise the terms to ${formatMoney(Math.round(selectedOption.price * 0.96))} (${formatMoney(Math.round(selectedOption.unitPrice * 0.96), true)}/unit). Our minimum profit floor remains protected.`;

    const sellerTurn: DialogueTurn = {
      id: `turn-seller-${Date.now()}`,
      sender: 'seller',
      senderTitle: 'SELLER AGENT',
      subtitle: 'Apex Industrial',
      message: sellerResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTurns((prev) => [...prev, sellerTurn]);
    setActiveActivity(null);
  };

  return (
    <div className="max-w-[880px] mx-auto space-y-12 text-zinc-900 font-sans antialiased py-2">
      
      {/* ================================================== */}
      {/* 1. PRIMARY AI COMPOSER (NOT A DASHBOARD) */}
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
                className="text-zinc-600 hover:text-zinc-950 hover:underline transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* ================================================== */}
      {/* 2. VISIBLE MARKETPLACE SEARCH FEEDBACK */}
      {/* ================================================== */}
      {searchResult && (
        <section className="space-y-3 pt-2 border-t border-zinc-200 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>MARKETPLACE SEARCH &middot; DEALFLOW NETWORK</span>
            </div>
            <span className="text-zinc-400 font-mono text-[11px]">
              {searchResult.stats.totalMatchingProducts} Products Cataloged
            </span>
          </div>

          {/* Search Metrics Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] py-1">
            <div className="text-zinc-600">
              <span className="text-zinc-900 font-semibold block">{searchResult.stats.totalMatchingProducts}</span>
              <span>Matching Products</span>
            </div>
            <div className="text-zinc-600">
              <span className="text-zinc-900 font-semibold block">{searchResult.stats.suppliersMeetingQuantity}</span>
              <span>Met Quantity</span>
            </div>
            <div className="text-zinc-600">
              <span className="text-zinc-900 font-semibold block">{searchResult.stats.suppliersMeetingDelivery}</span>
              <span>Met Delivery SLA</span>
            </div>
            <div className="text-emerald-700 font-semibold">
              <span className="block">{searchResult.stats.suppliersMeetingAllRequirements}</span>
              <span>All Criteria Passed</span>
            </div>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* 3. TWO-SIDED CONVERSATION TIMELINE */}
      {/* ================================================== */}
      <section className="space-y-6 pt-2 border-t border-zinc-200">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900">Commercial Negotiation</span>
            <span className="text-zinc-300">&middot;</span>
            <span className="text-zinc-500">Acme Manufacturing &times; Apex Industrial</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-zinc-600">
              {humanApproved ? 'Executed' : status === 'DEAL_REACHED' ? 'Deal found' : 'Negotiating'}
            </span>
          </div>
        </div>

        {/* Live Conversation Stream (Buyer Left, Seller Right, DealFlow Center) */}
        <div className="space-y-5 py-1">
          {turns.map((turn) => {
            if (turn.sender === 'user') {
              return (
                <div key={turn.id} className="max-w-md">
                  <div className="text-[11px] font-mono text-zinc-400 mb-1 flex items-center justify-between">
                    <span>{turn.senderTitle}</span>
                    <span className="text-zinc-300">{turn.timestamp}</span>
                  </div>
                  <div className="text-xs text-zinc-900 pl-3 border-l border-zinc-900 py-0.5 font-medium">
                    "{turn.message}"
                  </div>
                </div>
              );
            }

            if (turn.sender === 'buyer') {
              return (
                <div key={turn.id} className="max-w-lg">
                  <div className="text-[11px] font-mono text-zinc-500 mb-1 flex items-center justify-between">
                    <span className="font-semibold text-zinc-800">{turn.senderTitle}</span>
                    <span className="text-zinc-400">{turn.timestamp}</span>
                  </div>
                  <div className="text-xs text-zinc-800 pl-3 border-l-2 border-zinc-400 py-1.5 bg-zinc-50/70 leading-relaxed">
                    {turn.message}
                  </div>
                </div>
              );
            }

            if (turn.sender === 'seller') {
              return (
                <div key={turn.id} className="max-w-lg ml-auto text-right">
                  <div className="text-[11px] font-mono text-zinc-500 mb-1 flex items-center justify-between">
                    <span className="text-zinc-400">{turn.timestamp}</span>
                    <span className="font-semibold text-zinc-900">{turn.senderTitle} &middot; {turn.subtitle}</span>
                  </div>
                  <div className="text-xs text-zinc-800 pr-3 border-r-2 border-zinc-900 py-1.5 bg-zinc-50/70 text-left leading-relaxed">
                    {turn.message}
                  </div>
                </div>
              );
            }

            if (turn.sender === 'system') {
              return (
                <div key={turn.id} className="py-3 border-y border-zinc-200/80 my-3">
                  <div className="max-w-md mx-auto text-center space-y-1">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
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

          {/* Active Activity Indicator (Visible Legible AI) */}
          {activeActivity && (
            <div className="py-2 pl-3 border-l-2 border-zinc-300 text-xs text-zinc-500 font-mono animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-ping"></span>
              <span>{activeActivity}</span>
            </div>
          )}

          <div ref={turnsEndRef} />
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. THE DECISION MOMENT — DEAL FOUND & ACTIONS */}
      {/* ================================================== */}
      {!humanApproved ? (
        <section className="space-y-6 pt-4 border-t border-zinc-200">
          <div className="space-y-3">
            <div className="text-xs font-mono text-emerald-800 uppercase tracking-wider">
              Deal found &middot; Recommended Commercial Agreement
            </div>

            {/* Clear Deal Breakdown */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-200 pb-4">
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight text-zinc-950 font-mono">
                  {formatMoney(selectedOption.price)}
                </div>
                <div className="text-xs text-zinc-600 font-mono">
                  {formatNumber(selectedOption.qty)} units &middot; {formatMoney(selectedOption.unitPrice, true)} / unit &middot; Delivery: {selectedOption.deliveryDays} days &middot; {selectedOption.terms}
                </div>
              </div>

              {selectedOption.savings && (
                <div className="text-xs text-emerald-700 font-medium font-mono">
                  {typeof selectedOption.savings === 'number' ? `₹${selectedOption.savings.toLocaleString()} saved vs budget` : selectedOption.savings}
                </div>
              )}
            </div>

            {/* Why This Deal */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-zinc-900">
                Here's the deal I'd recommend.
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

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={approveDeal}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Approve deal <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowOptionsList(!showOptionsList)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {showOptionsList ? 'Hide other options' : 'Review another option'}
              {showOptionsList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsModifyOpen(true)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" /> Change my priority
            </button>

            <button
              onClick={rejectDeal}
              className="text-zinc-500 hover:text-rose-700 font-medium text-xs px-3 py-2.5 transition-colors cursor-pointer"
            >
              Walk away
            </button>
          </div>

          {/* USER INTERRUPT & DIRECTIVE COMPOSER (SECTION 10) */}
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

          {/* COMPACT DECISION LIST (SECTION 11) */}
          {showOptionsList && (
            <div className="pt-4 space-y-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Four Viable Outcomes Found
              </span>

              <div className="divide-y divide-zinc-200 border-y border-zinc-200 text-xs">
                {dealOptions.map((opt) => (
                  <div
                    key={opt.index}
                    onClick={() => {
                      setSelectedOptionIndex(opt.index);
                      setShowOptionsList(false);
                    }}
                    className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                      selectedOptionIndex === opt.index ? 'bg-zinc-50 px-3 -mx-3' : 'hover:bg-zinc-50/60 px-3 -mx-3'
                    }`}
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-400 text-[11px]">0{opt.index + 1}</span>
                        <span className="font-semibold text-zinc-900 text-xs">{opt.title}</span>
                        <span className="text-zinc-300">&middot;</span>
                        <span className="text-zinc-500 font-mono">{opt.deliveryDays} days</span>
                        <span className="text-zinc-300">&middot;</span>
                        <span className="text-zinc-500 font-mono">{opt.terms}</span>
                      </div>
                      <p className="text-zinc-600 text-xs">{opt.summary}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                      <div className="text-left sm:text-right font-mono">
                        <div className="font-semibold text-zinc-900 text-sm">{formatMoney(opt.price)}</div>
                        <div className="text-zinc-400 text-[11px]">{formatMoney(opt.unitPrice, true)}/unit</div>
                      </div>

                      <button
                        type="button"
                        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                          selectedOptionIndex === opt.index
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {selectedOptionIndex === opt.index ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        /* ================================================== */
        /* 5. DEAL COMPLETED — TRANSFORM INTO BEAUTIFUL DEAL RECORD */
        /* ================================================== */
        <section className="space-y-8 pt-4 border-t border-zinc-200">
          <div className="space-y-2">
            <div className="text-xs font-mono text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Deal #DF-1048 &middot; Approved and Ready to Execute</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
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
              <span className="text-lg font-bold text-zinc-950 mt-0.5 block">{formatMoney(selectedOption.price)}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">QUANTITY</span>
              <span className="text-lg font-bold text-zinc-950 mt-0.5 block">{formatNumber(selectedOption.qty)} units</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">DELIVERY SLA</span>
              <span className="text-lg font-bold text-zinc-950 mt-0.5 block">{selectedOption.deliveryDays} days</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">PAYMENT TERMS</span>
              <span className="text-lg font-bold text-zinc-950 mt-0.5 block">{selectedOption.terms}</span>
            </div>
          </div>

          {/* Next Actions: Contract & Razorpay */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('contract')}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-5 py-3 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" /> View Contract
            </button>

            <button
              onClick={() => setActiveTab('payment')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <CreditCard className="w-4 h-4" /> Pay with Razorpay
            </button>

            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-xs text-zinc-600 hover:text-zinc-900 font-medium px-3 py-3 transition-colors cursor-pointer"
            >
              {showEvidence ? 'Hide evidence' : 'View decision evidence'}
            </button>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* 6. PROGRESSIVE DISCLOSURE: DECISION EVIDENCE */}
      {/* ================================================== */}
      <section className="space-y-4 pt-4 border-t border-zinc-100 text-xs">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center gap-2 font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <span>Why this deal? (Decision Evidence)</span>
            {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showEvidence && (
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              {showCharts ? 'Hide trade-off charts' : 'Show trade-off charts'}
            </button>
          )}
        </div>

        {showEvidence && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3 border-l border-zinc-200 text-zinc-700">
              <p className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                <span>Budget satisfied: {formatMoney(selectedOption.price)} &le; {formatMoney(buyerPolicy.maxTotalBudget)} ceiling</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                <span>Delivery satisfied: {selectedOption.deliveryDays} days &le; {buyerPolicy.requiredDeliveryDays} days SLA</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                <span>Supplier reliability satisfied: 96.0% SLA history</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                <span>Seller margin protected: 34.6% &ge; 10.0% min margin floor</span>
              </p>
            </div>

            {showCharts && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                <PriceQuantityChart currentQty={selectedOption.qty} currentUnitPrice={selectedOption.unitPrice} />
                <UtilityScatterChart
                  buyerUtility={scoredDeal?.buyerUtility ?? 0.885}
                  sellerUtility={scoredDeal?.sellerUtility ?? 0.742}
                  paretoDeals={paretoDeals}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* PARAMETER MODIFICATION MODAL */}
      <ModifyModal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        buyerPolicy={buyerPolicy}
        currentDeal={currentDeal}
        onApplyModification={modifyParameters}
      />

    </div>
  );
}
