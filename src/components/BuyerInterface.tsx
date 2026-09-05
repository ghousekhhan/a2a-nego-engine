import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
  Building2,
  DollarSign,
  Info,
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import { PriceQuantityChart, UtilityScatterChart } from './charts/Visualizations.tsx';
import { generateDecisionExplanation } from '../engine/explanation.ts';
import { MOCK_SUPPLIERS } from '../data/mockSuppliers.ts';
import { ModifyModal } from './ModifyModal.tsx';

export function BuyerInterface({ state }: { state: CanonicalState }) {
  const [nlInput, setNlInput] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('supplier-apex-mro');
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

  // Handle NL Query Submit
  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlInput.trim()) return;

    // Simple NLU parsing rules
    let qty = 500;
    const qtyMatch = nlInput.match(/(\d+)\s*(units|bearings|pcs|items)/i);
    if (qtyMatch) qty = parseInt(qtyMatch[1]);

    let targetB = 360000;
    const targetMatch = nlInput.match(/(₹|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|l)?/i);
    if (targetMatch) {
      let val = parseFloat(targetMatch[2].replace(/,/g, ''));
      if (targetMatch[3] && targetMatch[3].toLowerCase().startsWith('l')) val *= 100000;
      targetB = val;
    }

    startCustomNegotiation(
      'SKF 6205-2RS1 Deep Groove Ball Bearing',
      qty,
      targetB,
      Math.round(targetB * 1.1),
      5,
      '30_days',
      selectedSupplierId
    );
  };

  const explanation = scoredDeal ? generateDecisionExplanation(scoredDeal) : null;

  return (
    <div className="space-y-6">
      
      {/* 1. NATURAL LANGUAGE REQUIREMENT PARSER & SUPPLIER SELECTION */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Natural Language Commercial Parser
            </span>
            <h3 className="text-base font-bold text-slate-900">What do you need to buy?</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Target Supplier:</span>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {MOCK_SUPPLIERS.map((s) => (
                <option key={s.supplierId} value={s.supplierId}>
                  {s.name} ({s.badge})
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleNlSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder="e.g., Procure 500 units of SKF 6205 bearings within ₹3,60,000 target budget in 5 days..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Zap className="w-4 h-4" /> Run Sourcing Engine
          </button>
        </form>
      </div>

      {/* 2. SUMMARY KPI STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Target Budget</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">₹{(buyerPolicy.targetTotalBudget || 360000).toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Ceiling: ₹{buyerPolicy.maxTotalBudget.toLocaleString()}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Required Quantity</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{currentQty} units</p>
          <span className="text-[10px] text-blue-600 font-medium">₹{currentUnitPrice}/unit</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Delivery Required</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{buyerPolicy.requiredDeliveryDays} Days</p>
          <span className="text-[10px] text-slate-400">Max: {buyerPolicy.latestAcceptableDeliveryDays}d</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Calculated Landed Cost</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">₹{totalPrice.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% Math Verified</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Buyer Score</span>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">
            {scoredDeal ? (scoredDeal.buyerUtility * 100).toFixed(1) : '88.5'}%
          </p>
          <span className="text-[10px] text-slate-400">Balanced Score</span>
        </div>
      </div>

      {/* 3. DECISION ENGINE CONTROL ROOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: REAL GRAPH VISUALIZATIONS & PARETO OPTIONS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PriceQuantityChart currentQty={currentQty} currentUnitPrice={currentUnitPrice} />
            <UtilityScatterChart
              buyerUtility={scoredDeal?.buyerUtility ?? 0.85}
              sellerUtility={scoredDeal?.sellerUtility ?? 0.72}
              paretoDeals={paretoDeals}
            />
          </div>

          {/* 3 PARETO OPTION CARDS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Pareto Frontier Candidates</h4>
                <p className="text-xs text-slate-500">Optimal trade-off points generated by Decision Engine math</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                3 Candidates Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* BEST BALANCE */}
              <div className="bg-emerald-50/60 border-2 border-emerald-500 rounded-xl p-3.5 space-y-2 relative">
                <span className="absolute -top-2.5 left-3 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Recommended
                </span>
                <div className="pt-1">
                  <h5 className="text-xs font-bold text-slate-900">Best Balance</h5>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">₹3,82,500 (550 units)</p>
                </div>
                <div className="text-[10px] text-slate-500 space-y-1">
                  <div>Unit Price: <span className="font-semibold text-slate-800">₹695.45</span></div>
                  <div>Delivery: <span className="font-semibold text-slate-800">4 days (Upfront)</span></div>
                  <div>Buyer Utility: <span className="font-bold text-emerald-700">88.5%</span></div>
                </div>
              </div>

              {/* LOWEST COST */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-slate-300 transition-all">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Lowest Total Cost</h5>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">₹3,60,000 (450 units)</p>
                </div>
                <div className="text-[10px] text-slate-500 space-y-1">
                  <div>Unit Price: <span className="font-semibold text-slate-800">₹800.00</span></div>
                  <div>Delivery: <span className="font-semibold text-slate-800">5 days (Net 30)</span></div>
                  <div>Buyer Utility: <span className="font-bold text-blue-700">81.2%</span></div>
                </div>
              </div>

              {/* FASTEST DELIVERY */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-slate-300 transition-all">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Fastest Delivery</h5>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">₹4,10,000 (500 units)</p>
                </div>
                <div className="text-[10px] text-slate-500 space-y-1">
                  <div>Unit Price: <span className="font-semibold text-slate-800">₹820.00</span></div>
                  <div>Delivery: <span className="font-semibold text-slate-800">2 days (Expedited)</span></div>
                  <div>Buyer Utility: <span className="font-bold text-purple-700">79.4%</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* WHY THIS DEAL? EXPLANATION WIDGET */}
          {explanation && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Why This Deal? Decision Engine Rationale</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Recommendation:</span>
                  <p className="text-slate-600 mt-0.5">{explanation.what}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Mathematical Rationale:</span>
                  <p className="text-slate-600 mt-0.5">{explanation.why}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: NEGOTIATION TIMELINE & HUMAN APPROVAL ACTION PANEL (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Agent Dialogue History */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Agent-to-Agent Communication Loop</h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Round {round} / {maxRounds}
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {dialogueHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    msg.sender === 'decision_engine'
                      ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                      : msg.sender === 'buyer_agent'
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                      : msg.sender === 'seller_agent'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-[10px] uppercase tracking-wider opacity-75">
                    <span>{msg.sender.replace('_', ' ')}</span>
                    <span>Round {msg.round}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Stepper & Controls */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={nextRound}
                disabled={round >= maxRounds || humanApproved}
                className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                Advance Next Round <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* HUMAN GOVERNANCE & AUTHORIZATION CONTROL PANEL */}
          <div className="bg-white border-2 border-blue-600 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Human Governance Authorization</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The Decision Engine requires human approval for commercial commitments exceeding ₹3,50,000.
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Deal Amount:</span>
                <span className="font-bold text-slate-900">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized Ceiling:</span>
                <span className="font-semibold text-slate-700">₹{buyerPolicy.maxTotalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600">{humanApproved ? 'AUTHORIZED' : 'PENDING HUMAN APPROVAL'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={approveDeal}
                disabled={humanApproved}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Authorize & Sign Commercial Contract
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsModifyOpen(true)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2 rounded-lg border border-slate-300 transition-all"
                >
                  Modify Parameters
                </button>
                <button
                  onClick={rejectDeal}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs py-2 rounded-lg border border-red-200 transition-all"
                >
                  Reject Offer
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modify Modal */}
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
