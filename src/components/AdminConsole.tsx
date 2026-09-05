import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Zap,
  DollarSign,
  PieChart,
  History,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import { PortfolioFunnelChart } from './charts/Visualizations.tsx';
import { AuditTraceView } from './AuditTraceView.tsx';

export function AdminConsole({ state }: { state: CanonicalState }) {
  const { auditTrail } = state;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Enterprise Admin Console</span>
            <h2 className="text-lg font-bold text-slate-900">Commercial Intelligence & Platform Governance</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">System Compliance:</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Policy Compliant
          </span>
        </div>
      </div>

      {/* Portfolio KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Total Portfolio GMV</span>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">₹1,84,50,000</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+18.2% MoM Volume</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Calculated Cost Savings</span>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">₹7,42,500</p>
          <span className="text-[10px] text-slate-400">Average 4.02% price compression</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Agreement Success Rate</span>
          <p className="text-2xl font-bold text-blue-600 mt-0.5">74.2%</p>
          <span className="text-[10px] text-slate-400">92 of 124 negotiations executed</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Engine Block / Rejection Rate</span>
          <p className="text-2xl font-bold text-purple-600 mt-0.5">8.4%</p>
          <span className="text-[10px] text-slate-400">Prevented zero-profit margin breaches</span>
        </div>
      </div>

      {/* Analytics & Funnel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 space-y-6">
          <PortfolioFunnelChart />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Governance Enforcement Metrics</h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900">Deterministic Engine Override</span>
                  <p className="text-[11px] text-slate-500">LLM agents attempting to bypass price logic</p>
                </div>
                <span className="font-bold text-emerald-600">0 Violations (Blocked)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900">Human Approval Ceiling Compliance</span>
                  <p className="text-[11px] text-slate-500">Deals &gt; ₹3.5L held for human signature</p>
                </div>
                <span className="font-bold text-blue-600">100% Enforced</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900">Financial Math Reconciliation</span>
                  <p className="text-[11px] text-slate-500">totalPrice === quantity * unitPrice equality</p>
                </div>
                <span className="font-bold text-emerald-600">100% Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Audit Trace Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">System Cryptographic Audit Log</h3>
        <AuditTraceView auditTrail={auditTrail} />
      </div>

    </div>
  );
}
