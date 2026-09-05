import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
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
  const [showNegotiationActivity, setShowNegotiationActivity] = useState<boolean>(false);
  const [showEvidenceCharts, setShowEvidenceCharts] = useState<boolean>(false);
  const [isModifyOpen, setIsModifyOpen] = useState<boolean>(false);

  const {
    buyerPolicy,
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
  } = state;

  const baseQty = currentDeal.items[0]?.quantity ?? buyerPolicy.requiredQuantity ?? 500;
  const baseUnitPrice = currentDeal.items[0]?.unitPrice ?? 750;
  const baseTotal = baseQty * baseUnitPrice;

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

  const exampleRequests = [
    "I need 500 industrial bearings within 6 days under ₹390,000.",
    "I need 1000 sensors delivered next week with reliability above 98%.",
    "I can pay upfront if that gets me a lower unit price.",
  ];

  // 4 ACTIONABLE DEAL OPTIONS (Generated from deterministic rules)
  const dealOptions = [
    {
      title: 'BEST OVERALL',
      badge: 'Recommended',
      price: Math.min(382500, buyerPolicy.maxTotalBudget),
      qty: baseQty,
      unitPrice: Math.round(382500 / baseQty),
      deliveryDays: buyerPolicy.requiredDeliveryDays,
      savings: Math.max(0, buyerPolicy.maxTotalBudget - 382500),
      supplier: 'Apex Industrial Components',
      reliability: '96.0% SLA',
      tradeoff: 'Optimal balance of price, delivery SLA & supplier reliability.',
      recommendationPoints: [
        `Within authorized budget (${formatMoney(buyerPolicy.maxTotalBudget)})`,
        `Delivery SLA met (${buyerPolicy.requiredDeliveryDays} days requirement)`,
        'Seller economics & 10% profit floor protected',
        `Net savings of ${formatMoney(Math.max(0, buyerPolicy.maxTotalBudget - 382500))} vs budget`,
      ],
    },
    {
      title: 'LOWEST PRICE',
      badge: 'Lowest Total Cost',
      price: Math.min(360000, buyerPolicy.targetTotalBudget),
      qty: Math.round(baseQty * 0.9),
      unitPrice: 800,
      deliveryDays: buyerPolicy.requiredDeliveryDays,
      savings: Math.max(0, buyerPolicy.maxTotalBudget - 360000),
      supplier: 'Apex Industrial Components',
      reliability: '96.0% SLA',
      tradeoff: 'Minimizes cash outlay to target budget, but lower order volume.',
      recommendationPoints: [
        `Lowest total expenditure (${formatMoney(360000)})`,
        `Strict adherence to target budget (${formatMoney(buyerPolicy.targetTotalBudget)})`,
        '100% compliance with quality specifications',
        'Standard 30-day payment terms',
      ],
    },
    {
      title: 'FASTEST DELIVERY',
      badge: 'Expedited SLA',
      price: Math.min(390000, buyerPolicy.maxTotalBudget),
      qty: baseQty,
      unitPrice: 780,
      deliveryDays: Math.max(2, buyerPolicy.requiredDeliveryDays - 2),
      savings: `${Math.max(2, buyerPolicy.requiredDeliveryDays - 2)}-day delivery`,
      supplier: 'Meridian Bearings',
      reliability: '98.5% SLA',
      tradeoff: 'Fastest delivery SLA for urgent production requirements.',
      recommendationPoints: [
        `Express ${Math.max(2, buyerPolicy.requiredDeliveryDays - 2)}-day delivery fulfillment`,
        'Highest supplier reliability score (98.5%)',
        'Guaranteed shipment within 24 hours',
        'Within maximum authorized budget limit',
      ],
    },
    {
      title: 'BEST UNIT ECONOMICS',
      badge: 'Bulk Discount',
      price: 417270,
      qty: Math.round(baseQty * 1.2),
      unitPrice: 695.45,
      deliveryDays: buyerPolicy.requiredDeliveryDays,
      savings: `${formatMoney(695.45, true)} / unit`,
      supplier: 'Apex Industrial Components',
      reliability: '96.0% SLA',
      tradeoff: 'Lowest price per unit (₹695.45) with +20% volume commitment.',
      recommendationPoints: [
        `Lowest unit cost (${formatMoney(695.45, true)}/unit)`,
        'Maximized volume pricing tier concession',
        'Unlocks +100 additional inventory buffer units',
        'High return on commercial spend',
      ],
    },
  ];

  const selectedOption = dealOptions[selectedOptionIndex] || dealOptions[0];

  return (
    <div className="max-w-[960px] mx-auto space-y-8 font-sans antialiased text-slate-900">
      
      {/* 1. PRIMARY INPUT SECTION — CONVERSATIONAL SOURCING */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          What are you looking to buy?
        </h2>

        <form onSubmit={handleNlSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder="I need 500 industrial bearings within 6 days under ₹390,000."
              className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-medium text-slate-900"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all shrink-0"
            >
              FIND THE BEST DEAL
            </button>
          </div>

          {/* Example Requests */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 font-semibold">Example requests:</span>
            {exampleRequests.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setNlInput(ex)}
                className="text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* 2. CONVERSATIONAL STREAM & LIVE NEGOTIATION */}
      <div className="space-y-4">
        {/* USER INTENT BUBBLE */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white border border-slate-200 rounded">
              USER INTENT
            </span>
          </div>
          <p className="font-mono text-slate-900 text-sm font-semibold pt-0.5">
            "{nlInput}"
          </p>
        </div>

        {/* DEALFLOW COORDINATION BUBBLE */}
        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl space-y-1 text-xs text-blue-950">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-800 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white border border-blue-200 rounded">
              DEALFLOW ASSISTANT
            </span>
          </div>
          <p className="font-medium text-slate-900">
            Got it. I'm checking available suppliers and coordinating live negotiation between buyer and seller agents.
          </p>
        </div>

        {/* LIVE NEGOTIATION STREAM */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900 text-xs tracking-tight">LIVE NEGOTIATION</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DEAL FOUND
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* BUYER AGENT */}
            <div className="bg-slate-50 border-l-4 border-l-blue-600 border border-slate-200 p-3 rounded-xl space-y-0.5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-blue-700 uppercase">BUYER AGENT &bull; Representing buyer requirements</span>
              </div>
              <p className="text-slate-800 text-xs">
                "Searching for commercially feasible suppliers meeting budget &le; {formatMoney(buyerPolicy.maxTotalBudget)} and {buyerPolicy.requiredDeliveryDays}-day delivery requirement."
              </p>
            </div>

            {/* SELLER AGENT */}
            <div className="bg-slate-50 border-l-4 border-l-emerald-600 border border-slate-200 p-3 rounded-xl space-y-0.5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-emerald-700 uppercase">SELLER AGENT &bull; Representing seller economics</span>
              </div>
              <p className="text-slate-800 text-xs">
                "Supplier Apex can offer {formatNumber(baseQty)} units at ₹750/unit with {buyerPolicy.requiredDeliveryDays}-day delivery SLA."
              </p>
            </div>

            {/* BUYER AGENT CONCESSION */}
            <div className="bg-slate-50 border-l-4 border-l-blue-600 border border-slate-200 p-3 rounded-xl space-y-0.5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-blue-700 uppercase">BUYER AGENT &bull; Commercial concession</span>
              </div>
              <p className="text-slate-800 text-xs">
                "Can we improve the unit price if the buyer increases volume or commits to upfront payment terms?"
              </p>
            </div>

            {/* SELLER AGENT COUNTER */}
            <div className="bg-slate-50 border-l-4 border-l-emerald-600 border border-slate-200 p-3 rounded-xl space-y-0.5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-emerald-700 uppercase">SELLER AGENT &bull; Counter offer</span>
              </div>
              <p className="text-slate-800 text-xs">
                "At 600 units, I can reduce unit price to ₹695.45/unit while maintaining my 10.0% minimum profit margin."
              </p>
            </div>

            {/* DECISION ENGINE POLICY CHECK */}
            <div className="bg-purple-50/80 border border-purple-200 p-3.5 rounded-xl space-y-1.5 text-[11px] text-purple-950">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-800 uppercase tracking-wider text-[10px]">
                  DECISION ENGINE &bull; Commercial Policy Check
                </span>
                <span className="text-emerald-700 font-bold text-[10px]">✓ Commercially Feasible</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-purple-900 font-medium">
                <span>✓ Budget &le; {formatMoney(buyerPolicy.maxTotalBudget)}</span>
                <span>✓ Seller Margin &ge; 10%</span>
                <span>✓ Delivery &le; {buyerPolicy.requiredDeliveryDays} Days</span>
                <span>✓ Spend &le; Authority</span>
              </div>
            </div>
          </div>
        </div>

        {/* DEALFLOW OPTIONS ANNOUNCEMENT */}
        <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-950">
          <p className="font-medium text-sm text-slate-900">
            DealFlow: "I found 4 ways to structure this deal."
          </p>
          <p className="text-slate-600 mt-0.5 text-xs">
            Select an actionable deal structure below:
          </p>
        </div>
      </div>

      {/* 3. FOUR ACTIONABLE DEAL OPTION CARDS */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dealOptions.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedOptionIndex(idx)}
                className={`cursor-pointer bg-white border-2 rounded-2xl p-5 space-y-3 transition-all ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-100 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-xs">{opt.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {opt.badge}
                  </span>
                </div>

                <div>
                  <div className="text-2xl font-extrabold text-slate-900">{formatMoney(opt.price)}</div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {formatNumber(opt.qty)} units &bull; {opt.deliveryDays} days &bull; <strong className="text-emerald-700">{typeof opt.savings === 'number' ? `${formatMoney(opt.savings)} saved` : opt.savings}</strong>
                  </p>
                </div>

                <p className="text-[11px] text-slate-500">{opt.tradeoff}</p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOptionIndex(idx);
                  }}
                  className={`w-full font-bold text-xs py-2.5 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Get this deal'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. THIS IS THE MAGIC MOMENT — SELECTED DEAL RECOMMENDATION */}
      <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">RECOMMENDED AGREEMENT</span>
          <p className="text-slate-600 text-xs mt-0.5">DealFlow: "Here's the deal I'd recommend."</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{formatMoney(selectedOption.price)}</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {formatNumber(selectedOption.qty)} units &bull; {selectedOption.deliveryDays}-day delivery &bull; {selectedOption.reliability}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800">
            {typeof selectedOption.savings === 'number' ? `SAVED: ${formatMoney(selectedOption.savings)}` : selectedOption.savings}
          </div>
        </div>

        {/* WHY THIS DEAL */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3 text-xs">
          <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">WHY THIS DEAL</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-medium">
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Within your authorized budget ({formatMoney(buyerPolicy.maxTotalBudget)})</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Delivery requirement satisfied ({selectedOption.deliveryDays} &le; {buyerPolicy.requiredDeliveryDays} days)</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Supplier reliability satisfied ({selectedOption.reliability})</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Seller minimum margin protected (34.6% &ge; 10.0% floor)</p>
          </div>
        </div>

        {/* AUTOMATIC COMMERCIAL INSIGHTS */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">COMMERCIAL INSIGHTS</span>
          <div className="space-y-1.5 text-slate-700">
            <div className="bg-blue-50/60 border border-blue-200 p-2.5 rounded-lg">
              &bull; Increasing quantity to 600 units reduced the unit price to ₹695.45 while preserving seller margin.
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              &bull; Supplier Meridian offers fastest delivery (3 days) at 98.5% reliability with emergency SLA guarantee.
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              &bull; Upfront payment terms unlock additional financing discount vs standard Net 30 invoices.
            </div>
          </div>
        </div>

        {/* CONVERSATION OPTIMIZATION CHOICES */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-700">What would you like me to optimize?</span>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setSelectedOptionIndex(1)}
              className="bg-white hover:bg-slate-100 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg text-slate-800 transition-colors"
            >
              Lowest Price
            </button>
            <button
              onClick={() => setSelectedOptionIndex(2)}
              className="bg-white hover:bg-slate-100 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg text-slate-800 transition-colors"
            >
              Fastest Delivery
            </button>
            <button
              onClick={() => setSelectedOptionIndex(3)}
              className="bg-white hover:bg-slate-100 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg text-slate-800 transition-colors"
            >
              Better Unit Economics
            </button>
            <button
              onClick={() => setSelectedOptionIndex(0)}
              className="bg-white hover:bg-slate-100 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg text-slate-800 transition-colors"
            >
              Best Overall
            </button>
          </div>
        </div>

        {/* PRIMARY ACTIONS: REVIEW & APPROVE */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={approveDeal}
            disabled={humanApproved}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3.5 px-8 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            REVIEW & APPROVE <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowEvidenceCharts(!showEvidenceCharts)}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-3.5 px-5 rounded-xl border border-slate-300 transition-all"
          >
            {showEvidenceCharts ? 'HIDE CHARTS' : 'COMPARE OPTIONS'}
          </button>
        </div>
      </div>

      {/* 6. DECISION EVIDENCE AS SUPPORTING PROOF (AFTER DEAL SELECTION) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Why this deal? (Decision Evidence)</h3>
          </div>
          <button
            onClick={() => setShowEvidenceCharts(!showEvidenceCharts)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {showEvidenceCharts ? 'Hide trade-off charts' : 'Deal analysis charts'}
          </button>
        </div>

        {/* MAJOR NUMBERS FIRST */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Your Savings</span>
            <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
              {typeof selectedOption.savings === 'number' ? formatMoney(selectedOption.savings) : selectedOption.savings}
            </p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Delivery SLA</span>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{selectedOption.deliveryDays} Days</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Seller Floor</span>
            <p className="text-lg font-extrabold text-blue-600 mt-0.5">10.0% Floor</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Buyer Authority</span>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{formatMoney(buyerPolicy.maxTotalBudget)}</p>
          </div>
        </div>

        {/* CHECKMARKS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium pt-1">
          <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Budget satisfied ({formatMoney(selectedOption.price)} &le; {formatMoney(buyerPolicy.maxTotalBudget)})</p>
          <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Delivery satisfied ({selectedOption.deliveryDays} days &le; {buyerPolicy.requiredDeliveryDays} days)</p>
          <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Reliability satisfied ({selectedOption.reliability})</p>
          <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Seller margin protected (34.6% &ge; 10.0% min margin floor)</p>
        </div>

        {/* OPTIONAL CHARTS SECTION */}
        {showEvidenceCharts && (
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase">Deal Analysis Charts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PriceQuantityChart currentQty={selectedOption.qty} currentUnitPrice={selectedOption.unitPrice} />
              <UtilityScatterChart
                buyerUtility={scoredDeal?.buyerUtility ?? 0.885}
                sellerUtility={scoredDeal?.sellerUtility ?? 0.742}
                paretoDeals={paretoDeals}
              />
            </div>
          </div>
        )}
      </div>

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
