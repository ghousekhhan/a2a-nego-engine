import React from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  RotateCcw,
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
  const { sellerPolicy, currentDeal, scoredDeal } = state;

  const currentQty = currentDeal.items[0]?.quantity ?? 500;
  const unitPrice = Math.round(currentDeal.items[0]?.unitPrice ?? 750);
  const revenue = currentQty * unitPrice;
  const unitCost = 450;
  const sellerFloorPrice = 516; // unit cost + min margin floor (10%)
  const profit = (unitPrice - unitCost) * currentQty;
  const marginPct = (profit / revenue) * 100;

  const merchantInsights = [
    "Inventory pressure is high for SKF 6205 bearings (1,200 in stock); accepting a smaller margin (34.6%) is preferable to carrying excess inventory.",
    "Buyer order volume (550 units) creates +₹135,000 gross contribution, justifying the volume pricing concession.",
    "Current counteroffer stays safely above the configured seller floor margin (10.0%).",
  ];

  return (
    <div className="max-w-[960px] mx-auto space-y-8 font-sans antialiased text-slate-900">
      
      {/* 1. HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">SUPPLIER DESK</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Merchant Command Center</h1>
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          Merchant: <strong className="text-slate-900">Apex Industrial Components</strong>
        </div>
      </div>

      {/* 2. PRIMARY SELLER QUESTION: SHOULD I ACCEPT OR COUNTER? */}
      <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PRIMARY NEGOTIATION DESK</span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Should I accept or counter?</h2>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
            Active RFQ Action Required
          </span>
        </div>

        {/* ACTIVE NEGOTIATION CARD */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="font-bold text-slate-500 text-[10px] uppercase">BUYER REQUEST</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{formatNumber(currentQty)} bearings</p>
              <p className="text-slate-600 mt-0.5">{buyerPolicy.requiredDeliveryDays}-day delivery requirement</p>
              <p className="text-slate-600">Budget: {formatMoney(buyerPolicy.targetTotalBudget || 360000)}</p>
            </div>

            <div>
              <span className="font-bold text-slate-500 text-[10px] uppercase">CURRENT OFFER</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{formatMoney(revenue)}</p>
              <p className="text-slate-600 mt-0.5">{formatMoney(unitPrice, true)} / unit</p>
              <p className="text-emerald-700 font-semibold">Margin: {formatPercent(marginPct)}</p>
            </div>

            <div>
              <span className="font-bold text-slate-500 text-[10px] uppercase">YOUR FLOOR</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{formatMoney(sellerFloorPrice * currentQty)}</p>
              <p className="text-slate-600 mt-0.5">{formatMoney(sellerFloorPrice, true)} / unit</p>
              <p className="text-slate-500">10.0% Min Profit Floor</p>
            </div>
          </div>

          {/* RECOMMENDED ACTION */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1">
            <span className="font-bold text-emerald-900 uppercase text-[10px]">RECOMMENDED ACTION</span>
            <p className="text-slate-900 font-bold text-sm">Counter at {formatMoney(revenue)}</p>
            <p className="text-slate-700 text-xs">
              Reason: Maintains your minimum margin while remaining within the buyer's authorized budget.
            </p>
          </div>

          {/* PRIMARY ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => state.approveDeal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> ACCEPT OFFER
            </button>
            <button
              onClick={() => state.nextRound()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> COUNTER OFFER
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

      {/* 3. SELLER METRICS & ANALYTICS (LOWER ON PAGE) */}
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

    </div>
  );
}
