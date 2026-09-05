import React from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
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
import { formatMoney, formatNumber } from '../utils/formatters.ts';

export function AdminConsole({ state }: { state: CanonicalState }) {
  const { auditTrail } = state;

  const activityFeed = [
    { time: '10:42', event: 'Buyer and seller agents reached agreement on 500 bearings at ₹382,500' },
    { time: '10:37', event: 'Negotiation stalled — supplier unable to meet 3-day emergency delivery constraint' },
    { time: '10:31', event: 'New certified supplier (Meridian Bearings) joined autonomous network' },
    { time: '10:22', event: 'Deal #DF-1044 completed & settled through Razorpay sandbox' },
    { time: '10:14', event: 'Buyer agent probed volume concession (+100 units) on Acme RFQ' },
    { time: '10:05', event: 'Decision Engine enforced 10.0% seller floor margin on Nova Supplies bid' },
  ];

  return (
    <div className="max-w-[860px] mx-auto space-y-12 text-zinc-900 font-sans antialiased py-2">
      
      {/* ================================================== */}
      {/* 1. TOP OPERATIONAL SUMMARY (NO WALL OF KPI CARDS) */}
      {/* ================================================== */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Marketplace Operations
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
          Autonomous Network Activity
        </h1>
        <div className="pt-2 flex flex-wrap items-baseline gap-6 font-mono text-xs border-b border-zinc-200 pb-4">
          <div>
            <span className="text-zinc-400 block text-[11px]">TODAY'S SESSIONS</span>
            <span className="font-semibold text-zinc-950">124 negotiations</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">COMPLETED AGREEMENTS</span>
            <span className="font-semibold text-zinc-950">91 deals completed</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">AGREEMENT CONVERSION</span>
            <span className="font-semibold text-emerald-700">73.4% rate</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">CUMULATIVE GMV</span>
            <span className="font-semibold text-zinc-950">{formatMoney(18450000)}</span>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. REAL-TIME ACTIVITY FEED */}
      {/* ================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <span className="text-xs font-semibold text-zinc-900">
            What's Happening Now
          </span>
          <span className="text-xs font-mono text-zinc-500">Live Agent Stream</span>
        </div>

        <div className="divide-y divide-zinc-100 text-xs">
          {activityFeed.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-start gap-4">
              <span className="font-mono text-zinc-400 text-[11px] shrink-0 pt-0.5">{item.time}</span>
              <span className="text-zinc-700">{item.event}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. QUESTION-DRIVEN ANALYTICS */}
      {/* ================================================== */}
      <section className="space-y-8 pt-4 border-t border-zinc-200">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-zinc-950">
            Operational Analytics
          </h2>
          <p className="text-xs text-zinc-500">
            Charts designed to answer specific commercial governance questions.
          </p>
        </div>

        {/* Question 1: Where do negotiations stall? */}
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-zinc-900">Where do negotiations stall or fail?</span>
            <p className="text-xs text-zinc-500">Distribution of agreement bottlenecks across price, SLA, and reliability limits.</p>
          </div>
          <div className="pt-2">
            <DealOutcomeChart />
          </div>
        </div>

        {/* Question 2: How efficiently are volume discounts unlocked? */}
        <div className="space-y-3 pt-4 border-t border-zinc-100">
          <div>
            <span className="text-xs font-semibold text-zinc-900">How much commercial savings are buyer agents capturing?</span>
            <p className="text-xs text-zinc-500">Cumulative buyer cost compression over negotiation rounds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <SavingsOverTimeChart />
            <GmvOverTimeChart />
          </div>
        </div>

        {/* Question 3: Supplier performance and conversion */}
        <div className="space-y-3 pt-4 border-t border-zinc-100">
          <div>
            <span className="text-xs font-semibold text-zinc-900">Which suppliers meet reliability thresholds consistently?</span>
            <p className="text-xs text-zinc-500">Supplier SLA reliability scores vs completed order volumes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <SupplierPerformanceChart />
            <EnginePerformanceChart />
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. IMMUTABLE POLICY AUDIT TRAIL */}
      {/* ================================================== */}
      <section className="space-y-4 pt-4 border-t border-zinc-200">
        <DecisionEvidenceView auditTrail={auditTrail} />
      </section>

    </div>
  );
}
