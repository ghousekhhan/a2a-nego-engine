import React, { useState } from 'react';
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
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import {
  PriceQuantityChart,
  UtilityScatterChart,
} from './charts/Visualizations.tsx';
import { resolveCommercialRequest } from '../data/catalogResolver.ts';
import { formatMoney, formatNumber, formatPercent } from '../utils/formatters.ts';
import { ModifyModal } from './ModifyModal.tsx';

export function BuyerInterface({ state }: { state: CanonicalState }) {
  const [nlInput, setNlInput] = useState('I need 500 industrial bearings within 6 days under ₹390,000.');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const [showOtherOptions, setShowOtherOptions] = useState<boolean>(false);
  const [showEvidence, setShowEvidence] = useState<boolean>(false);
  const [showCharts, setShowCharts] = useState<boolean>(false);
  const [isModifyOpen, setIsModifyOpen] = useState<boolean>(false);

  const {
    buyerPolicy,
    sellerPolicy,
    currentDeal,
    scoredDeal,
    paretoDeals,
    dialogueHistory,
    round,
    maxRounds,
    status,
    humanApproved,
    startCustomNegotiation,
    nextRound,
    approveDeal,
    rejectDeal,
    modifyParameters,
    setActiveTab,
  } = state;

  const baseQty = currentDeal.items[0]?.quantity ?? buyerPolicy.requiredQuantity ?? 500;
  const baseUnitPrice = currentDeal.items[0]?.unitPrice ?? 750;

  // Handle Natural Language Submit
  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlInput.trim()) return;

    const resolved = resolveCommercialRequest(nlInput, 'supplier-apex-mro');
    startCustomNegotiation(
      resolved.catalogItem.name,
      resolved.quantity,
      resolved.targetBudget,
      resolved.maxBudget,
      resolved.deliveryDays,
      resolved.paymentPreference,
      'supplier-apex-mro'
    );
  };

  const suggestions = [
    { label: 'Buy industrial parts', query: 'I need 500 industrial bearings within 6 days under ₹390,000.' },
    { label: 'Find the best price', query: 'Find the lowest total price for industrial bearings under ₹360,000.' },
    { label: 'Prioritize delivery', query: 'I need 500 bearings delivered express within 3 days.' },
    { label: 'Compare suppliers', query: 'Compare high reliability suppliers for precision bearings.' },
  ];

  // 4 Actionable Deal Options (Deterministic)
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
        `Within your authorized budget (${formatMoney(buyerPolicy.maxTotalBudget)} max limit)`,
        `Meets delivery requirement (${buyerPolicy.requiredDeliveryDays} days SLA)`,
        'Supplier meets reliability threshold (96.0% SLA)',
        'Upfront payment terms unlocked the commercial discount',
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

  return (
    <div className="max-w-[860px] mx-auto space-y-12 text-zinc-900 font-sans antialiased py-2">
      
      {/* ================================================== */}
      {/* 1. COMPACT INTENT INPUT */}
      {/* ================================================== */}
      <section className="space-y-3">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
          What do you need?
        </h1>

        <form onSubmit={handleNlSubmit} className="space-y-2.5">
          <div className="flex items-center gap-2 border-b-2 border-zinc-900 pb-1.5 focus-within:border-zinc-950">
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder="e.g. I need 500 industrial bearings within 6 days under ₹390,000."
              className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none py-1"
            />
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2 rounded-md transition-colors shrink-0 flex items-center gap-1.5"
            >
              Negotiate <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-500">
            <span className="text-[11px] text-zinc-400 font-mono">Suggestions:</span>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNlInput(item.query);
                  const resolved = resolveCommercialRequest(item.query, 'supplier-apex-mro');
                  startCustomNegotiation(
                    resolved.catalogItem.name,
                    resolved.quantity,
                    resolved.targetBudget,
                    resolved.maxBudget,
                    resolved.deliveryDays,
                    resolved.paymentPreference,
                    'supplier-apex-mro'
                  );
                }}
                className="text-zinc-600 hover:text-zinc-950 hover:underline transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* ================================================== */}
      {/* 2. COMMERCIAL CONVERSATION TIMELINE */}
      {/* ================================================== */}
      <section className="space-y-6 pt-2 border-t border-zinc-200">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2 text-xs">
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

        {/* Conversation Stream (Buyer Left, Seller Right, DealFlow Center) */}
        <div className="space-y-4 py-1">
          
          {/* USER INTENT */}
          <div className="max-w-md">
            <div className="text-[11px] font-mono text-zinc-400 mb-1">
              BUYER INTENT &middot; USER
            </div>
            <div className="text-xs text-zinc-900 pl-3 border-l border-zinc-900 py-0.5">
              "{nlInput}"
            </div>
          </div>

          {/* TURN 1: BUYER AGENT */}
          <div className="max-w-md">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">
              BUYER AGENT &middot; Acme Manufacturing
            </div>
            <div className="text-xs text-zinc-800 pl-3 border-l-2 border-zinc-400 py-1 bg-zinc-50/60">
              "Searching for commercially feasible suppliers meeting budget &le; {formatMoney(buyerPolicy.maxTotalBudget)} and {buyerPolicy.requiredDeliveryDays}-day delivery requirement."
            </div>
          </div>

          {/* TURN 2: SELLER AGENT */}
          <div className="max-w-md ml-auto text-right">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">
              SELLER AGENT &middot; Apex Industrial
            </div>
            <div className="text-xs text-zinc-800 pr-3 border-r-2 border-zinc-900 py-1 bg-zinc-50/60 text-left">
              "Supplier Apex can deliver {formatNumber(baseQty)} units at ₹750/unit with {buyerPolicy.requiredDeliveryDays}-day delivery SLA on standard Net 30 terms."
            </div>
          </div>

          {/* TURN 3: BUYER CONCESSION PROBE */}
          <div className="max-w-md">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">
              BUYER AGENT &middot; Concession Probe
            </div>
            <div className="text-xs text-zinc-800 pl-3 border-l-2 border-zinc-400 py-1 bg-zinc-50/60">
              "Can we improve unit pricing if the buyer pays upfront or commits to an expanded volume tier?"
            </div>
          </div>

          {/* TURN 4: SELLER COUNTER */}
          <div className="max-w-md ml-auto text-right">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">
              SELLER AGENT &middot; Counter Proposal
            </div>
            <div className="text-xs text-zinc-800 pr-3 border-r-2 border-zinc-900 py-1 bg-zinc-50/60 text-left">
              "With upfront settlement, I can reduce unit price to ₹765/unit (₹382,500 total) while maintaining my 10.0% minimum profit margin."
            </div>
          </div>

          {/* DEALFLOW POLICY CHECK: CENTERED */}
          <div className="py-2.5 border-y border-zinc-200/80 my-3">
            <div className="max-w-md mx-auto text-center space-y-1">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                DEALFLOW &middot; DETERMINISTIC POLICY EVALUATION
              </div>
              <div className="text-xs text-zinc-900 font-medium">
                Policy check complete: All commercial boundaries satisfied.
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-600 font-mono">
                <span>✓ Budget (&le; {formatMoney(buyerPolicy.maxTotalBudget)})</span>
                <span>✓ Margin (&ge; 10%)</span>
                <span>✓ Delivery (&le; {buyerPolicy.requiredDeliveryDays}d)</span>
                <span>✓ Spend (&le; Level 1)</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 3. THE DECISION MOMENT — DEAL FOUND & ACTIONS */}
      {/* ================================================== */}
      {!humanApproved ? (
        <section className="space-y-6 pt-4 border-t border-zinc-200">
          <div className="space-y-3">
            <div className="text-xs font-mono text-emerald-800 uppercase tracking-wider">
              Deal found &middot; Recommended Agreement
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

          {/* FOUR EXTREMELY CLEAR CONVERSATIONAL ACTIONS */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={approveDeal}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              Approve deal <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowOtherOptions(!showOtherOptions)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {showOtherOptions ? 'Hide other options' : 'Review another option'}
              {showOtherOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsModifyOpen(true)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" /> Change my priority
            </button>

            <button
              onClick={rejectDeal}
              className="text-zinc-500 hover:text-rose-700 font-medium text-xs px-3 py-2.5 transition-colors"
            >
              Walk away
            </button>
          </div>

          {/* COMPACT DECISION LIST (When requested by user) */}
          {showOtherOptions && (
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
                      setShowOtherOptions(false);
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
        /* 4. DEAL COMPLETED — TRANSFORM INTO BEAUTIFUL DEAL RECORD */
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
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-5 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> View Contract
            </button>

            <button
              onClick={() => setActiveTab('payment')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <CreditCard className="w-4 h-4" /> Pay with Razorpay
            </button>

            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-xs text-zinc-600 hover:text-zinc-900 font-medium px-3 py-3 transition-colors"
            >
              {showEvidence ? 'Hide evidence' : 'View decision evidence'}
            </button>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* 5. PROGRESSIVE DISCLOSURE: DECISION EVIDENCE */}
      {/* ================================================== */}
      <section className="space-y-4 pt-4 border-t border-zinc-100 text-xs">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center gap-2 font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <span>Why this deal? (Decision Evidence)</span>
            {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showEvidence && (
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900"
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
