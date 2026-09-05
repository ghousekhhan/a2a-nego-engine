import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  Play,
  Pause,
  RotateCcw,
  Lock,
  CreditCard,
  Building2,
  Users,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import type { UserRole } from '../store/canonicalState.ts';
import { CANONICAL_SCENARIOS } from '../data/canonicalScenarios.ts';
import { formatMoney, formatNumber } from '../utils/formatters.ts';

interface RoleSelectionLandingProps {
  onSelectRole: (role: UserRole) => void;
  onSelectScenario: (scenarioId: string) => void;
}

export function RoleSelectionLanding({ onSelectRole, onSelectScenario }: RoleSelectionLandingProps) {
  // Auto-playing negotiation step state (0 to 6)
  const [activeStep, setActiveStep] = useState<number>(6);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 6 ? 0 : prev + 1));
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const decisionOptions = [
    {
      num: '01',
      title: 'BEST OVERALL',
      price: 382500,
      unitPrice: 765,
      qty: 500,
      delivery: '6 days',
      terms: 'Upfront payment',
      summary: 'Optimal balance of price, delivery SLA and supplier reliability.',
      scenarioId: 'scenario-01',
    },
    {
      num: '02',
      title: 'LOWEST TOTAL OUTLAY',
      price: 360000,
      unitPrice: 800,
      qty: 450,
      delivery: '6 days',
      terms: 'Net 30',
      summary: 'Minimizes cash outlay to target budget at a slightly reduced volume.',
      scenarioId: 'scenario-02',
    },
    {
      num: '03',
      title: 'FASTEST DELIVERY',
      price: 390000,
      unitPrice: 780,
      qty: 500,
      delivery: '3 days',
      terms: 'Net 30',
      summary: 'Expedited express shipment for urgent production turnaround.',
      scenarioId: 'scenario-06',
    },
    {
      num: '04',
      title: 'BEST UNIT ECONOMICS',
      price: 417270,
      unitPrice: 695.45,
      qty: 600,
      delivery: '6 days',
      terms: 'Upfront payment',
      summary: 'Unlocks maximum tier volume discount at ₹695.45 per unit.',
      scenarioId: 'scenario-03',
    },
  ];

  return (
    <div className="max-w-[960px] mx-auto py-12 px-4 space-y-28 text-zinc-900">
      
      {/* ================================================== */}
      {/* 01 — HERO */}
      {/* ================================================== */}
      <section className="space-y-6 pt-4 text-left max-w-2xl">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
          A2A DEALFLOW
        </p>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-950 leading-[1.12]">
          Your agent negotiates.<br />
          <span className="text-zinc-500">Their agent responds.</span>
        </h1>

        <p className="text-base text-zinc-600 leading-relaxed font-normal">
          DealFlow lets businesses find suppliers, negotiate commercial terms through AI agents, and approve the deal before payment.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={() => onSelectRole('buyer')}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm px-6 py-3 rounded-lg transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            Start a negotiation <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#demo"
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-sm px-5 py-3 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            See how it works
          </a>
        </div>

        {/* 5-Stage Connected Path: Discover → Search → Negotiate → Decide → Execute */}
        <div className="pt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-medium">
          <span className="text-zinc-900 font-semibold font-mono">01 DISCOVER</span>
          <span className="text-zinc-300">→</span>
          <span className="text-zinc-900 font-semibold font-mono">02 SEARCH</span>
          <span className="text-zinc-300">→</span>
          <span className="text-zinc-900 font-semibold font-mono">03 NEGOTIATE</span>
          <span className="text-zinc-300">→</span>
          <span className="text-zinc-900 font-semibold font-mono">04 DECIDE</span>
          <span className="text-zinc-300">→</span>
          <span className="text-zinc-900 font-semibold font-mono">05 EXECUTE</span>
        </div>
      </section>

      {/* ================================================== */}
      {/* 02 — SHOW IT: LIVE NEGOTIATION TIMELINE */}
      {/* ================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Live Commercial Exchange
            </span>
            <p className="text-xs text-zinc-600 mt-0.5">
              Acme Manufacturing (Buyer) &times; Apex Industrial (Seller)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>{activeStep === 6 ? 'Agreement Reached' : activeStep === 1 ? 'Supplier Discovery' : activeStep === 0 ? 'Requesting...' : `Turn ${activeStep - 1} / 4`}</span>
            </div>

            <div className="flex items-center gap-1 pl-2 border-l border-zinc-200">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 text-zinc-400 hover:text-zinc-800 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setActiveStep(0)}
                className="p-1.5 text-zinc-400 hover:text-zinc-800 transition-colors"
                title="Replay"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Commercial Conversation Flow (Buyer Left, Seller Right, DealFlow Center) */}
        <div className="space-y-5 py-2">
          
          {/* INTENT: Buyer Human Request */}
          <div className="max-w-lg">
            <div className="text-[11px] font-mono text-zinc-400 mb-1">
              HUMAN INTENT &middot; ACME MANUFACTURING
            </div>
            <div className="text-sm font-medium text-zinc-900 pl-3 border-l border-zinc-900 py-0.5">
              "I need 500 industrial bearings delivered within 6 days. Authorized budget is ₹390,000."
            </div>
          </div>

          {/* STEP 1: Supplier Discovery & Catalog Match */}
          {activeStep >= 1 && (
            <div className="max-w-md">
              <div className="text-[11px] font-mono text-zinc-500 mb-1">
                MARKETPLACE SEARCH &middot; BUYER AGENT DISCOVERY
              </div>
              <div className="text-xs text-zinc-800 pl-3 border-l-2 border-zinc-400 py-1.5 bg-zinc-50/70 space-y-1">
                <p className="font-medium text-zinc-900">
                  Scanned marketplace &middot; 3 candidate suppliers identified.
                </p>
                <p className="text-zinc-600">
                  Selected <span className="font-semibold text-zinc-900">Apex Industrial Components</span> (Pune) &middot; 1,200 units in stock &middot; 96.0% SLA rating &middot; 5-day delivery capability. Opening negotiation.
                </p>
              </div>
            </div>
          )}

          {/* TURN 1 (Step 2): Buyer Agent Probes Baseline */}
          {activeStep >= 2 && (
            <div className="max-w-md">
              <div className="text-[11px] font-mono text-zinc-500 mb-1">
                BUYER AGENT &middot; Representing Acme Manufacturing
              </div>
              <div className="text-xs text-zinc-800 pl-3 border-l-2 border-zinc-400 py-1 bg-zinc-50/50">
                "Requesting formal quote for 500 bearings. Requirements: delivery within 6 days, authorized spend under ₹390,000."
              </div>
            </div>
          )}

          {/* TURN 2 (Step 3): Seller Agent Responds */}
          {activeStep >= 3 && (
            <div className="max-w-md ml-auto text-right">
              <div className="text-[11px] font-mono text-zinc-500 mb-1">
                SELLER AGENT &middot; Representing Apex Industrial
              </div>
              <div className="text-xs text-zinc-800 pr-3 border-r-2 border-zinc-900 py-1 bg-zinc-50/50 text-left">
                "We can meet the 6-day timeline. Baseline price for 500 units is ₹405,000 (₹810/unit) on standard Net 30 payment terms."
              </div>
            </div>
          )}

          {/* TURN 3 (Step 4): Buyer Agent Concession Trade-off */}
          {activeStep >= 4 && (
            <div className="max-w-md">
              <div className="text-[11px] font-mono text-zinc-500 mb-1">
                BUYER AGENT &middot; Concession Proposal
              </div>
              <div className="text-xs text-zinc-800 pl-3 border-l-2 border-zinc-400 py-1 bg-zinc-50/50">
                "That exceeds our authorized budget. If the buyer pays 100% upfront on order confirmation, can you reduce the total price?"
              </div>
            </div>
          )}

          {/* TURN 4 (Step 5): Seller Counter with Margin Protection */}
          {activeStep >= 5 && (
            <div className="max-w-md ml-auto text-right">
              <div className="text-[11px] font-mono text-zinc-500 mb-1">
                SELLER AGENT &middot; Economic Counter
              </div>
              <div className="text-xs text-zinc-800 pr-3 border-r-2 border-zinc-900 py-1 bg-zinc-50/50 text-left">
                "With immediate upfront payment, I can reduce the total to ₹382,500 (₹765/unit). Our minimum profit margin floor remains protected."
              </div>
            </div>
          )}

          {/* DEALFLOW POLICY CHECK (Step 6): Centered */}
          {activeStep >= 6 && (
            <div className="py-3 border-y border-zinc-200/80 my-4">
              <div className="max-w-md mx-auto text-center space-y-1.5">
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  DEALFLOW &middot; DETERMINISTIC POLICY VERIFICATION
                </div>
                <div className="text-xs text-zinc-900 font-medium">
                  Policy check complete: Both sides are within commercial parameters.
                </div>
                <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-600 font-mono">
                  <span>✓ Budget (&le; ₹390k)</span>
                  <span>✓ Margin (&ge; 10%)</span>
                  <span>✓ Delivery (&le; 6d)</span>
                  <span>✓ Authority (Level 1)</span>
                </div>
              </div>
            </div>
          )}

          {/* DEAL FOUND (Step 6): Commercial Outcome */}
          {activeStep >= 6 && (
            <div className="pt-2 pl-3 border-l-2 border-emerald-600 space-y-2">
              <div className="text-xs font-mono text-emerald-800 uppercase tracking-wider">
                Deal Found &middot; Ready for Human Approval
              </div>
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="text-2xl font-bold text-zinc-950 font-mono">₹382,500</span>
                <span className="text-xs text-zinc-600 font-mono">₹765 / unit &middot; 500 units &middot; 6 days delivery &middot; Upfront payment</span>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    onSelectScenario('scenario-01');
                    onSelectRole('buyer');
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  Review and Authorize <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ================================================== */}
      {/* 03 — WHY A2A? (CONTRAST & PRIVATE ECONOMICS) */}
      {/* ================================================== */}
      <section className="space-y-8 pt-6 border-t border-zinc-200">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Why Agent-to-Agent?
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Negotiation changes when both sides have an agent.
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            In traditional procurement, human buyers and sellers spend days exchanging emails, bluffing on margins, and guessing trade-offs. DealFlow computes optimal multi-variable agreements in seconds without either party exposing private reservation economics.
          </p>
        </div>

        {/* Side-by-Side Comparison (No heavy containers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-2 text-xs">
          
          {/* Today */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Manual Negotiation Today
            </div>
            <div className="font-mono text-zinc-600 text-[11px] pb-2 border-b border-zinc-200">
              Human &harr; Email &harr; Phone &harr; Spreadsheet &harr; Human
            </div>
            <ul className="space-y-2.5 text-zinc-600">
              <li className="flex items-start gap-2">
                <span className="text-zinc-400">&mdash;</span>
                <span><strong>Days of latency:</strong> Simple adjustments in payment terms or delivery dates require multiple email loops.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-400">&mdash;</span>
                <span><strong>Asymmetric bluffing:</strong> Parties hide true constraints, creating stale stalemates or leaving value on the table.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-400">&mdash;</span>
                <span><strong>Uncalculated concessions:</strong> Trade-offs between payment terms and volume discounts are guessed intuitively.</span>
              </li>
            </ul>
          </div>

          {/* DealFlow */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              With A2A DealFlow
            </div>
            <div className="font-mono text-zinc-900 text-[11px] pb-2 border-b border-zinc-900 font-medium">
              Buyer Agent &harr; Decision Engine &harr; Seller Agent
            </div>
            <ul className="space-y-2.5 text-zinc-800">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0 mt-0.5" />
                <span><strong>Multi-round exploration in seconds:</strong> Agents evaluate volume tiers, payment timing, and delivery SLAs instantly.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0 mt-0.5" />
                <span><strong>Strict private economics:</strong> Buyer budget ceilings and seller cost margins are never revealed to the other side.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0 mt-0.5" />
                <span><strong>Mathematical Pareto efficiency:</strong> DealFlow finds the overlapping zone of agreement that maximizes mutual utility.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Private Economics Visual Architecture */}
        <div className="pt-6 border-t border-zinc-200/80 space-y-4">
          <div className="text-center max-w-md mx-auto space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Private Reservation Boundaries
            </span>
            <p className="text-xs text-zinc-700 font-medium">
              They negotiate without exposing their private economics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs max-w-2xl mx-auto">
            {/* Buyer Agent Private Domain */}
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 font-mono text-[11px]">
                <span className="font-semibold text-zinc-900">BUYER AGENT</span>
                <span className="text-zinc-500">Knows Privately</span>
              </div>
              <ul className="space-y-1.5 text-zinc-700 text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>Budget ceiling & target price</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>Required quantity & volume flex</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>Delivery SLA & site deadlines</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>Commercial preferences & weights</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>Financial delegation authority limit</span>
                </li>
              </ul>
            </div>

            {/* Seller Agent Private Domain */}
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 font-mono text-[11px]">
                <span className="font-semibold text-zinc-900">SELLER AGENT</span>
                <span className="text-zinc-500">Knows Privately</span>
              </div>
              <ul className="space-y-1.5 text-zinc-700 text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>Inventory depth & warehouse stock</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>Unit cost & operating cost structure</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>Production line capacity & expedite cost</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>Acceptable payment credit terms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>10.0% Minimum margin floor (hard stop)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center text-[11px] text-zinc-500 font-mono pt-1">
            Neither party exposes reservation values. DealFlow verifies agreement mathematically.
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 04 — THE DECISION: COMPACT DECISION LIST */}
      {/* ================================================== */}
      <section className="space-y-6 pt-6 border-t border-zinc-200">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Decision Moment
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Clear, actionable deal choices.
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Instead of exposing raw negotiation logs and utility charts, DealFlow surfaces a concise list of actionable commercial packages.
          </p>
        </div>

        {/* Editorial Decision List (No big cards) */}
        <div className="divide-y divide-zinc-200/80 border-y border-zinc-200/80 text-xs">
          {decisionOptions.map((opt) => (
            <div key={opt.num} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-400 text-[11px]">{opt.num}</span>
                  <span className="font-semibold text-zinc-900 text-xs">{opt.title}</span>
                  <span className="text-zinc-400">&middot;</span>
                  <span className="text-zinc-500 font-mono">{opt.delivery}</span>
                  <span className="text-zinc-400">&middot;</span>
                  <span className="text-zinc-500 font-mono">{opt.terms}</span>
                </div>
                <p className="text-zinc-600 text-xs">{opt.summary}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                <div className="text-left sm:text-right font-mono">
                  <div className="font-semibold text-zinc-900 text-sm">{formatMoney(opt.price)}</div>
                  <div className="text-zinc-400 text-[11px]">{formatMoney(opt.unitPrice, true)}/unit &middot; {formatNumber(opt.qty)} units</div>
                </div>

                <button
                  onClick={() => {
                    onSelectScenario(opt.scenarioId);
                    onSelectRole('buyer');
                  }}
                  className="bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-900 font-medium text-xs px-3.5 py-2 rounded-md transition-colors"
                >
                  Select Deal
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 05 — TRUST: AI VS DECISION ENGINE */}
      {/* ================================================== */}
      <section className="space-y-8 pt-6 border-t border-zinc-200">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Control Architecture
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
            AI can negotiate. It should not control the money.
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Language models are creative and fluid; commercial budgets and legal obligations are deterministic and binding. DealFlow cleanly separates negotiation conversation from commercial decision authority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div className="space-y-2">
            <span className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider block">
              WHAT AI HANDLES
            </span>
            <ul className="space-y-2 text-zinc-600 pl-4 border-l border-zinc-200">
              <li>Natural language understanding of buyer requirements</li>
              <li>Agent-to-agent proposal drafting and concession framing</li>
              <li>Exploring volume tiers and delivery schedules</li>
              <li>Translating technical outcomes into human-readable explanations</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider block">
              WHAT THE DECISION ENGINE ENFORCES
            </span>
            <ul className="space-y-2 text-zinc-900 font-medium pl-4 border-l border-zinc-900">
              <li>Hard buyer budget ceiling (never exceeded)</li>
              <li>Seller profit margin floor (&ge; 10.0% protected)</li>
              <li>Supplier delivery feasibility & inventory limits</li>
              <li>Financial delegation of authority gates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 06 — EXECUTION: CONTRACT TO RAZORPAY */}
      {/* ================================================== */}
      <section className="space-y-6 pt-6 border-t border-zinc-200">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Commercial Settlement
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
            From negotiated agreement to digital payment.
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Negotiation is completed when money moves. Once the human user approves the recommended deal, DealFlow binds the terms into a structured digital contract and initiates checkout via Razorpay sandbox.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-600 py-3 border-y border-zinc-200/80">
          <span>Intent</span>
          <span className="text-zinc-300">&rarr;</span>
          <span>Conversation</span>
          <span className="text-zinc-300">&rarr;</span>
          <span>Negotiation</span>
          <span className="text-zinc-300">&rarr;</span>
          <span>Decision</span>
          <span className="text-zinc-300">&rarr;</span>
          <span>Human Approval</span>
          <span className="text-zinc-300">&rarr;</span>
          <span className="font-semibold text-zinc-900">Razorpay Payment</span>
        </div>
      </section>

      {/* ================================================== */}
      {/* 07 — GET STARTED / ROLE ENTRY POINTS */}
      {/* ================================================== */}
      <section className="space-y-8 pt-6 border-t border-zinc-200">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Explore DealFlow
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Select your perspective.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          <div className="space-y-3 p-4 border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors">
            <div className="font-semibold text-zinc-900 text-sm">Buyer Workspace</div>
            <p className="text-zinc-600 leading-relaxed">
              Describe your procurement need in natural language. Watch your agent negotiate and select from Pareto deal options.
            </p>
            <button
              onClick={() => onSelectRole('buyer')}
              className="text-xs font-medium text-zinc-900 hover:text-zinc-600 flex items-center gap-1 pt-1"
            >
              Open Buyer View <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 p-4 border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors">
            <div className="font-semibold text-zinc-900 text-sm">Seller Desk</div>
            <p className="text-zinc-600 leading-relaxed">
              Review incoming buyer requests. Your agent protects your minimum 10% margin floor and proposes automated counters.
            </p>
            <button
              onClick={() => onSelectRole('seller')}
              className="text-xs font-medium text-zinc-900 hover:text-zinc-600 flex items-center gap-1 pt-1"
            >
              Open Seller View <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 p-4 border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors">
            <div className="font-semibold text-zinc-900 text-sm">Network Activity</div>
            <p className="text-zinc-600 leading-relaxed">
              Inspect operational activity, real-time negotiation velocity, agreement rates, and immutable policy audit logs.
            </p>
            <button
              onClick={() => onSelectRole('admin')}
              className="text-xs font-medium text-zinc-900 hover:text-zinc-600 flex items-center gap-1 pt-1"
            >
              Open Activity View <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Demo Benchmark Selector */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs border-t border-zinc-100">
          <div>
            <span className="font-medium text-zinc-900">Canonical Scenario Gallery</span>
            <span className="text-zinc-500 ml-2">10 deterministic test cases covering volume, margin defense, and SLAs.</span>
          </div>

          <select
            onChange={(e) => {
              if (e.target.value) {
                onSelectScenario(e.target.value);
                onSelectRole('buyer');
              }
            }}
            className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium rounded-md px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="">-- Run Scenario Benchmark --</option>
            {CANONICAL_SCENARIOS.map((sc) => (
              <option key={sc.id} value={sc.id}>
                Scenario {sc.scenarioNumber}: {sc.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}
      <footer className="pt-8 border-t border-zinc-200 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>DealFlow &middot; Autonomous Commercial Negotiation</div>
        <div className="font-mono text-[11px]">Built for the Razorpay AI Buildathon</div>
      </footer>

    </div>
  );
}
