import React from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Zap,
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
  const profit = (unitPrice - unitCost) * currentQty;
  const marginPct = (profit / revenue) * 100;

  const activeNegotiations = [
    {
      buyer: 'Industrial Procurement Corp Ltd',
      product: 'SKF 6205-2RS1 Deep Groove Ball Bearing',
      qty: currentQty,
      offer: revenue,
      unitPrice: unitPrice,
      margin: marginPct,
      delivery: `${currentDeal.deliveryDays} Days`,
      stage: `Round ${state.round} / ${state.maxRounds}`,
      recommendation: `Counter at ${formatMoney(revenue)} — preserves minimum 10% margin while meeting buyer budget.`,
    },
    {
      buyer: 'Reliance Heavy Machinery',
      product: 'Siemens 15kW AC Induction Motor',
      qty: 12,
      offer: 480000,
      unitPrice: 40000,
      margin: 24.5,
      delivery: '7 Days',
      stage: 'Round 1 Initial RFQ',
      recommendation: 'Propose volume discount tier for orders over 15 units.',
    },
  ];

  const merchantInsights = [
    "Inventory pressure is high for SKF 6205 bearings (1,200 in stock); accepting a smaller margin (34.6%) is preferable to carrying excess inventory.",
    "Buyer order volume (550 units) creates +₹135,000 gross contribution, justifying the volume pricing concession.",
    "Current counteroffer stays safely above the configured seller floor margin (10.0%).",
  ];

  return (
    <div className="max-w-[1140px] mx-auto space-y-6 font-sans antialiased text-slate-900">
      
      {/* 1. HEADER */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">SUPPLIER COMMERCIAL DESK</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Merchant Command Center</h1>
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          Merchant: <strong className="text-slate-900">Apex Industrial Components</strong>
        </div>
      </div>

      {/* 2. TOP METRICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Revenue Negotiated</span>
          <p className="text-base font-extrabold text-slate-900 mt-0.5">{formatMoney(revenue)}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+12.4% vs Base</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Gross Margin %</span>
          <p className="text-base font-extrabold text-emerald-600 mt-0.5">{formatPercent(marginPct)}</p>
          <span className="text-[10px] text-slate-400">Min Floor: 10.0%</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Active Negotiations</span>
          <p className="text-base font-extrabold text-blue-600 mt-0.5">2 RFQs</p>
          <span className="text-[10px] text-slate-400">1 Action Needed</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Inventory at Risk</span>
          <p className="text-base font-extrabold text-amber-600 mt-0.5">1,200 Units</p>
          <span className="text-[10px] text-slate-400">High Stock Pressure</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Average Discount</span>
          <p className="text-base font-extrabold text-slate-900 mt-0.5">4.2%</p>
          <span className="text-[10px] text-slate-400">Volume Concession</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Win Rate</span>
          <p className="text-base font-extrabold text-emerald-600 mt-0.5">84.2%</p>
          <span className="text-[10px] text-slate-400">High Conversion</span>
        </div>
      </div>

      {/* 3. ACTIVE NEGOTIATIONS SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">ACTIVE NEGOTIATIONS</h3>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded">
            Live RFQ Stream
          </span>
        </div>

        <div className="space-y-3">
          {activeNegotiations.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500">BUYER: {item.buyer}</span>
                  <h4 className="text-xs font-bold text-slate-900">{item.product}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {item.stage}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                    Margin: {formatPercent(item.margin)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                <div><span>Qty:</span> <strong className="text-slate-900">{formatNumber(item.qty)} units</strong></div>
                <div><span>Current Offer:</span> <strong className="text-slate-900">{formatMoney(item.offer)}</strong></div>
                <div><span>Unit Price:</span> <strong className="text-slate-900">{formatMoney(item.unitPrice, true)}</strong></div>
                <div><span>SLA:</span> <strong className="text-slate-900">{item.delivery}</strong></div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900 font-medium">
                <span className="font-bold text-[10px] uppercase text-emerald-800">RECOMMENDED ACTION:</span>
                <p className="mt-0.5">{item.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SELLER GRAPHS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">MERCHANT COMMERCIAL ANALYTICS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MarginDiscountChart />
          <InventoryPressureChart />
          <DemandCapacityChart />
          <RevenueContributionChart />
        </div>
      </div>

      {/* 5. MERCHANT INSIGHTS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">MERCHANT INSIGHTS</h3>
        <div className="space-y-2 text-xs">
          {merchantInsights.map((insight, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
