import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import {
  GmvOverTimeChart,
  SavingsOverTimeChart,
  PortfolioFunnelChart,
  DealOutcomeChart,
  SupplierPerformanceChart,
  EnginePerformanceChart,
} from './charts/Visualizations.tsx';
import { DecisionEvidenceView } from './DecisionEvidenceView.tsx';
import { formatMoney, formatPercent, formatNumber } from '../utils/formatters.ts';

export function AdminConsole({ state }: { state: CanonicalState }) {
  const { auditTrail } = state;

  const marketplaceInsights = [
    "Volume concessions are currently producing the highest buyer savings (+10% volume unlocking -12% unit price).",
    "Supplier SLA reliability (85% min floor) is the most common reason otherwise cheaper offers are rejected.",
    "Deals requiring human approval are concentrated above autonomous authority limits (₹3,50,000 threshold).",
    "Average negotiation rounds are falling (2.4 rounds) while buyer savings remain stable at 4.02%.",
  ];

  return (
    <div className="max-w-[1040px] mx-auto space-y-6 font-sans antialiased text-slate-900">
      
      {/* 1. HEADER */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">ENTERPRISE MARKETPLACE</span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">How is the marketplace performing?</h1>
        </div>
        <div className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Network Operational
        </div>
      </div>

      {/* 2. TOP NUMBERS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">GMV Negotiated</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">{formatMoney(18450000)}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+18.2% MoM</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Buyer Savings</span>
          <p className="text-xl font-black text-emerald-600 mt-0.5">{formatMoney(742500)}</p>
          <span className="text-[10px] text-slate-400">4.02% Compression</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Deals Closed</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">88 Executed</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Razorpay Settled</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Agreement Rate</span>
          <p className="text-xl font-black text-emerald-600 mt-0.5">74.2%</p>
          <span className="text-[10px] text-slate-400">92 of 124 RFQs</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Average Rounds</span>
          <p className="text-xl font-black text-blue-600 mt-0.5">2.4 Rounds</p>
          <span className="text-[10px] text-slate-400">High Efficiency</span>
        </div>
      </div>

      {/* 3. AUTOMATIC INSIGHTS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">MARKETPLACE INSIGHTS</h3>
        <div className="space-y-2 text-xs">
          {marketplaceInsights.map((insight, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-800 flex items-start gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ADMIN GRAPHS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">PERFORMANCE EVIDENCE</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GmvOverTimeChart />
          <SavingsOverTimeChart />
          <PortfolioFunnelChart />
          <DealOutcomeChart />
          <SupplierPerformanceChart />
          <EnginePerformanceChart />
        </div>
      </div>

      {/* 5. DECISION EVIDENCE */}
      <div className="space-y-3">
        <DecisionEvidenceView auditTrail={auditTrail} />
      </div>

    </div>
  );
}
