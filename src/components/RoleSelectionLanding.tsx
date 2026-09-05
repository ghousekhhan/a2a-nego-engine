import React from 'react';
import {
  Users,
  Building2,
  BarChart3,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { UserRole } from '../store/canonicalState.ts';
import { CANONICAL_SCENARIOS } from '../data/canonicalScenarios.ts';

interface RoleSelectionLandingProps {
  onSelectRole: (role: UserRole) => void;
  onSelectScenario: (scenarioId: string) => void;
}

export function RoleSelectionLanding({ onSelectRole, onSelectScenario }: RoleSelectionLandingProps) {
  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          Deterministic Decision Engine & Agentic Negotiation Core
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          A2A Commercial Deal Engine
        </h1>
        <p className="text-base text-slate-600 font-normal leading-relaxed">
          Agents communicate. Decision Engine decides. Humans authorize. Razorpay executes.
          Experience autonomous enterprise commercial negotiations driven by hard mathematical optimization.
        </p>
      </div>

      {/* 3 Persona Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* BUYER PERSONA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Procurement & Sourcing</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Buyer Workspace</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Parse natural language requirements, optimize supplier candidate deals, view Pareto trade-offs, and enforce hard spending limits.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Natural Language Intent Parsing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>3 Pareto Option Recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Budget & Authority Governance</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => onSelectRole('buyer')}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs group-hover:gap-3"
          >
            Launch Buyer Sourcing <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* SELLER PERSONA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Supplier Commercial Hub</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Seller Command Center</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Protect unit gross margins, automate concession trade-offs (quantity volume for price discount), and manage inventory pressure.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Minimum 10% Margin Floor Protection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Give/Get Concession Matrix</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Demand & Inventory Pressure Tracking</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => onSelectRole('seller')}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs group-hover:gap-3"
          >
            Enter Seller Command <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ADMIN PERSONA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Enterprise Operations</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Commercial Intelligence</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Portfolio-wide GMV, savings analytics, conversion funnels, engine intervention rates, and full audit compliance trails.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Portfolio GMV & Cost Savings KPIs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Conversion Funnel Analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Cryptographic Audit Trace</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => onSelectRole('admin')}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs group-hover:gap-3"
          >
            Open Admin Console <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 10 Canonical Demo Scenarios Gallery */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Layers className="w-4 h-4" /> 10 Canonical Validation Scenarios
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Select Demo Scenario to Test Decision Logic</h2>
            <p className="text-xs text-slate-500">Each scenario exercises specific hard constraints, trade-off mathematics, or governance gates.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {CANONICAL_SCENARIOS.map((sc) => (
            <div
              key={sc.id}
              onClick={() => {
                onSelectScenario(sc.id);
                onSelectRole('buyer');
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
            >
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>SCENARIO {sc.scenarioNumber}</span>
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-blue-700 font-mono">
                    {sc.expectedStatus}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5 group-hover:text-blue-600 transition-colors">
                  {sc.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {sc.shortDescription}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                <span>Run Scenario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
