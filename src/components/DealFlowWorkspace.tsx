import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileText,
  CreditCard,
  Building2,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Send,
  AlertCircle,
  Filter,
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import { aiService, type ParsedBuyerIntent } from '../services/aiService.ts';
import {
  MARKETPLACE_PRODUCTS,
  searchMarketplace,
  type MarketplaceProduct,
  type SearchMarketplaceResult,
} from '../data/marketplaceCatalog.ts';
import { CANONICAL_SCENARIOS } from '../data/canonicalScenarios.ts';
import { formatMoney, formatNumber, formatPercent } from '../utils/formatters.ts';

type ContextView = 'search' | 'product_detail' | 'current_offer' | 'comparison' | 'deal_view' | 'evidence';

interface DialogueMessage {
  id: string;
  sender: 'user' | 'buyer' | 'seller' | 'system';
  senderTitle: string;
  subtitle?: string;
  text: string;
  timestamp: string;
  commercialMetrics?: {
    price?: number;
    unitPrice?: number;
    quantity?: number;
    deliveryDays?: number;
    terms?: string;
  };
}

export function DealFlowWorkspace({ state }: { state: CanonicalState }) {
  const {
    buyerPolicy,
    sellerPolicy,
    supplierFacts,
    currentDeal,
    scoredDeal,
    status,
    round,
    maxRounds,
    humanApproved,
    startCustomNegotiation,
    approveDeal,
    rejectDeal,
    loadScenario,
    setActiveTab,
  } = state;

  // Hybrid Context View state
  const [contextView, setContextView] = useState<ContextView>('current_offer');
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct>(MARKETPLACE_PRODUCTS[0]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('industrial bearings');
  const [filterDelivery, setFilterDelivery] = useState<number>(0); // 0 = all
  const [filterMinQty, setFilterMinQty] = useState<number>(0);
  const [filterPriority, setFilterPriority] = useState<'overall' | 'price' | 'delivery' | 'reliability'>('overall');
  const [searchResults, setSearchResults] = useState<MarketplaceProduct[]>(MARKETPLACE_PRODUCTS);

  // Conversational Control Center state
  const [promptInput, setPromptInput] = useState<string>('');
  const [aiAssistantReply, setAiAssistantReply] = useState<string>(
    'Commercial agents active. State your purchasing requirements or choose an intent below.'
  );

  // Agent activity indicators (Safe high-level indicators)
  const [buyerActivity, setBuyerActivity] = useState<'Searching' | 'Evaluating' | 'Negotiating' | 'Waiting'>('Evaluating');
  const [sellerActivity, setSellerActivity] = useState<'Reviewing request' | 'Checking inventory' | 'Evaluating offer' | 'Responding'>('Responding');

  // Dialogue messages
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([
    {
      id: 'd-1',
      sender: 'user',
      senderTitle: 'PURCHASE DIRECTIVE',
      subtitle: 'Acme Manufacturing',
      text: 'Procure 500 SKF 6205 bearings within 6 days for Pune assembly line. Ceiling budget: ₹390,000.',
      timestamp: '10:02 AM',
    },
    {
      id: 'd-2',
      sender: 'buyer',
      senderTitle: 'BUYER AGENT',
      subtitle: 'Representing Acme Manufacturing',
      text: 'Requesting binding quotation for 500 units bearing-6205. Target delivery SLA 6 days, payment standard 30 days.',
      timestamp: '10:02 AM',
      commercialMetrics: { price: 390000, unitPrice: 780, quantity: 500, deliveryDays: 6, terms: 'Net 30' },
    },
    {
      id: 'd-3',
      sender: 'seller',
      senderTitle: 'SELLER AGENT',
      subtitle: 'Representing Apex Industrial Components',
      text: 'Standard quotation for 500 units is ₹405,000 at ₹810/unit. However, with upfront payment financing, I can discount to ₹382,500 (₹765/unit) with 6-day delivery guaranteed.',
      timestamp: '10:03 AM',
      commercialMetrics: { price: 382500, unitPrice: 765, quantity: 500, deliveryDays: 6, terms: 'Upfront' },
    },
  ]);

  const dialogueEndRef = useRef<HTMLDivElement>(null);

  // Quick prompt suggestions
  const promptPills = [
    { label: '500 bearings (₹3.9L)', query: 'I need 500 industrial bearings under ₹3.9 lakh delivered within 6 days.' },
    { label: '200 pumps', query: 'Procure 200 centrifugal water pumps for plant expansion within 5 days under ₹80 lakh.' },
    { label: 'Cheap reliable', query: 'Find the lowest cost reliable supplier for 500 bearings staying below ₹360,000.' },
    { label: 'Fastest delivery', query: 'Need 500 bearings as fast as possible (within 3 days) with high reliability.' },
  ];

  // Quick interrupt chips during negotiation
  const interruptChips = [
    { label: 'Ask for lower price', text: 'Can the supplier offer another ₹10,000 discount with upfront payment?' },
    { label: 'Prioritize delivery (3d)', text: 'Can we expedite delivery to 3 days if we accept Net 15 terms?' },
    { label: 'Increase volume to 600', text: 'Can we increase volume to 600 units to unlock a lower unit price tier?' },
    { label: 'Compare options', text: 'Show all 4 structured commercial options.' },
  ];

  // 4 Structured Comparison Options
  const baseQty = currentDeal?.items?.[0]?.quantity ?? buyerPolicy?.requiredQuantity ?? 500;
  const dealOptions = [
    {
      title: 'BEST OVERALL',
      price: 382500,
      unitPrice: 765,
      qty: 500,
      delivery: '6 days',
      terms: 'Upfront payment',
      supplier: 'Apex Industrial',
      score: 94.2,
      summary: 'Optimal balance of price, delivery SLA and supplier reliability.',
      scenarioId: 'scenario-01',
    },
    {
      title: 'LOWEST PRICE',
      price: 360000,
      unitPrice: 800,
      qty: 450,
      delivery: '6 days',
      terms: 'Net 30',
      supplier: 'Nova MRO Supplies',
      score: 88.5,
      summary: 'Minimizes cash outlay to target budget with reduced order volume.',
      scenarioId: 'scenario-02',
    },
    {
      title: 'FASTEST DELIVERY',
      price: 390000,
      unitPrice: 780,
      qty: 500,
      delivery: '3 days',
      terms: 'Net 30',
      supplier: 'Meridian Bearings',
      score: 91.0,
      summary: 'Expedited 3-day turnaround for urgent factory production.',
      scenarioId: 'scenario-06',
    },
    {
      title: 'BEST UNIT ECONOMICS',
      price: 417270,
      unitPrice: 695.45,
      qty: 600,
      delivery: '6 days',
      terms: 'Upfront payment',
      supplier: 'Apex Industrial',
      score: 93.8,
      summary: 'Unlocks maximum tier volume discount at ₹695.45 per unit.',
      scenarioId: 'scenario-03',
    },
  ];

  // Perform marketplace search whenever search inputs change
  useEffect(() => {
    const intent: ParsedBuyerIntent = {
      productQuery: searchQuery,
      quantity: filterMinQty || 500,
      maxBudget: 500000,
      targetBudget: 400000,
      deadlineDays: filterDelivery || 7,
      paymentPreference: 'any',
      destination: 'Pune, Maharashtra',
      priority: filterPriority === 'overall' ? 'balanced' : filterPriority,
    };

    const res = searchMarketplace(intent);
    setSearchResults(res.products);
  }, [searchQuery, filterDelivery, filterMinQty, filterPriority]);

  // Handle natural language intent submission
  const handleSendIntent = async (textToSend?: string) => {
    const input = (textToSend || promptInput).trim();
    if (!input) return;

    setPromptInput('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add User directive to dialogue
    const userMsg: DialogueMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      senderTitle: 'PURCHASE DIRECTIVE',
      subtitle: 'Human User',
      text: input,
      timestamp: timeStr,
    };

    setDialogue((prev) => [...prev, userMsg]);

    // 2. Parse intent via real AI service
    const intent = aiService.interpretBuyerIntent(input);
    setSearchQuery(intent.productQuery || 'bearings');

    // 3. AI Assistant acknowledgment
    setAiAssistantReply(`Interpreted requirement: ${intent.quantity} units, target ₹${intent.targetBudget.toLocaleString()}, delivery within ${intent.deadlineDays} days. Querying supplier catalog...`);
    setBuyerActivity('Searching');
    setSellerActivity('Reviewing request');

    // 4. Trigger search view on search-oriented prompts
    if (input.toLowerCase().includes('find') || input.toLowerCase().includes('search') || input.toLowerCase().includes('show supplier') || input.toLowerCase().includes('suppliers')) {
      setContextView('search');
    }

    // 5. Query marketplace
    const searchRes = aiService.searchMarketplaceCatalog(intent);
    const topSupplier = searchRes.recommendedSupplier;
    setSelectedProduct(topSupplier);

    // 6. Buyer agent response in chat
    setTimeout(() => {
      setBuyerActivity('Negotiating');
      const buyerMsg: DialogueMessage = {
        id: `b-${Date.now()}`,
        sender: 'buyer',
        senderTitle: 'BUYER AGENT',
        subtitle: 'Acme Manufacturing',
        text: `Identified ${searchRes.stats.totalMatchingProducts} suppliers. Initiating negotiation with ${topSupplier.supplierName} for ${intent.quantity} units (Target: ₹${intent.targetBudget.toLocaleString()}, delivery ≤ ${intent.deadlineDays}d).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        commercialMetrics: { price: intent.targetBudget, quantity: intent.quantity, deliveryDays: intent.deadlineDays },
      };
      setDialogue((prev) => [...prev, buyerMsg]);

      // Start custom negotiation in state
      startCustomNegotiation(
        topSupplier.name,
        intent.quantity,
        intent.targetBudget,
        intent.maxBudget,
        intent.deadlineDays,
        intent.paymentPreference,
        topSupplier.supplierId
      );

      // 7. Seller Agent response
      setTimeout(async () => {
        setSellerActivity('Responding');
        const sellerText = await aiService.generateSellerMessage({
          turnNumber: 1,
          productName: topSupplier.name,
          quantity: intent.quantity,
          supplierName: topSupplier.supplierName,
          unitCost: topSupplier.unitCost,
          minMarginFloorPct: topSupplier.minMargin * 100,
          availableStock: topSupplier.availableQuantity,
          currentCounterOffer: {
            unitPrice: topSupplier.unitPrice,
            totalPrice: topSupplier.unitPrice * intent.quantity,
            deliveryDays: topSupplier.deliveryDaysCapability,
            paymentTerms: 'Net 30',
            marginPct: ((topSupplier.unitPrice - topSupplier.unitCost) / topSupplier.unitPrice) * 100,
          },
        });

        const sellerMsg: DialogueMessage = {
          id: `s-${Date.now()}`,
          sender: 'seller',
          senderTitle: 'SELLER AGENT',
          subtitle: topSupplier.supplierName,
          text: sellerText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          commercialMetrics: {
            price: topSupplier.unitPrice * intent.quantity,
            unitPrice: topSupplier.unitPrice,
            quantity: intent.quantity,
            deliveryDays: topSupplier.deliveryDaysCapability,
            terms: 'Net 30',
          },
        };
        setDialogue((prev) => [...prev, sellerMsg]);
        setBuyerActivity('Evaluating');
        setSellerActivity('Waiting');
        setContextView('current_offer');
      }, 700);
    }, 500);
  };

  // Scroll to bottom of dialogue
  useEffect(() => {
    dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogue]);

  // Current live offer metrics
  const activePrice = scoredDeal?.totalBuyerCost ?? currentDeal?.items?.[0]?.unitPrice * (currentDeal?.items?.[0]?.quantity ?? 500) ?? 382500;
  const activeQty = currentDeal?.items?.[0]?.quantity ?? 500;
  const activeUnitPrice = Math.round(activePrice / activeQty);
  const activeDelivery = currentDeal?.deliveryDays ?? 6;
  const activeTerms = currentDeal?.paymentTerms === 'upfront' ? 'Upfront payment' : 'Net 30';
  const activeSupplier = selectedProduct?.supplierName ?? 'Apex Industrial Components';

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] text-zinc-900 font-sans antialiased">
      
      {/* ================================================== */}
      {/* 1. LEFT PANEL: NAVIGATION & RECENT DEALS */}
      {/* ================================================== */}
      <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
        
        {/* Workspace Quick Actions */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-3.5 space-y-2.5 shadow-2xs">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Workspace Views
          </div>
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => setContextView('current_offer')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                contextView === 'current_offer' ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span>Negotiation View</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
            <button
              onClick={() => setContextView('search')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                contextView === 'search' || contextView === 'product_detail' ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span>Marketplace Search</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
            <button
              onClick={() => setContextView('comparison')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                contextView === 'comparison' ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span>Deal Comparison</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
            <button
              onClick={() => setContextView('deal_view')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                contextView === 'deal_view' ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span>Final Deal Summary</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
            <button
              onClick={() => setContextView('evidence')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                contextView === 'evidence' ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span>Policy Evidence</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </nav>
        </div>

        {/* Recent Deals Drawer */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-3.5 space-y-3 shadow-2xs flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Recent Deals
            </span>
            <span className="text-[10px] font-mono text-zinc-400">4 total</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Active Deal */}
            <div
              onClick={() => setContextView('deal_view')}
              className="p-2.5 rounded-md border border-zinc-900 bg-zinc-50/70 cursor-pointer space-y-1 hover:bg-zinc-100/80 transition-colors"
            >
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="font-semibold text-zinc-900">#DF-1048</span>
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium">
                  {humanApproved ? 'Executed' : 'Negotiating'}
                </span>
              </div>
              <div className="font-medium text-zinc-900 truncate">SKF 6205 Bearings</div>
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span>Apex Industrial</span>
                <span className="font-mono font-medium text-zinc-800">{formatMoney(activePrice)}</span>
              </div>
            </div>

            {/* Historical Deal 2 */}
            <div
              onClick={() => {
                loadScenario('scenario-03');
                setContextView('deal_view');
              }}
              className="p-2.5 rounded-md border border-zinc-200 hover:border-zinc-300 bg-white cursor-pointer space-y-1 transition-colors"
            >
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-zinc-600 font-medium">#DF-1047</span>
                <span className="text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium">
                  Approved
                </span>
              </div>
              <div className="font-medium text-zinc-700 truncate">600 Bearings (Volume Tier)</div>
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Apex Industrial</span>
                <span className="font-mono">₹417,270</span>
              </div>
            </div>

            {/* Historical Deal 3 */}
            <div
              onClick={() => {
                loadScenario('scenario-06');
                setContextView('deal_view');
              }}
              className="p-2.5 rounded-md border border-zinc-200 hover:border-zinc-300 bg-white cursor-pointer space-y-1 transition-colors"
            >
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-zinc-600 font-medium">#DF-1046</span>
                <span className="text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium">
                  Approved
                </span>
              </div>
              <div className="font-medium text-zinc-700 truncate">Express 3-Day Delivery</div>
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Meridian Bearings</span>
                <span className="font-mono">₹390,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canonical Scenario Quick Jump */}
        <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs space-y-2">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
            Demo Scenarios
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => loadScenario('scenario-01')}
              className="px-2 py-1.5 bg-white border border-zinc-200 rounded text-[11px] text-zinc-700 hover:bg-zinc-100 truncate text-left"
              title="Standard Commercial Deal"
            >
              01. Standard
            </button>
            <button
              onClick={() => loadScenario('scenario-03')}
              className="px-2 py-1.5 bg-white border border-zinc-200 rounded text-[11px] text-zinc-700 hover:bg-zinc-100 truncate text-left"
              title="Quantity Discount"
            >
              03. Volume Tier
            </button>
            <button
              onClick={() => loadScenario('scenario-06')}
              className="px-2 py-1.5 bg-white border border-zinc-200 rounded text-[11px] text-zinc-700 hover:bg-zinc-100 truncate text-left"
              title="Fast Delivery"
            >
              06. Express SLA
            </button>
            <button
              onClick={() => loadScenario('scenario-07')}
              className="px-2 py-1.5 bg-white border border-zinc-200 rounded text-[11px] text-zinc-700 hover:bg-zinc-100 truncate text-left"
              title="Upfront Financing"
            >
              07. Upfront Cash
            </button>
          </div>
        </div>

      </aside>

      {/* ================================================== */}
      {/* 2. CENTER PANEL: CONVERSATION + AGENT ACTIVITY + VISUAL TABLE */}
      {/* ================================================== */}
      <section className="flex-1 min-w-0 flex flex-col gap-4">
        
        {/* Intent Composer: Conversational Control Center */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
              Commercial AI Control Center
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Natural Language Intent Engine
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendIntent();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. I need 500 bearings under ₹4 lakh delivered within 6 days."
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-sans"
              />
            </div>
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Negotiate</span>
              <Send className="w-3 h-3" />
            </button>
          </form>

          {/* Prompt Suggestion Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-zinc-400 font-mono mr-1">Quick intents:</span>
            {promptPills.map((pill, i) => (
              <button
                key={i}
                onClick={() => handleSendIntent(pill.query)}
                className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2.5 py-1 rounded-md transition-colors"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* AI Response Acknowledgment */}
          {aiAssistantReply && (
            <div className="text-xs text-zinc-600 bg-zinc-50/80 px-3 py-2 rounded border-l-2 border-zinc-900 font-sans">
              {aiAssistantReply}
            </div>
          )}
        </div>

        {/* Visual Two-Agent Negotiation Stage */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-4 shadow-2xs flex-1 flex flex-col justify-between space-y-4">
          
          {/* Stage Header: Across the Table Representation */}
          <div className="border-b border-zinc-200 pb-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-950 uppercase tracking-wider text-[11px] font-mono">
                Commercial Negotiation Stage
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                <span>Round {round} of {maxRounds}</span>
                <span>&middot;</span>
                <span className="text-emerald-700 font-medium">{status}</span>
              </div>
            </div>

            {/* The Table: Two Representatives */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              
              {/* Buyer Agent Column */}
              <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-zinc-900">BUYER AGENT</span>
                  <span className="text-[10px] font-mono text-zinc-500 bg-white border border-zinc-200 px-1.5 py-0.5 rounded">
                    {buyerActivity}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500">Acme Manufacturing &middot; Buyer</div>
              </div>

              {/* Seller Agent Column */}
              <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-zinc-900">SELLER AGENT</span>
                  <span className="text-[10px] font-mono text-zinc-500 bg-white border border-zinc-200 px-1.5 py-0.5 rounded">
                    {sellerActivity}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500">{activeSupplier} &middot; Supplier</div>
              </div>

            </div>
          </div>

          {/* Negotiation Dialogue Stream */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {dialogue.map((msg) => (
              <div
                key={msg.id}
                className={`text-xs space-y-1 ${
                  msg.sender === 'buyer'
                    ? 'mr-auto max-w-[90%]'
                    : msg.sender === 'seller'
                    ? 'ml-auto max-w-[90%] text-right'
                    : 'max-w-full bg-zinc-50 p-2.5 rounded border border-zinc-100'
                }`}
              >
                <div className={`font-mono text-[10px] text-zinc-400 flex items-center gap-1.5 ${
                  msg.sender === 'seller' ? 'justify-end' : 'justify-start'
                }`}>
                  <span className="font-semibold text-zinc-600">{msg.senderTitle}</span>
                  {msg.subtitle && <span>&middot; {msg.subtitle}</span>}
                  <span>&middot; {msg.timestamp}</span>
                </div>

                <div
                  className={`p-3 rounded-lg leading-relaxed ${
                    msg.sender === 'buyer'
                      ? 'bg-zinc-50 border-l-2 border-zinc-900 text-zinc-800 text-left'
                      : msg.sender === 'seller'
                      ? 'bg-zinc-100/80 border-r-2 border-zinc-600 text-zinc-900 text-left'
                      : 'text-zinc-700'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Inline commercial terms card if present */}
                  {msg.commercialMetrics && (
                    <div className="mt-2 pt-2 border-t border-zinc-200/60 flex flex-wrap items-center gap-3 font-mono text-[11px] text-zinc-700">
                      {msg.commercialMetrics.price && (
                        <span>Total: <strong className="text-zinc-950">{formatMoney(msg.commercialMetrics.price)}</strong></span>
                      )}
                      {msg.commercialMetrics.unitPrice && (
                        <span>Unit: <strong>{formatMoney(msg.commercialMetrics.unitPrice, true)}</strong></span>
                      )}
                      {msg.commercialMetrics.quantity && (
                        <span>Qty: <strong>{msg.commercialMetrics.quantity}</strong></span>
                      )}
                      {msg.commercialMetrics.deliveryDays && (
                        <span>Delivery: <strong>{msg.commercialMetrics.deliveryDays}d</strong></span>
                      )}
                      {msg.commercialMetrics.terms && (
                        <span>Terms: <strong>{msg.commercialMetrics.terms}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={dialogueEndRef} />
          </div>

          {/* DealFlow Commercial Engine Checkpoint */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="font-medium text-zinc-900">DealFlow Commercial Engine: </span>
                <span className="text-zinc-600">
                  {status === 'NO_DEAL' ? 'Reservation values do not overlap.' : 'Private reservation economics satisfied. Mutual utility confirmed.'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setContextView('evidence')}
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 underline"
            >
              Inspect Proof
            </button>
          </div>

          {/* Interrupt Directives: Quick Follow-up Chips */}
          <div className="pt-2 border-t border-zinc-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Direct Your Agent:
              </span>
              <span className="text-[11px] text-zinc-400">Human In The Loop</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {interruptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendIntent(chip.text)}
                  className="px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md text-xs text-zinc-700 hover:text-zinc-950 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* ================================================== */}
      {/* 3. RIGHT PANEL: DYNAMIC CONTEXT-AWARE WORKSPACE */}
      {/* ================================================== */}
      <section className="w-full lg:w-96 shrink-0 flex flex-col gap-4">
        
        {/* Context View 1: SEARCH RESULTS (Tabular Procurement Search) */}
        {contextView === 'search' && (
          <div className="bg-white border border-zinc-200/80 rounded-lg p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="font-semibold text-xs text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Marketplace Search
              </span>
              <span className="text-[11px] font-mono text-zinc-400">{searchResults.length} suppliers</span>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-1">Max Delivery</label>
                <select
                  value={filterDelivery}
                  onChange={(e) => setFilterDelivery(Number(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-800"
                >
                  <option value={0}>Any Delivery SLA</option>
                  <option value={3}>≤ 3 Days (Express)</option>
                  <option value={5}>≤ 5 Days</option>
                  <option value={7}>≤ 7 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-1">Rank By</label>
                <select
                  value={filterPriority}
                  onChange={(e: any) => setFilterPriority(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-800"
                >
                  <option value="overall">Best Overall</option>
                  <option value="price">Lowest Price</option>
                  <option value="delivery">Fastest Delivery</option>
                  <option value="reliability">Highest Reliability</option>
                </select>
              </div>
            </div>

            {/* Clean Results Table */}
            <div className="space-y-2 pt-1 max-h-[440px] overflow-y-auto">
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setContextView('product_detail');
                  }}
                  className="p-3 rounded-lg border border-zinc-200 hover:border-zinc-900 bg-white hover:bg-zinc-50/60 cursor-pointer space-y-1.5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-xs text-zinc-900">{p.name}</div>
                      <div className="text-[11px] text-zinc-500">{p.supplierName} &middot; {p.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-xs text-zinc-900">{formatMoney(p.unitPrice, true)}</div>
                      <div className="text-[10px] text-zinc-400">/ unit</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1 border-t border-zinc-100">
                    <span>Stock: {formatNumber(p.availableQuantity)}</span>
                    <span>SLA: {p.deliveryDaysCapability}d</span>
                    <span className="text-emerald-700">{(p.supplierReliability * 100).toFixed(0)}% rel</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setContextView('current_offer')}
              className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-md transition-colors"
            >
              Back to Negotiation
            </button>
          </div>
        )}

        {/* Context View 2: PRODUCT DETAIL SPEC SHEET */}
        {contextView === 'product_detail' && (
          <div className="bg-white border border-zinc-200/80 rounded-lg p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="font-semibold text-xs text-zinc-950 uppercase tracking-wider">
                Supplier & Product Details
              </span>
              <button
                onClick={() => setContextView('search')}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 font-mono"
              >
                &larr; All Results
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h3 className="font-bold text-sm text-zinc-950">{selectedProduct.name}</h3>
                <p className="text-zinc-500 text-[11px]">SKU: {selectedProduct.sku} &middot; {selectedProduct.category}</p>
              </div>

              {/* Core Commercial Specs */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200/60 font-mono text-[11px]">
                <div>
                  <span className="text-zinc-400 block text-[10px]">BASE UNIT PRICE</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(selectedProduct.unitPrice, true)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">AVAILABLE STOCK</span>
                  <span className="font-semibold text-zinc-900">{formatNumber(selectedProduct.availableQuantity)} units</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">DELIVERY CAPABILITY</span>
                  <span className="font-semibold text-zinc-900">{selectedProduct.deliveryDaysCapability} business days</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">RELIABILITY SCORE</span>
                  <span className="font-semibold text-emerald-700">{(selectedProduct.supplierReliability * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">Specifications</span>
                <p className="text-zinc-700 leading-relaxed text-[11px] bg-zinc-50 p-2 rounded border border-zinc-100">
                  {selectedProduct.specification}
                </p>
              </div>

              {/* Quantity Breaks */}
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">Quantity Discount Breaks</span>
                <div className="space-y-1 font-mono text-[11px]">
                  {selectedProduct.quantityBreaks.map((qb, i) => (
                    <div key={i} className="flex justify-between py-0.5 border-b border-zinc-100 text-zinc-600">
                      <span>≥ {qb.minQty} units</span>
                      <span className="font-semibold text-zinc-900">{(qb.discountPct * 100).toFixed(1)}% concession</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Ask Agent to Negotiate */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    handleSendIntent(`Initiate commercial negotiation with ${selectedProduct.supplierName} for ${selectedProduct.name}.`);
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Ask my agent to negotiate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Context View 3: CURRENT DEAL / NEGOTIATING SUMMARY */}
        {contextView === 'current_offer' && (
          <div className="bg-white border border-zinc-200/80 rounded-lg p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="font-semibold text-xs text-zinc-950 uppercase tracking-wider font-mono">
                Current Commercial State
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Live Offer
              </span>
            </div>

            {/* Commercial Metrics Grid */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-500 text-[11px]">Total Contract Value</span>
                  <span className="font-mono font-bold text-base text-zinc-950">{formatMoney(activePrice)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">Order Quantity</span>
                  <span className="font-mono font-medium text-zinc-900">{formatNumber(activeQty)} units</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">Unit Price</span>
                  <span className="font-mono font-medium text-zinc-900">{formatMoney(activeUnitPrice, true)} / unit</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">Delivery SLA</span>
                  <span className="font-mono font-medium text-zinc-900">{activeDelivery} business days</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">Payment Terms</span>
                  <span className="font-mono font-medium text-zinc-900">{activeTerms}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-zinc-200">
                  <span className="text-zinc-500">Supplier</span>
                  <span className="font-medium text-zinc-900">{activeSupplier}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setContextView('comparison')}
                  className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Compare 4 Options</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setContextView('deal_view')}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Review & Approve Deal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Context View 4: STRUCTURED DEAL COMPARISON TABLE */}
        {contextView === 'comparison' && (
          <div className="bg-white border border-zinc-200/80 rounded-lg p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div>
                <span className="font-semibold text-xs text-zinc-950 uppercase tracking-wider block font-mono">
                  Deal Comparison Table
                </span>
                <span className="text-[11px] text-zinc-500">4 Pareto-efficient outcomes</span>
              </div>
              <button
                onClick={() => setContextView('current_offer')}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 font-mono"
              >
                &times; Close
              </button>
            </div>

            {/* Comparison Table */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
              {dealOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedOptionIndex(i);
                    loadScenario(opt.scenarioId);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer space-y-2 transition-all ${
                    selectedOptionIndex === i
                      ? 'border-zinc-900 bg-zinc-50/80 ring-1 ring-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900">{opt.title}</span>
                    <span className="font-mono font-bold text-xs text-zinc-950">{formatMoney(opt.price)}</span>
                  </div>

                  <p className="text-[11px] text-zinc-600 leading-relaxed">{opt.summary}</p>

                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-100">
                    <div>
                      <span className="text-zinc-400 block">QTY</span>
                      <span className="text-zinc-800 font-medium">{opt.qty} units</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">DELIVERY</span>
                      <span className="text-zinc-800 font-medium">{opt.delivery}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">UNIT</span>
                      <span className="text-zinc-800 font-medium">{formatMoney(opt.unitPrice, true)}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400">{opt.terms}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOptionIndex(i);
                        loadScenario(opt.scenarioId);
                        setContextView('deal_view');
                      }}
                      className="text-[11px] font-semibold text-zinc-900 hover:underline flex items-center gap-1"
                    >
                      Select Option &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setContextView('deal_view')}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Proceed with Selected Option
            </button>
          </div>
        )}

        {/* Context View 5: DEAL VIEW (Transaction Summary + "Why this deal?") */}
        {contextView === 'deal_view' && (
          <div className="bg-white border border-zinc-200/80 rounded-lg p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="font-bold text-xs text-zinc-950 font-mono tracking-tight">
                DEAL #DF-1048
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                Acme &times; {activeSupplier}
              </span>
            </div>

            {/* Commercial Terms */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-zinc-500 text-[11px]">Final Agreed Total</span>
                <span className="font-bold text-base text-zinc-950">{formatMoney(activePrice)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-600">
                <span>{activeQty} units &middot; {formatMoney(activeUnitPrice, true)}/unit</span>
                <span>{activeDelivery} business days</span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                Payment: <strong className="text-zinc-800 font-medium">{activeTerms}</strong>
              </div>
            </div>

            {/* Why This Deal? Checklist */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-[11px] text-zinc-900 uppercase tracking-wider block font-mono">
                Why this deal?
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-700">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Budget satisfied:</strong> Agreed cost is within the authorized limit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Delivery satisfied:</strong> Arrival scheduled within required SLA.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Supplier reliability:</strong> Verified partner with &gt;95% on-time record.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Seller economics:</strong> Margin floor and cost constraints respected.</span>
                </li>
              </ul>
            </div>

            {/* Actions: Approve / Renegotiate / Alternatives */}
            <div className="space-y-2 pt-2 border-t border-zinc-200">
              <button
                onClick={() => {
                  approveDeal();
                  setActiveTab('contract');
                }}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Deal</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleSendIntent('Can we renegotiate for an additional price discount or faster delivery?');
                    setContextView('current_offer');
                  }}
                  className="py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-lg transition-colors text-center"
                >
                  Renegotiate
                </button>
                <button
                  onClick={() => setContextView('comparison')}
                  className="py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-lg transition-colors text-center"
                >
                  View Alternatives
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Context View 6: DECISION EVIDENCE / DATA UI */}
        {contextView === 'evidence' && (
          <div className="bg-white border border-zinc-200/80 rounded-lg p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="font-semibold text-xs text-zinc-950 uppercase tracking-wider font-mono">
                Commercial Verification Check
              </span>
              <button
                onClick={() => setContextView('current_offer')}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 font-mono"
              >
                &times; Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Buyer Checks */}
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/60 space-y-1.5">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">BUYER CONSTRAINTS</span>
                <div className="flex justify-between items-center text-zinc-800 text-[11px]">
                  <span>Budget Ceiling (&le; {formatMoney(buyerPolicy.maxTotalBudget)})</span>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="flex justify-between items-center text-zinc-800 text-[11px]">
                  <span>Required Quantity ({buyerPolicy.requiredQuantity} units)</span>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="flex justify-between items-center text-zinc-800 text-[11px]">
                  <span>Delivery SLA (&le; {buyerPolicy.latestAcceptableDeliveryDays} days)</span>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </div>
              </div>

              {/* Seller Checks */}
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/60 space-y-1.5">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">SELLER CONSTRAINTS</span>
                <div className="flex justify-between items-center text-zinc-800 text-[11px]">
                  <span>Minimum Margin Floor (&ge; {(sellerPolicy.minMargin * 100).toFixed(0)}%)</span>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="flex justify-between items-center text-zinc-800 text-[11px]">
                  <span>Inventory Depth Check</span>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="flex justify-between items-center text-zinc-800 text-[11px]">
                  <span>Payment Terms Eligibility</span>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </div>
              </div>

              {/* Decision */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-center">
                <span className="font-mono text-[11px] text-emerald-800 font-semibold">DECISION STATUS: APPROVED</span>
              </div>
            </div>
          </div>
        )}

      </section>

    </div>
  );
}
