import React, { useState } from 'react';
import { Sliders, ArrowRight } from 'lucide-react';
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
    { label: 'Increase volume to 600 units', query: { quantity: 600 } },
    { label: 'Offer upfront payment discount', query: { paymentTerms: 'upfront' } },
    { label: 'Extend delivery SLA to 7 days', query: { deliveryDays: 7 } },
    { label: 'Expand budget ceiling by ₹20,000', query: { maxTotalBudget: buyerPolicy.maxTotalBudget + 20000 } },
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
    <div className="max-w-[860px] mx-auto space-y-8 text-zinc-900 font-sans antialiased py-2">
      
      {/* Title & Description */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Decision Engine Simulator
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
          Commercial Trade-off Simulator
        </h1>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
          Evaluate hypothetical commercial adjustments without altering active contract state. All calculations are executed deterministically against supplier economics.
        </p>
      </div>

      {/* Preset Query Tabs (Minimal, text-first) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3 text-xs font-medium">
        {presetQueries.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setActiveQueryIndex(idx)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeQueryIndex === idx
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="space-y-3">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-400 text-[11px]">
              <th className="pb-2 font-medium">DIMENSION</th>
              <th className="pb-2 font-medium">CURRENT AGREEMENT</th>
              <th className="pb-2 font-medium text-zinc-900">SIMULATED OUTCOME</th>
              <th className="pb-2 font-medium text-right">NET DELTA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-900">
            <tr>
              <td className="py-2.5 font-sans text-zinc-600">Total Spend</td>
              <td className="py-2.5">{formatMoney(whatIfResult.baselineDeal?.totalBuyerCost ?? 382500)}</td>
              <td className="py-2.5 font-semibold text-zinc-950">{formatMoney(whatIfResult.newBestDeal?.totalBuyerCost ?? 382500)}</td>
              <td className="py-2.5 text-right text-emerald-700 font-semibold">
                {whatIfResult.priceDelta >= 0 ? `+${formatMoney(whatIfResult.priceDelta)}` : `-${formatMoney(Math.abs(whatIfResult.priceDelta))}`}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 font-sans text-zinc-600">Unit Rate</td>
              <td className="py-2.5">{formatMoney(baselineDeal.items[0]?.unitPrice ?? 800, true)}</td>
              <td className="py-2.5 font-semibold text-zinc-950">{formatMoney(newDeal?.items[0]?.unitPrice ?? 800, true)}</td>
              <td className="py-2.5 text-right text-emerald-700">
                {whatIfResult.unitPriceSaving > 0 ? `${formatMoney(whatIfResult.unitPriceSaving, true)} savings` : '0'}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 font-sans text-zinc-600">Order Quantity</td>
              <td className="py-2.5">{formatNumber(baselineDeal.items[0]?.quantity ?? 500)} units</td>
              <td className="py-2.5 font-semibold text-zinc-950">{formatNumber(newDeal?.items[0]?.quantity ?? 500)} units</td>
              <td className="py-2.5 text-right text-zinc-600">
                +{(newDeal?.items[0]?.quantity ?? 500) - (baselineDeal.items[0]?.quantity ?? 500)}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 font-sans text-zinc-600">Delivery SLA</td>
              <td className="py-2.5">{baselineDeal.deliveryDays} Days</td>
              <td className="py-2.5 font-semibold text-zinc-950">{newDeal?.deliveryDays ?? 0} Days</td>
              <td className="py-2.5 text-right text-zinc-600">
                {(newDeal?.deliveryDays ?? 0) - baselineDeal.deliveryDays >= 0 ? `+${(newDeal?.deliveryDays ?? 0) - baselineDeal.deliveryDays}d` : `${(newDeal?.deliveryDays ?? 0) - baselineDeal.deliveryDays}d`}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 font-sans text-zinc-600">Payment Terms</td>
              <td className="py-2.5">{baselineDeal.paymentTerms.toUpperCase()}</td>
              <td className="py-2.5 font-semibold text-zinc-950">{newDeal?.paymentTerms.toUpperCase() ?? '-'}</td>
              <td className="py-2.5 text-right text-zinc-600">&mdash;</td>
            </tr>

            <tr>
              <td className="py-2.5 font-sans text-zinc-600">Mathematical Utility</td>
              <td className="py-2.5">{formatPercent(whatIfResult.baselineDeal?.buyerUtility ?? 0.85)}</td>
              <td className="py-2.5 font-semibold text-zinc-950">{formatPercent(whatIfResult.newBestDeal?.buyerUtility ?? 0.85)}</td>
              <td className="py-2.5 text-right text-emerald-700 font-semibold">
                {whatIfResult.buyerUtilityDelta >= 0 ? `+${formatPercent(whatIfResult.buyerUtilityDelta)}` : formatPercent(whatIfResult.buyerUtilityDelta)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rationale & Recommendation */}
      <div className="pt-4 border-t border-zinc-200 text-xs space-y-1.5">
        <span className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider block">
          ENGINE EVALUATION RATIONALE
        </span>
        <p className="text-zinc-700 leading-relaxed">
          {whatIfResult.tradeoffExplanation}
        </p>
        <p className="text-emerald-800 font-medium pt-1">
          {whatIfResult.recommendation}
        </p>
      </div>

    </div>
  );
};
