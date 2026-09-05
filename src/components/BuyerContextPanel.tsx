import React from 'react';
import { ShieldCheck, Package, Clock, DollarSign, Award, Lock, Building2 } from 'lucide-react';
import type { BuyerPolicy, SupplierFacts } from '../types/index.ts';
import { SEEDED_PRODUCT } from '../demoData.ts';

interface BuyerContextPanelProps {
  buyerPolicy: BuyerPolicy;
  supplierFacts: SupplierFacts;
}

export const BuyerContextPanel: React.FC<BuyerContextPanelProps> = ({
  buyerPolicy,
  supplierFacts,
}) => {
  return (
    <div className="space-y-4">
      
      {/* Product Requirement Card */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase text-indigo-400 tracking-wider">
            Required Component
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <Package className="w-3 h-3" /> MRO Procurement
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-slate-100">{SEEDED_PRODUCT.name}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-mono">
            {SEEDED_PRODUCT.specification}
          </p>
        </div>
      </div>

      {/* Buyer Parameters & Constraints */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="font-semibold text-xs text-slate-200 uppercase tracking-wider font-mono">
            Buyer Parameters & Limits
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Human Authority</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-indigo-400" /> Target Budget
            </div>
            <div className="font-bold text-slate-200 font-mono mt-1">
              ₹{(buyerPolicy.targetTotalBudget ?? buyerPolicy.maxTotalBudget).toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-rose-400" /> Max Ceiling (Private)
            </div>
            <div className="font-bold text-rose-400 font-mono mt-1">
              ₹{buyerPolicy.maxTotalBudget.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Package className="w-3 h-3 text-blue-400" /> Quantity Range
            </div>
            <div className="font-semibold text-slate-200 font-mono mt-1">
              {buyerPolicy.minQuantity ?? buyerPolicy.requiredQuantity} - {buyerPolicy.maxQuantity ?? 650} units
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Delivery SLA
            </div>
            <div className="font-semibold text-slate-200 font-mono mt-1">
              ≤ {buyerPolicy.latestAcceptableDeliveryDays} Days
            </div>
          </div>
        </div>

        {/* Preference Weights Bar */}
        <div className="pt-2">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-1.5 flex justify-between">
            <span>Utility Weight Distribution</span>
            <span>Σ = 1.00</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(buyerPolicy.weights.price ?? 0.4) * 100}%` }}
              className="bg-indigo-500"
              title={`Price: ${((buyerPolicy.weights.price ?? 0.4) * 100).toFixed(0)}%`}
            />
            <div
              style={{ width: `${(buyerPolicy.weights.delivery ?? 0.25) * 100}%` }}
              className="bg-amber-500"
              title={`Delivery: ${((buyerPolicy.weights.delivery ?? 0.25) * 100).toFixed(0)}%`}
            />
            <div
              style={{ width: `${(buyerPolicy.weights.quality ?? 0.2) * 100}%` }}
              className="bg-emerald-500"
              title={`Quality: ${((buyerPolicy.weights.quality ?? 0.2) * 100).toFixed(0)}%`}
            />
            <div
              style={{ width: `${(buyerPolicy.weights.reliability ?? 0.15) * 100}%` }}
              className="bg-blue-500"
              title={`Reliability: ${((buyerPolicy.weights.reliability ?? 0.15) * 100).toFixed(0)}%`}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
            <span className="text-indigo-400">Price 45%</span>
            <span className="text-amber-400">Deliv 25%</span>
            <span className="text-emerald-400">Qual 15%</span>
            <span className="text-blue-400">Rel 15%</span>
          </div>
        </div>
      </div>

      {/* Supplier Profile & Reliability */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <h4 className="font-semibold text-xs text-slate-200 uppercase tracking-wider font-mono">
              Target Supplier
            </h4>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
            ELIGIBLE
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Supplier Name</span>
            <span className="font-semibold font-mono text-slate-200">Supplier Alpha MRO Ltd.</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Reliability Score</span>
            <span className="font-bold font-mono text-emerald-400">
              {(supplierFacts.reliabilityScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Quality Index</span>
            <span className="font-bold font-mono text-emerald-400">
              {(supplierFacts.qualityScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Compliance & Certs</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-mono">
              <Award className="w-3 h-3" /> ISO 9001 Verified
            </span>
          </div>
        </div>
      </div>

      {/* Privacy Guard Notice */}
      <div className="bg-slate-950/80 rounded-xl p-3 border border-indigo-500/20 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-indigo-300 text-[11px]">Strict Information Isolation</div>
          <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
            Buyer maximum budget (₹4.0L) and Supplier unit cost (₹450) are encrypted & kept strictly private. Neither agent can inspect opposing private parameters.
          </p>
        </div>
      </div>

    </div>
  );
};
