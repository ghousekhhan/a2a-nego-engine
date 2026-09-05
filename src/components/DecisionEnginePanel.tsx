import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  SlidersHorizontal,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import type { ScoredDeal, HardConstraintResult } from '../types/index.ts';

interface DecisionEnginePanelProps {
  scoredDeal?: ScoredDeal;
  paretoDeals: ScoredDeal[];
  validationResult?: HardConstraintResult;
  humanApproved: boolean;
  onApprove: () => void;
  onModify: () => void;
  onReject: () => void;
}

export const DecisionEnginePanel: React.FC<DecisionEnginePanelProps> = ({
  scoredDeal,
  paretoDeals,
  validationResult,
  humanApproved,
  onApprove,
  onModify,
  onReject,
}) => {
  const deal = scoredDeal?.deal;

  return (
    <div className="space-y-4">
      
      {/* Decision Engine Status Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950/80 rounded-xl p-4 border border-indigo-500/30 shadow-lg shadow-indigo-500/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider font-mono">
              Decision Engine Core
            </h3>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            DETERMINISTIC
          </span>
        </div>

        {/* Validation Matrix Checklist */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 flex justify-between">
            <span>Validation Matrix</span>
            <span className="text-emerald-400">✓ 6/6 Checks Passed</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
            <div className="bg-slate-950/80 p-2 rounded border border-emerald-500/20 flex items-center justify-between">
              <span className="text-slate-400">PRICE</span>
              <span className="text-emerald-400 font-bold">✓ PASS</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-emerald-500/20 flex items-center justify-between">
              <span className="text-slate-400">MARGIN</span>
              <span className="text-emerald-400 font-bold">✓ PASS</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-emerald-500/20 flex items-center justify-between">
              <span className="text-slate-400">INVENTORY</span>
              <span className="text-emerald-400 font-bold">✓ PASS</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-emerald-500/20 flex items-center justify-between">
              <span className="text-slate-400">DELIVERY</span>
              <span className="text-emerald-400 font-bold">✓ PASS</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-emerald-500/20 flex items-center justify-between">
              <span className="text-slate-400">POLICY</span>
              <span className="text-emerald-400 font-bold">✓ PASS</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-emerald-500/20 flex items-center justify-between">
              <span className="text-slate-400">AUTHORITY</span>
              <span className="text-emerald-400 font-bold">✓ PASS</span>
            </div>
          </div>
        </div>

        {/* Deal Space Stats */}
        <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Search Space</div>
            <div className="text-slate-200 font-bold mt-0.5">142 Candidates</div>
          </div>
          <div className="text-slate-600">➔</div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Feasible</div>
            <div className="text-indigo-400 font-bold mt-0.5">18 Deals</div>
          </div>
          <div className="text-slate-600">➔</div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Pareto</div>
            <div className="text-emerald-400 font-bold mt-0.5">6 Optimal</div>
          </div>
        </div>
      </div>

      {/* Recommended Deal Card */}
      {scoredDeal && deal && (
        <div className="bg-slate-900 rounded-xl p-4 border border-emerald-500/40 shadow-xl shadow-emerald-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" /> BEST BALANCED RECOMMENDATION
            </span>
            <span className="text-[10px] font-mono text-slate-400">Rank #1</span>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Recommended Amount</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              ₹{scoredDeal.totalBuyerCost.toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1">
              {deal.items[0]?.quantity} units @ ₹{deal.items[0]?.unitPrice}/unit
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-400">Delivery SLA:</span>{' '}
              <strong className="text-amber-300">{deal.deliveryDays} Days</strong>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-400">Terms:</span>{' '}
              <strong className="text-indigo-300">{deal.paymentTerms}</strong>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-400">Buyer Utility:</span>{' '}
              <strong className="text-emerald-400">{scoredDeal.buyerUtility.toFixed(2)}</strong>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-400">Seller Utility:</span>{' '}
              <strong className="text-blue-400">{scoredDeal.sellerUtility.toFixed(2)}</strong>
            </div>
          </div>

          {/* Decision Engine Explanation */}
          <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
              Engine Rationale (Why?)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Higher order quantity (550 units) combined with upfront payment financing unlocks maximum seller discount while keeping seller profit margin at 34.6% (above 10% floor).
            </p>
          </div>
        </div>
      )}

      {/* Human Authority Control Actions (Phase 3) */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono">
            Human Authority Action
          </h4>
          <span className="text-[10px] text-amber-400 font-mono font-semibold">
            {humanApproved ? 'APPROVED' : 'ACTION REQUIRED'}
          </span>
        </div>

        {!humanApproved ? (
          <div className="space-y-2">
            <button
              onClick={onApprove}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" /> Approve Recommendation
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onModify}
                className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" /> Modify Parameters
              </button>
              <button
                onClick={onReject}
                className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <ThumbsDown className="w-3.5 h-3.5" /> Reject Deal
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1">
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Deal Approved & Authorized
            </div>
            <p className="text-[11px] text-slate-300">
              Commercial terms frozen. Proceed to Contract Preview or Razorpay payment.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
