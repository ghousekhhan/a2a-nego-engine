import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import {
  PriceQuantityChart,
  UtilityScatterChart,
} from './charts/Visualizations.tsx';
import { generateDecisionExplanation } from '../engine/explanation.ts';
import { MOCK_SUPPLIERS } from '../data/mockSuppliers.ts';
import { resolveCommercialRequest } from '../data/catalogResolver.ts';
import { formatMoney, formatNumber, formatPercent } from '../utils/formatters.ts';
import { ModifyModal } from './ModifyModal.tsx';

export function BuyerInterface({ state }: { state: CanonicalState }) {
  const [nlInput, setNlInput] = useState('I need 500 industrial bearings within 6 days under ₹390,000.');
  const [selectedSupplierId, setSelectedSupplierId] = useState('supplier-apex-mro');
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [showEvidenceCharts, setShowEvidenceCharts] = useState(false);
  const [isModifyOpen, setIsModifyOpen] = useState(false);

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

  const currentQty = currentDeal.items[0]?.quantity ?? buyerPolicy.requiredQuantity;
  const currentUnitPrice = Math.round(currentDeal.items[0]?.unitPrice ?? 750);
  const totalPrice = currentQty * currentUnitPrice;
  const initialOfferPrice = 410000;
  const buyerSavings = Math.max(0, initialOfferPrice - totalPrice);

  // Handle Natural Language Submit
  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlInput.trim()) return;

    const resolved = resolveCommercialRequest(nlInput, selectedSupplierId);
    startCustomNegotiation(
      resolved.catalogItem.name,
      resolved.quantity,
      resolved.targetBudget,
      resolved.maxBudget,
      resolved.deliveryDays,
      resolved.paymentPreference,
      selectedSupplierId
    );
  };

  const exampleRequests = [
    "I need 500 industrial bearings within 6 days under ₹390,000.",
    "I need 1000 sensors delivered next week and reliability above 98%.",
    "I can pay upfront if that gets me a better price.",
  ];

  const rankedOptions = [
    {
      type: '1. Best Balanced',
      badge: 'Recommended',
      total: 382500,
      qty: 550,
      unitPrice: 695.45,
      delivery: 4,
      payment: 'upfront',
      supplier: 'Apex Industrial Components',
      buyerUtility: 0.885,
      sellerUtility: 0.742,
      tradeoff: 'Higher quantity (+50u) unlocks lower unit price tier (₹695.45/u) with 4-day delivery.',
    },
    {
      type: '2. Best Buyer Outcome',
      badge: 'Lowest Total Cost',
      total: 360000,
      qty: 450,
      unitPrice: 800.0,
      delivery: 5,
      payment: '30_days',
      supplier: 'Apex Industrial Components',
      buyerUtility: 0.812,
      sellerUtility: 0.690,
      tradeoff: 'Minimizes cash outlay to target budget, but unit price remains higher (₹800/u).',
    },
    {
      type: '3. Lowest Risk',
      badge: 'Highest Reliability',
      total: 425000,
      qty: 500,
      unitPrice: 850.0,
      delivery: 3,
      payment: '30_days',
      supplier: 'Meridian Bearings (98% SLA)',
      buyerUtility: 0.794,
      sellerUtility: 0.780,
      tradeoff: 'Maximum SLA reliability score (98%) at +11% price premium.',
    },
  ];

  return (
    <div className="max-w-[960px] mx-auto space-y-8 font-sans antialiased text-slate-900">
      
      {/* 1. PRIMARY INPUT SECTION */}
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

      {/* 2. PRIMARY RESULT: YOUR BEST DEAL */}
      <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">YOUR BEST DEAL</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">{formatMoney(totalPrice)}</h1>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
            YOU SAVE {formatMoney(buyerSavings)}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Quantity:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{formatNumber(currentQty)} units</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Unit Price:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{formatMoney(currentUnitPrice, true)}/u</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Delivery SLA:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{buyerPolicy.requiredDeliveryDays} Calendar Days</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Reliability Score:</span>
            <p className="font-bold text-emerald-600 text-sm mt-0.5">96.0% SLA</p>
          </div>
        </div>

        {/* WHY THIS DEAL */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
          <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">WHY THIS DEAL</span>
          <div className="space-y-1.5 text-slate-700 font-medium">
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Within your authorized budget limit ({formatMoney(buyerPolicy.maxTotalBudget)})</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Delivery SLA requirement met (4 days &le; 5-day SLA)</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Seller economics & minimum margin protected (34.6% &ge; 10.0%)</p>
          </div>
        </div>

        {/* PRIMARY ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={approveDeal}
            disabled={humanApproved}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            REVIEW AGREEMENT <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowOtherOptions(!showOtherOptions)}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-3 px-5 rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            {showOtherOptions ? 'HIDE OTHER OPTIONS' : 'VIEW OTHER OPTIONS'} {showOtherOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. OTHER FEASIBLE OPTIONS (COMPACT & PROGRESSIVE DISCLOSURE) */}
      {showOtherOptions && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">OTHER FEASIBLE OPTIONS</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rankedOptions.map((opt, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{opt.type}</span>
                  <span className="bg-white border border-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">{opt.badge}</span>
                </div>
                <p className="text-lg font-extrabold text-slate-900">{formatMoney(opt.total)}</p>

                <div className="space-y-1 text-slate-600 border-t border-slate-200 pt-2 text-[11px]">
                  <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold text-slate-900">{formatNumber(opt.qty)} units</span></div>
                  <div className="flex justify-between"><span>Unit Price:</span><span className="font-semibold text-slate-900">{formatMoney(opt.unitPrice, true)}</span></div>
                  <div className="flex justify-between"><span>Delivery:</span><span className="font-semibold text-slate-900">{opt.delivery} days</span></div>
                  <div className="flex justify-between"><span>Supplier:</span><span className="font-semibold text-slate-900">{opt.supplier}</span></div>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200 text-[10px] text-slate-500 mt-2">
                  <span className="font-bold text-slate-700">Why this option?</span> {opt.tradeoff}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DECISION EVIDENCE AS SUPPORTING PROOF */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">DECISION EVIDENCE</h3>
          </div>
          <button
            onClick={() => setShowEvidenceCharts(!showEvidenceCharts)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {showEvidenceCharts ? 'Hide trade-off charts' : 'Compare trade-offs chart'}
          </button>
        </div>

        {/* PROMINENT NUMBERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Buyer Savings</span>
            <p className="text-lg font-black text-emerald-600 mt-0.5">{formatMoney(buyerSavings)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Delivery SLA</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">{buyerPolicy.requiredDeliveryDays} Days</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Min Seller Margin</span>
            <p className="text-lg font-black text-blue-600 mt-0.5">10.0% Floor</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Buyer Authority</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">{formatMoney(buyerPolicy.maxTotalBudget)}</p>
          </div>
        </div>

        {/* OPTIONAL CHARTS */}
        {showEvidenceCharts && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <PriceQuantityChart currentQty={currentQty} currentUnitPrice={currentUnitPrice} />
            <UtilityScatterChart
              buyerUtility={scoredDeal?.buyerUtility ?? 0.885}
              sellerUtility={scoredDeal?.sellerUtility ?? 0.742}
              paretoDeals={paretoDeals}
            />
          </div>
        )}
      </div>

      {/* 5. NEGOTIATION TIMELINE & ACTION CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Negotiation Conversation Sequence</h3>
          <span className="text-slate-500 font-semibold">Round {round} / {maxRounds}</span>
        </div>

        <div className="space-y-2 max-h-[260px] overflow-y-auto">
          {dialogueHistory.map((msg, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>{msg.sender.replace('_', ' ')}</span>
                <span>Round {msg.round}</span>
              </div>
              <p className="text-slate-800 leading-relaxed">{msg.text}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={nextRound}
            disabled={round >= maxRounds || humanApproved}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all"
          >
            Advance Negotiation Step →
          </button>

          <div className="flex gap-2">
            <button onClick={() => setIsModifyOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2.5 px-3 rounded-xl border border-slate-300">
              Modify Parameters
            </button>
            <button onClick={rejectDeal} className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs py-2.5 px-3 rounded-xl border border-red-200">
              Reject Offer
            </button>
          </div>
        </div>
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
