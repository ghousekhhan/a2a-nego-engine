import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowDown,
} from 'lucide-react';
import type { UserRole } from '../store/canonicalState.ts';
import { CANONICAL_SCENARIOS } from '../data/canonicalScenarios.ts';

interface RoleSelectionLandingProps {
  onSelectRole: (role: UserRole) => void;
  onSelectScenario: (scenarioId: string) => void;
}

export function RoleSelectionLanding({ onSelectRole, onSelectScenario }: RoleSelectionLandingProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-[1140px] mx-auto py-8 px-4 space-y-20 font-sans antialiased text-slate-900">
      
      {/* ================================================== */}
      {/* 1. HERO */}
      {/* ================================================== */}
      <section className="text-center space-y-6 pt-6 pb-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          A2A Deal Engine
        </h1>
        
        <p className="text-xl sm:text-2xl font-semibold text-slate-800 leading-snug">
          Commercial negotiation between AI agents, with humans in control.
        </p>

        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
          Buyers and sellers can negotiate price, quantity, delivery and payment automatically. A deterministic decision engine makes sure every agreement stays within commercial boundaries.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => scrollToSection('try-section')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 px-6 rounded-lg transition-all shadow-2xs"
          >
            TRY THE DEAL ENGINE
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-3 px-6 rounded-lg border border-slate-300 transition-all"
          >
            SEE HOW IT WORKS
          </button>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. WHAT IT DOES */}
      {/* ================================================== */}
      <section className="space-y-8 pt-6 border-t border-slate-200">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Negotiation that understands the economics of a deal.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">NEGOTIATE</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Buyer and seller agents exchange offers and concessions automatically in natural language.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">EVALUATE</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Decision Engine checks budget, margin, delivery, quantity and risk before an agreement can move forward.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">AUTHORIZE</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              A human approves, modifies or rejects the final terms before contract generation and payment execution.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. THE PROBLEM */}
      {/* ================================================== */}
      <section className="space-y-8 pt-6 border-t border-slate-200">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Why negotiation breaks down today.
          </h2>
          <p className="text-xs text-slate-500">
            Traditional B2B procurement relies on email, calls and manual back-and-forth. That creates three fundamental problems:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Slow negotiations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Commercial decisions depend on manual intervention, stalling deal cycles for days or weeks.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Hidden trade-offs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A lower price may mean worse delivery SLA, lower supplier reliability, or negative seller margins.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Unsafe automation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Software can automate workflows, but should not be allowed to make unconstrained commercial decisions.
            </p>
          </div>
        </div>

        <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-xs text-slate-800 font-semibold text-center">
          A2A Deal Engine handles the negotiation while keeping commercial authority explicit.
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. HOW IT WORKS */}
      {/* ================================================== */}
      <section id="how-it-works" className="space-y-8 pt-6 border-t border-slate-200">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            How it works.
          </h2>
          <p className="text-xs text-slate-500">A clear, deterministic pipeline from request to settlement.</p>
        </div>

        {/* ONE SIMPLE HORIZONTAL FLOW */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] text-xs font-bold text-slate-700">
            <span>BUYER REQUEST</span>
            <span className="text-slate-400">→</span>
            <span>BUYER AGENT</span>
            <span className="text-slate-400">→</span>
            <span className="text-blue-600">NEGOTIATION</span>
            <span className="text-slate-400">↔</span>
            <span>SELLER AGENT</span>
            <span className="text-slate-400">→</span>
            <span className="text-purple-600">DECISION ENGINE</span>
            <span className="text-slate-400">→</span>
            <span className="text-emerald-600">HUMAN APPROVAL</span>
            <span className="text-slate-400">→</span>
            <span>RAZORPAY</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
            <span className="font-bold text-slate-900">1. Buyer Request</span>
            <p className="text-slate-600 text-[11px] leading-relaxed font-mono">"I need 500 bearings within 6 days under ₹390,000."</p>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
            <span className="font-bold text-blue-600">2. Negotiation</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">Agents exchange commercially meaningful offers and concessions.</p>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
            <span className="font-bold text-purple-600">3. Decision Engine</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">Hard constraints and economic trade-offs determine what is acceptable.</p>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
            <span className="font-bold text-emerald-600">4. Human Approval</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">The authorized person makes the final call on the agreement.</p>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
            <span className="font-bold text-slate-900">5. Payment</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">The approved agreement moves to Razorpay Sandbox settlement.</p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. THE DIFFERENTIATOR */}
      {/* ================================================== */}
      <section className="space-y-8 pt-6 border-t border-slate-200">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            AI can negotiate. It should not control the money.
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The language model handles communication and natural language interpretation. The deterministic Decision Engine strictly controls: <strong>Budget, Margin, Quantity, Delivery, Payment terms, and Authority</strong>. Therefore an agent cannot simply "decide" that a bad deal is acceptable.
          </p>
        </div>

        {/* VISUAL FLOW */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl mx-auto space-y-4 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold items-center">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900">
              <span className="text-[10px] uppercase font-bold text-blue-600 block mb-1">AI AGENTS</span>
              "Let's negotiate."
            </div>
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-purple-900">
              <span className="text-[10px] uppercase font-bold text-purple-600 block mb-1">DECISION ENGINE</span>
              "Is this commercially allowed?"
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">HUMAN</span>
              "Approve / Modify / Reject"
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. EXAMPLE */}
      {/* ================================================== */}
      <section className="space-y-8 pt-6 border-t border-slate-200">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            See a negotiation in action.
          </h2>
          <p className="text-xs text-slate-500">A simple step-by-step commercial exchange.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl mx-auto space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700">BUYER:</span>
            <p className="text-slate-800 font-mono mt-0.5">"I need 500 bearings within 6 days under ₹390,000."</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700">SELLER:</span>
            <p className="text-slate-800 font-mono mt-0.5">"₹750/unit, delivered in 5 days."</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900">
            <span className="font-bold text-blue-700">BUYER AGENT:</span>
            <p className="mt-0.5">"Can improve price if quantity increases."</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700">BUYER:</span>
            <p className="text-slate-800 font-mono mt-0.5">"Increase to 600 units."</p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-purple-900">
            <span className="font-bold text-purple-700">DECISION ENGINE:</span>
            <p className="mt-0.5">"Volume concession keeps seller economics viable. Status: FEASIBLE."</p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
            <span className="font-bold uppercase text-[10px] text-emerald-700">FINAL AGREEMENT</span>
            <p className="font-bold text-slate-900 text-sm">600 units at ₹670/unit (₹4,02,000 total) | 5-day delivery | Net 30</p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => {
                onSelectScenario('scenario-01');
                onSelectRole('buyer');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-lg transition-all shadow-2xs"
            >
              APPROVE AGREEMENT & RUN DEMO
            </button>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. TRY IT */}
      {/* ================================================== */}
      <section id="try-section" className="space-y-8 pt-6 border-t border-slate-200">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Try the Deal Engine
          </h2>
          <p className="text-sm text-slate-600">See the negotiation from either side.</p>
        </div>

        {/* THREE CHOICES ONLY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* BUYER */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">BUYER</span>
              <h3 className="text-base font-bold text-slate-900">Find the best commercial deal.</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit a sourcing requirement and evaluate Pareto candidate offers.
              </p>
            </div>
            <button
              onClick={() => onSelectRole('buyer')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all"
            >
              TRY AS BUYER
            </button>
          </div>

          {/* SELLER */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">SELLER</span>
              <h3 className="text-base font-bold text-slate-900">Negotiate demand while protecting margin.</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track incoming buyer demand and manage concession trade-offs.
              </p>
            </div>
            <button
              onClick={() => onSelectRole('seller')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all"
            >
              TRY AS SELLER
            </button>
          </div>

          {/* ADMIN */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">ADMIN</span>
              <h3 className="text-base font-bold text-slate-900">See how the marketplace is performing.</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                View network GMV, buyer savings, agreement rates, and audit logs.
              </p>
            </div>
            <button
              onClick={() => onSelectRole('admin')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all"
            >
              VIEW MARKETPLACE
            </button>
          </div>

        </div>

        {/* DEMO SCENARIOS SELECTOR DROPDOWN */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-900">Engine Demo Scenarios</span>
            <p className="text-slate-500 text-[11px]">Select any of the 10 canonical scenarios to load pre-calculated deterministic state.</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onSelectScenario(e.target.value);
                  onSelectRole('buyer');
                }
              }}
              className="bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Select Demo Scenario --</option>
              {CANONICAL_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  Scenario {sc.scenarioNumber}: {sc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </section>

    </div>
  );
}
