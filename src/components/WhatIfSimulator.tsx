import React, { useState } from 'react';
import { Sliders, Sparkles, ArrowRight, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import type { BuyerPolicy, SellerPolicy, SupplierFacts, CanonicalDeal } from '../types/index.ts';
import { runWhatIfAnalysis } from '../engine/whatIf.ts';
import { formatMoney, formatNumber, formatPercent } from '../utils/formatters.ts';

interface WhatIfSimulatorProps {
  baselineDeal: CanonicalDeal;
  buyerPolicy: BuyerPolicy;
  sellerPolicy: SellerPolicy;
  supplierFacts: SupplierFacts;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baselineDeal,
  buyerPolicy,
  sellerPolicy,
  supplierFacts,
}) => {
  const [activeQueryIndex, setActiveQueryIndex] = useState<number>(0);

  const presetQueries = [
    { label: 'What if I increase quantity to 600 units?', query: { quantity: 600 } },
    { label: 'What if I offer upfront payment?', query: { paymentTerms: 'upfront' } },
    { label: 'What if delivery SLA can be 7 days?', query: { deliveryDays: 7 } },
    { label: 'What if I increase budget by ₹20,000?', query: { maxTotalBudget: buyerPolicy.maxTotalBudget + 20000 } },
  ];

  const currentQuery = presetQueries[activeQueryIndex]?.query ?? { quantity: 600 };
  const whatIfResult = runWhatIfAnalysis(
    currentQuery,
    baselineDeal,
    buyerPolicy,
    sellerPolicy,
    supplierFacts
  );

  const newDeal = whatIfResult.newBestDeal?.deal;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 font-sans antialiased">
      
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">What-If Commercial Trade-off Simulator</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test policy parameter changes without restarting or altering the live negotiation. Every scenario is recalculated live by the Decision Engine.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
          Decision Engine What-If Core
        </span>
      </div>

      {/* Preset Query Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {presetQueries.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setActiveQueryIndex(idx)}
            className={`p-3.5 rounded-xl text-xs text-left transition-all border ${
              activeQueryIndex === idx
                ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">Preset {idx + 1}</div>
            {item.label}
          </button>
        ))}
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <th className="p-3.5">Commercial Dimension</th>
              <th className="p-3.5">Current Approved Deal</th>
              <th className="p-3.5 text-blue-700">What-If Scenario Result</th>
              <th className="p-3.5 text-emerald-700">Impact / Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            <tr>
              <td className="p-3.5 font-semibold text-slate-600">Total Price</td>
              <td className="p-3.5 font-bold">{formatMoney(whatIfResult.baselineDeal?.totalBuyerCost ?? 382500)}</td>
              <td className="p-3.5 font-bold text-blue-700">
                {formatMoney(whatIfResult.newBestDeal?.totalBuyerCost ?? 382500)}
              </td>
              <td className="p-3.5 font-bold text-emerald-600">
                {whatIfResult.priceDelta >= 0 ? `+${formatMoney(whatIfResult.priceDelta)}` : `-${formatMoney(Math.abs(whatIfResult.priceDelta))}`}
              </td>
            </tr>

            <tr>
              <td className="p-3.5 font-semibold text-slate-600">Unit Price</td>
              <td className="p-3.5">{formatMoney(baselineDeal.items[0]?.unitPrice ?? 800, true)} / unit</td>
              <td className="p-3.5 text-blue-700">{formatMoney(newDeal?.items[0]?.unitPrice ?? 800, true)} / unit</td>
              <td className="p-3.5 text-emerald-600 font-semibold">
                {whatIfResult.unitPriceSaving > 0 ? `${formatMoney(whatIfResult.unitPriceSaving, true)}/unit saving` : 'No unit saving'}
              </td>
            </tr>

            <tr>
              <td className="p-3.5 font-semibold text-slate-600">Order Quantity</td>
              <td className="p-3.5">{formatNumber(baselineDeal.items[0]?.quantity ?? 500)} units</td>
              <td className="p-3.5 text-blue-700 font-bold">{formatNumber(newDeal?.items[0]?.quantity ?? 500)} units</td>
              <td className="p-3.5 text-slate-600 font-semibold">
                +{(newDeal?.items[0]?.quantity ?? 500) - (baselineDeal.items[0]?.quantity ?? 500)} units
              </td>
            </tr>

            <tr>
              <td className="p-3.5 font-semibold text-slate-600">Delivery SLA</td>
              <td className="p-3.5">{baselineDeal.deliveryDays} Days</td>
              <td className="p-3.5 text-blue-700">{newDeal?.deliveryDays ?? 0} Days</td>
              <td className="p-3.5 text-amber-700">
                {(newDeal?.deliveryDays ?? 0) - baselineDeal.deliveryDays >= 0 ? `+${(newDeal?.deliveryDays ?? 0) - baselineDeal.deliveryDays}d` : `${(newDeal?.deliveryDays ?? 0) - baselineDeal.deliveryDays}d`}
              </td>
            </tr>

            <tr>
              <td className="p-3.5 font-semibold text-slate-600">Payment Terms</td>
              <td className="p-3.5">{baselineDeal.paymentTerms.toUpperCase()}</td>
              <td className="p-3.5 text-blue-700">{newDeal?.paymentTerms.toUpperCase() ?? '-'}</td>
              <td className="p-3.5 text-slate-600">Terms adjusted</td>
            </tr>

            <tr>
              <td className="p-3.5 font-semibold text-slate-600">Buyer Utility</td>
              <td className="p-3.5">{formatPercent(whatIfResult.baselineDeal?.buyerUtility ?? 0.85)}</td>
              <td className="p-3.5 text-blue-700">{formatPercent(whatIfResult.newBestDeal?.buyerUtility ?? 0.85)}</td>
              <td className="p-3.5 font-bold text-emerald-600">
                {whatIfResult.buyerUtilityDelta >= 0 ? `+${formatPercent(whatIfResult.buyerUtilityDelta)}` : formatPercent(whatIfResult.buyerUtilityDelta)} utility
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rationale & Recommendation Box */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-blue-900 uppercase tracking-wider">
            Decision Engine Trade-off Rationale
          </div>
          <p className="text-slate-700 leading-relaxed font-sans">{whatIfResult.tradeoffExplanation}</p>
          <div className="pt-2 text-emerald-700 font-bold">
            {whatIfResult.recommendation}
          </div>
        </div>
      </div>

    </div>
  );
};
