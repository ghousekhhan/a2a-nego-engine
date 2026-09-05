import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Check,
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
    <div className="max-w-[1040px] mx-auto py-10 px-4 space-y-24 font-sans antialiased text-slate-900">
      
      {/* ================================================== */}
      {/* 4. HERO SECTION */}
      {/* ================================================== */}
      <section className="text-center space-y-6 pt-4 max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          A2A Deal Engine
        </span>
        
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Let AI negotiate the deal.<br />You stay in control.
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
          Buyer and seller agents negotiate price, quantity, delivery and payment terms automatically. Our deterministic Decision Engine makes sure every proposed agreement stays within the commercial rules set by the business.
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

        <p className="text-xs text-slate-500 font-medium pt-3">
          Agents negotiate. Rules protect the economics. Humans authorize. Razorpay executes.
        </p>
      </section>

      {/* ================================================== */}
      {/* 5. HERO VISUAL — ELEGANT PRODUCT INTERACTION PREVIEW */}
      {/* ================================================== */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl mx-auto space-y-4 text-xs font-sans">
        <div className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
          Product Preview — Autonomous Commercial Pipeline
        </div>

        <div className="space-y-3">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
            <span className="font-bold text-slate-700 text-[11px]">BUYER REQUEST</span>
            <p className="font-mono text-slate-900 text-xs">"I need 500 industrial bearings within 6 days under ₹390,000."</p>
          </div>

          <div className="flex justify-center text-slate-300">↓</div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
              <span className="font-bold text-blue-700 text-[11px] block">BUYER AGENT</span>
              <span className="text-slate-700 text-[11px]">Finds viable suppliers & formulates counter-offers</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <span className="font-bold text-emerald-700 text-[11px] block">SELLER AGENT</span>
              <span className="text-slate-700 text-[11px]">Evaluates margin & proposes concessions</span>
            </div>
          </div>

          <div className="flex justify-center text-slate-300">↓</div>

          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl space-y-1.5 text-[11px]">
            <span className="font-bold text-purple-800 block">DECISION ENGINE (RULES CHECK)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-purple-900 font-semibold">
              <span>✓ Budget &le; ₹390,000</span>
              <span>✓ Seller Margin &ge; 10%</span>
              <span>✓ Delivery &le; 6 Days</span>
              <span>✓ Spend &le; Authority</span>
            </div>
          </div>

          <div className="flex justify-center text-slate-300">↓</div>

          <div className="bg-white border-2 border-emerald-500 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">AGREED COMMERCIAL DEAL</span>
              <div className="text-lg font-bold text-slate-900">₹3,82,500</div>
              <div className="text-[11px] text-slate-500">550 units @ ₹695.45/u | 4-day delivery | Upfront</div>
            </div>
            <button
              onClick={() => {
                onSelectScenario('scenario-01');
                onSelectRole('buyer');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-2xs"
            >
              Review agreement
            </button>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. WHAT WE ACTUALLY DO */}
      {/* ================================================== */}
      <section id="product-section" className="space-y-8 pt-6 border-t border-slate-200">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Negotiation, without the manual back-and-forth.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">NEGOTIATE</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Buyer and seller agents exchange offers and concessions instead of relying on endless email and calls.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">PROTECT</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Decision Engine evaluates every proposal against budget, margin, delivery, quantity and authority.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">AUTHORIZE</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Humans remain in control of the final agreement before payment is executed through Razorpay.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. THE PROBLEM */}
      {/* ================================================== */}
      <section className="space-y-6 pt-6 border-t border-slate-200">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Buying at the right price is more than finding the lowest price.
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            A supplier offering the lowest unit price may have poor delivery SLA, insufficient reliability, unacceptable profit margins, limited stock, or strict payment constraints. Buyers and sellers optimize fundamentally different commercial variables.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Traditional procurement forces humans to manually resolve these trade-offs through long phone calls and emails. <strong>A2A Deal Engine lets agents negotiate those economic trade-offs directly.</strong>
          </p>
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. SHOW THE PRODUCT — ONE DEAL NEGOTIATED IN SECONDS */}
      {/* ================================================== */}
      <section className="space-y-6 pt-6 border-t border-slate-200">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            One deal. Negotiated in seconds.
          </h2>
          <p className="text-xs text-slate-500">Actual output calculated by the deterministic Decision Engine.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl mx-auto space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="font-bold text-slate-700">BUYER:</span>
            <p className="text-slate-900 font-mono">"I need 500 bearings within 6 days under ₹390,000."</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="font-bold text-slate-700">SELLER:</span>
            <p className="text-slate-900 font-mono">"₹750 per unit, delivery in 5 days."</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-0.5 text-blue-900">
            <span className="font-bold text-blue-700">BUYER AGENT:</span>
            <p>"Can improve price if quantity increases."</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="font-bold text-slate-700">BUYER:</span>
            <p className="text-slate-900 font-mono">"Increase to 600 units."</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <span className="font-bold text-slate-700">SELLER AGENT:</span>
            <p className="text-slate-900 font-mono">"₹695.45 per unit."</p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-1 text-purple-900">
            <span className="font-bold text-purple-800">DECISION ENGINE:</span>
            <div className="space-y-0.5 font-medium">
              <p>✓ Within buyer authority.</p>
              <p>✓ Seller margin protected.</p>
              <p>✓ Delivery requirement satisfied.</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-emerald-900">
            <span className="font-bold uppercase text-[10px] text-emerald-800">FINAL AGREEMENT</span>
            <p className="font-bold text-slate-900 text-sm">600 units | ₹695.45 / unit | ₹4,17,270 total | 5-day delivery</p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => {
                onSelectScenario('scenario-01');
                onSelectRole('buyer');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-lg transition-all"
            >
              Approve agreement
            </button>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 9. THE DIFFERENTIATOR */}
      {/* ================================================== */}
      <section className="space-y-8 pt-6 border-t border-slate-200">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            AI can negotiate. It should not control the money.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <span className="font-bold text-blue-600 uppercase tracking-wider">WHAT AI DOES</span>
            <ul className="space-y-2 text-slate-700 font-medium">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Understands buyer & seller requests</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Communicates structured offers</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Negotiates volume & SLA concessions</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Explains commercial outcomes</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <span className="font-bold text-purple-600 uppercase tracking-wider">WHAT THE DECISION ENGINE CONTROLS</span>
            <ul className="space-y-2 text-slate-700 font-medium">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /> Authorized Buyer Budget</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /> Minimum Seller Profit Margin Floor</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /> Quantity Tiers & Inventory</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /> Delivery SLA & Payment Terms</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /> Governance & Authority Limits</li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-xs text-slate-800 font-semibold text-center">
          That separation is what makes autonomous negotiation commercially safe.
        </div>
      </section>

      {/* ================================================== */}
      {/* 10. HOW IT WORKS (4 STEPS) */}
      {/* ================================================== */}
      <section className="space-y-8 pt-6 border-t border-slate-200">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            How it works.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400">01</span>
            <h3 className="font-bold text-slate-900">REQUEST</h3>
            <p className="text-slate-600 leading-relaxed">A buyer describes what they need in natural language.</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-2">
            <span className="text-xs font-mono font-bold text-blue-600">02</span>
            <h3 className="font-bold text-slate-900">NEGOTIATE</h3>
            <p className="text-slate-600 leading-relaxed">Buyer and seller agents exchange commercially meaningful offers.</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-2">
            <span className="text-xs font-mono font-bold text-purple-600">03</span>
            <h3 className="font-bold text-slate-900">DECIDE</h3>
            <p className="text-slate-600 leading-relaxed">The Decision Engine evaluates constraints and trade-offs.</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-600">04</span>
            <h3 className="font-bold text-slate-900">AUTHORIZE</h3>
            <p className="text-slate-600 leading-relaxed">A human approves the agreement before execution.</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-medium text-center">
          Approved agreements can be executed through Razorpay.
        </p>
      </section>

      {/* ================================================== */}
      {/* 12. TRY THE DEAL ENGINE */}
      {/* ================================================== */}
      <section id="try-section" className="space-y-8 pt-6 border-t border-slate-200">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Try the Deal Engine
          </h2>
          <p className="text-xs text-slate-600">Choose how you want to see the same negotiation.</p>
        </div>

        {/* THREE CHOICES ONLY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* BUYER */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">BUYER</span>
              <h3 className="text-base font-bold text-slate-900">Find the best commercial deal.</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit a sourcing request and evaluate Pareto candidate offers.
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
              <h3 className="text-base font-bold text-slate-900">Protect your margin while winning demand.</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track incoming demand and evaluate concession trade-offs.
              </p>
            </div>
            <button
              onClick={() => onSelectRole('seller')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all"
            >
              TRY AS SELLER
            </button>
          </div>

          {/* MARKETPLACE */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">MARKETPLACE</span>
              <h3 className="text-base font-bold text-slate-900">See how negotiated commerce performs.</h3>
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

        {/* DEMO SCENARIO SELECTOR */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-900">Demo Scenario</span>
            <p className="text-slate-500 text-[11px]">Select any of the 10 canonical scenarios to demonstrate specific engine behaviors.</p>
          </div>

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

      </section>

    </div>
  );
}
