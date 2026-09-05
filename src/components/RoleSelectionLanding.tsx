import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Check,
  Zap,
  Building2,
  Users,
  BarChart3,
} from 'lucide-react';
import type { UserRole } from '../store/canonicalState.ts';
import { CANONICAL_SCENARIOS } from '../data/canonicalScenarios.ts';
import { formatMoney, formatNumber } from '../utils/formatters.ts';

interface RoleSelectionLandingProps {
  onSelectRole: (role: UserRole) => void;
  onSelectScenario: (scenarioId: string) => void;
}

export function RoleSelectionLanding({ onSelectRole, onSelectScenario }: RoleSelectionLandingProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const interactiveOptions = [
    {
      title: 'BEST OVERALL',
      badge: 'Recommended',
      price: 382500,
      qty: 500,
      delivery: '5 days',
      savings: '₹7,500 savings',
      tradeoff: 'Optimal balance of price, delivery SLA & supplier reliability.',
      scenarioId: 'scenario-01',
    },
    {
      title: 'LOWEST PRICE',
      badge: 'Lowest Cost',
      price: 360000,
      qty: 450,
      delivery: '5 days',
      savings: '₹30,000 savings',
      tradeoff: 'Minimizes total cash outlay to target budget limit.',
      scenarioId: 'scenario-02',
    },
    {
      title: 'FASTEST DELIVERY',
      badge: 'Expedited SLA',
      price: 390000,
      qty: 500,
      delivery: '3 days',
      savings: '3-day express',
      tradeoff: 'Priority fulfillment for emergency sourcing requirements.',
      scenarioId: 'scenario-06',
    },
    {
      title: 'BEST UNIT ECONOMICS',
      badge: 'Bulk Discount',
      price: 417270,
      qty: 600,
      delivery: '5 days',
      savings: '₹695.45 / unit',
      tradeoff: 'Unlocks maximum volume discount tier per unit.',
      scenarioId: 'scenario-03',
    },
  ];

  return (
    <div className="max-w-[1040px] mx-auto py-8 px-4 space-y-20 font-sans antialiased text-slate-900">
      
      {/* ================================================== */}
      {/* 1. HERO SECTION */}
      {/* ================================================== */}
      <section className="text-center space-y-6 pt-4 max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
          A2A DealFlow
        </span>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Let your AI negotiate the deal.
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
          Buyer and seller agents negotiate price, quantity, delivery and payment in real time. DealFlow evaluates every proposal against the commercial rules set by both sides and puts the final agreement in human hands.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              onSelectRole('buyer');
            }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 px-6 rounded-xl transition-all shadow-2xs"
          >
            TRY DEALFLOW
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-3 px-6 rounded-xl border border-slate-300 transition-all"
          >
            HOW IT WORKS
          </button>
        </div>

        <p className="text-xs text-slate-500 font-semibold pt-2">
          AI negotiates. Rules protect the economics. Humans approve.
        </p>
      </section>

      {/* ================================================== */}
      {/* 2. INTERACTIVE PRODUCT PREVIEW */}
      {/* ================================================== */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl mx-auto space-y-6 text-xs font-sans">
        <div className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
          Interactive Product Preview
        </div>

        <div className="space-y-4">
          {/* USER STATEMENT */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
            <span className="font-bold text-slate-700 text-[11px] uppercase">USER</span>
            <p className="font-mono text-slate-900 text-sm font-semibold">
              "I need 500 industrial bearings within 6 days under ₹390,000."
            </p>
          </div>

          {/* DEALFLOW RESPONSE */}
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl space-y-1 text-blue-950">
            <span className="font-bold text-blue-700 text-[11px] uppercase">DEALFLOW</span>
            <p className="text-xs font-medium">
              Got it. I'm checking available suppliers and negotiating the best commercial options.
            </p>
          </div>

          <div className="pt-2">
            <span className="font-bold text-slate-900 text-xs block mb-3">I found 4 viable commercial options:</span>

            {/* 4 ACTIONABLE DEAL OPTIONS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interactiveOptions.map((opt, idx) => (
                <div key={idx} className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 space-y-2 flex flex-col justify-between transition-all">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-[11px]">{opt.title}</span>
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">{opt.badge}</span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900">{formatMoney(opt.price)}</div>
                    <p className="text-[11px] text-slate-600">
                      {formatNumber(opt.qty)} units &bull; {opt.delivery} &bull; <strong className="text-emerald-700">{opt.savings}</strong>
                    </p>
                    <p className="text-[10px] text-slate-500 pt-1">{opt.tradeoff}</p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectScenario(opt.scenarioId);
                      onSelectRole('buyer');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] py-2 rounded-lg transition-all mt-2"
                  >
                    Get this deal
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. WHAT DEALFLOW DOES (NEGOTIATE, EVALUATE, APPROVE) */}
      {/* ================================================== */}
      <section id="what-it-does" className="space-y-8 pt-6 border-t border-slate-200">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">WHAT DEALFLOW DOES</span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Commercial negotiation built for speed & safety.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <span className="text-xs font-mono font-bold text-blue-600">01 &bull; NEGOTIATE</span>
            <h3 className="text-base font-bold text-slate-900">AI Agents Negotiate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI buyer and seller agents exchange offers, volume discounts, and delivery SLA concessions in real time.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <span className="text-xs font-mono font-bold text-purple-600">02 &bull; EVALUATE</span>
            <h3 className="text-base font-bold text-slate-900">Decision Engine Evaluates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Decision Engine checks budget, minimum profit margin, delivery timeline, quantity, and authority limits.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-600">03 &bull; APPROVE</span>
            <h3 className="text-base font-bold text-slate-900">Human Approves</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A human reviews the agreement and evidence before execution via Razorpay sandbox payment.
            </p>
          </div>
        </div>

        <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-xs text-slate-800 font-bold text-center">
          AI negotiates. Rules protect the economics. Humans approve.
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. WHY THIS MATTERS */}
      {/* ================================================== */}
      <section className="space-y-6 pt-6 border-t border-slate-200">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            B2B negotiation is slow and trade-offs are difficult.
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            A supplier offering the lowest unit price may have poor delivery SLA, insufficient reliability, unacceptable profit margins, or strict payment constraints. Buyers and sellers optimize fundamentally different commercial variables.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Traditional procurement forces humans to manually resolve these trade-offs through long phone calls and email chains. <strong>A2A DealFlow lets agents negotiate economic trade-offs directly while deterministic rules protect your business.</strong>
          </p>
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. AI VS DECISION ENGINE */}
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
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Understands natural language buyer requests</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Communicates structured offers to suppliers</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Negotiates volume & SLA concessions</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Explains commercial outcomes in plain language</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <span className="font-bold text-purple-600 uppercase tracking-wider">WHAT THE DECISION ENGINE CONTROLS</span>
            <ul className="space-y-2 text-slate-700 font-medium">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /> Authorized Buyer Budget Limit</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /> Minimum Seller Profit Margin Floor</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /> Quantity Tiers & Stock Constraints</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /> Delivery SLA & Payment Terms</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /> Governance & Approval Gates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. HOW IT WORKS (FOUR STEPS) */}
      {/* ================================================== */}
      <section id="how-it-works" className="space-y-8 pt-6 border-t border-slate-200">
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
      </section>

      {/* ================================================== */}
      {/* 7. TRY DEALFLOW (THREE ROLE ENTRY POINTS) */}
      {/* ================================================== */}
      <section id="try-section" className="space-y-8 pt-6 border-t border-slate-200">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Try DealFlow
          </h2>
          <p className="text-xs text-slate-600">Select your perspective to see the negotiation in action.</p>
        </div>

        {/* THREE CHOICES ONLY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* BUYER */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">BUYER</span>
              <h3 className="text-base font-bold text-slate-900">Find the best deal.</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit a sourcing request and select from Pareto candidate offers.
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
              <h3 className="text-base font-bold text-slate-900">Protect your margin.</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review incoming buyer requests and send automated or custom counters.
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
              <h3 className="text-base font-bold text-slate-900">Understand marketplace performance.</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                View network GMV, buyer savings, agreement rates, and decision audit logs.
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
            <span className="font-bold text-slate-900">Demo Scenario Gallery</span>
            <p className="text-slate-500 text-[11px]">Select any of the 10 canonical scenarios to evaluate specific engine rules.</p>
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

      {/* ================================================== */}
      {/* 8. RAZORPAY EXECUTION */}
      {/* ================================================== */}
      <section className="bg-slate-900 text-slate-100 rounded-2xl p-6 text-center space-y-2">
        <h3 className="text-base font-bold">Razorpay Execution Integration</h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Once a human approves the final negotiated agreement, DealFlow creates a Razorpay payment order for instant digital contract settlement.
        </p>
      </section>

      {/* ================================================== */}
      {/* 9. FOOTER */}
      {/* ================================================== */}
      <footer className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200">
        A2A DealFlow &bull; AI Agents Negotiate. Businesses Stay in Control.
      </footer>

    </div>
  );
}
