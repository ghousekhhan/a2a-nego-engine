import React, { useState } from 'react';
import {
  Check,
  X,
  RotateCcw,
  Sliders,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import {
  MarginDiscountChart,
  InventoryPressureChart,
  DemandCapacityChart,
  RevenueContributionChart,
} from './charts/Visualizations.tsx';
import { formatMoney, formatPercent, formatNumber } from '../utils/formatters.ts';

export function SellerInterface({ state }: { state: CanonicalState }) {
  const { buyerPolicy, sellerPolicy, currentDeal, scoredDeal, dialogueHistory } = state;
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [customCounterPrice, setCustomCounterPrice] = useState<number>(695.45);

  const currentQty = currentDeal.items[0]?.quantity ?? buyerPolicy.requiredQuantity ?? 500;
  const unitPrice = currentDeal.items[0]?.unitPrice ?? 750;
  const revenue = currentQty * unitPrice;
  const unitCost = 450;
  const sellerFloorUnitPrice = 516; // unit cost + min margin floor (10%)
  const sellerFloorTotal = sellerFloorUnitPrice * currentQty;
  const profit = (unitPrice - unitCost) * currentQty;
  const marginPct = revenue > 0 ? (profit / revenue) * 100 : 10;

  const merchantInsights = [
    "Inventory pressure is high for SKF 6205 bearings (1,200 in stock); accepting a volume discount is preferable to carrying excess inventory.",
    `Buyer order volume (${formatNumber(currentQty)} units) creates gross contribution, justifying the pricing concession.`,
    "Current counteroffer stays safely above the configured seller floor margin (10.0%).",
  ];

  return (
    <div className="max-w-[960px] mx-auto space-y-8 font-sans antialiased text-slate-900">
      
      {/* 1. SELLER DESK HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">SELLER DESK</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Apex Industrial Components</h1>
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          Min Margin Rule: <strong className="text-slate-900">10.0% Floor</strong>
        </div>
      </div>

      {/* 2. PRIMARY SELLER QUESTION: SHOULD I ACCEPT OR COUNTER? */}
      <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ACTIVE NEGOTIATION</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">Should I accept or counter?</h2>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
            Action Required
          </span>
        </div>

        {/* CONVERSATIONAL INCOMING REQUEST SUMMARY */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="font-bold text-slate-500 text-[10px] uppercase">INCOMING REQUEST</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{formatNumber(currentQty)} industrial bearings</p>
              <p className="text-slate-600 mt-0.5">{buyerPolicy.requiredDeliveryDays}-day delivery requirement</p>
              <p className="text-slate-600">Target Budget: {formatMoney(buyerPolicy.targetTotalBudget || 360000)}</p>
            </div>

            <div>
              <span className="font-bold text-slate-500 text-[10px] uppercase">CURRENT OFFER</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{formatMoney(revenue)}</p>
              <p className="text-slate-600 mt-0.5">{formatMoney(unitPrice, true)} / unit</p>
              <p className="text-emerald-700 font-semibold">Margin: {formatPercent(marginPct)}</p>
            </div>

            <div>
              <span className="font-bold text-slate-500 text-[10px] uppercase">MINIMUM VIABLE DEAL (FLOOR)</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{formatMoney(sellerFloorTotal)}</p>
              <p className="text-slate-600 mt-0.5">{formatMoney(sellerFloorUnitPrice, true)} / unit</p>
              <p className="text-slate-500">10.0% Min Profit Floor</p>
            </div>
          </div>

          {/* DEALFLOW RECOMMENDATION */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1">
            <span className="font-bold text-emerald-900 uppercase text-[10px]">DEALFLOW RECOMMENDATION</span>
            <p className="text-slate-900 font-bold text-sm">Counter at {formatMoney(revenue)} ({formatMoney(unitPrice, true)}/unit)</p>
            <p className="text-slate-700 text-xs">
              This preserves your 10.0% minimum margin floor ({formatMoney(sellerFloorUnitPrice, true)}/unit) while remaining within the buyer's stated budget.
            </p>
          </div>

          {/* PRIMARY SELLER ACTIONS */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => state.approveDeal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> ACCEPT
            </button>
            <button
              onClick={() => state.nextRound()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> SEND COUNTER
            </button>
            <button
              onClick={() => setShowCounterModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-5 rounded-xl border border-slate-300 transition-all flex items-center gap-1.5"
            >
              <Sliders className="w-4 h-4" /> IMPROVE TERMS
            </button>
            <button
              onClick={() => state.rejectDeal()}
              className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs py-3 px-5 rounded-xl border border-red-200 transition-all flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> REJECT
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONVERSATIONAL NEGOTIATION LOG */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Negotiation activity</h3>
          </div>
          <span className="text-slate-500 font-semibold">Round {state.round} of {state.maxRounds}</span>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto">
          {dialogueHistory.length > 0 ? (
            dialogueHistory.map((msg, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>{msg.sender.replace('_', ' ')}</span>
                  <span>Round {msg.round}</span>
                </div>
                <p className="text-slate-800 leading-relaxed">{msg.text}</p>
              </div>
            ))
          ) : (
            <div className="p-4 text-slate-500 text-center italic bg-slate-50 rounded-xl">
              Buyer submitted request. DealFlow Decision Engine evaluated seller policy floor.
            </div>
          )}
        </div>
      </div>

      {/* 4. SELLER METRICS & ANALYTICS (BELOW ACTIVE NEGOTIATION) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">MERCHANT ANALYTICS & INSIGHTS</h3>
        
        <div className="space-y-2 text-xs mb-4">
          {merchantInsights.map((insight, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MarginDiscountChart />
          <InventoryPressureChart />
          <DemandCapacityChart />
          <RevenueContributionChart />
        </div>
      </div>

      {/* IMPROVE TERMS MODAL */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Improve Counter Terms</h3>
            <p className="text-xs text-slate-600">
              Adjust unit price for target quantity ({currentQty} units). Seller floor limit: {formatMoney(sellerFloorUnitPrice, true)}.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Counter Unit Price (₹)</label>
              <input
                type="number"
                value={customCounterPrice}
                onChange={(e) => setCustomCounterPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCounterModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCounterModal(false);
                  state.modifyParameters(currentQty, Math.round(customCounterPrice * currentQty), buyerPolicy.requiredDeliveryDays, '30_days');
                }}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Apply Counter
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
