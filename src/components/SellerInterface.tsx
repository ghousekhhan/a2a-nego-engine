import React, { useState } from 'react';
import {
  Check,
  RotateCcw,
  Sliders,
  X,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ShieldCheck,
  Send,
  Building2,
  Users,
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import {
  MarginDiscountChart,
  InventoryPressureChart,
  DemandCapacityChart,
  RevenueContributionChart,
} from './charts/Visualizations.tsx';
import { formatMoney, formatPercent, formatNumber } from '../utils/formatters.ts';

export function SellerInterface({ state }: { state: CanonicalState }) {
  const { buyerPolicy, sellerPolicy, currentDeal, scoredDeal, dialogueHistory } = state;
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [customCounterPrice, setCustomCounterPrice] = useState<number>(695.45);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sellerInstructionInput, setSellerInstructionInput] = useState<string>('');
  const [sellerNotes, setSellerNotes] = useState<string[]>([]);

  const currentQty = currentDeal?.items?.[0]?.quantity ?? buyerPolicy?.requiredQuantity ?? 500;
  const unitPrice = currentDeal?.items?.[0]?.unitPrice ?? 765;
  const revenue = currentQty * unitPrice;
  const unitCost = 450;
  const sellerFloorUnitPrice = 516; // unit cost + 10% min margin floor
  const profit = (unitPrice - unitCost) * currentQty;
  const marginPct = revenue > 0 ? (profit / revenue) * 100 : 10;

  const quickSellerDirectives = [
    { label: "Hold minimum 10% margin", text: "Do not reduce pricing below our 10% minimum profit margin floor." },
    { label: "Offer 4% discount for upfront cash", text: "Offer 4% off if buyer commits to immediate upfront digital settlement." },
    { label: "Push for volume commitment", text: "Propose 600 units order volume to unlock lower unit pricing." },
  ];

  const handleSellerInstruction = (text: string) => {
    if (!text.trim()) return;
    setSellerNotes((prev) => [...prev, text]);
    setSellerInstructionInput('');

    // Advance round with adjusted terms
    state.nextRound();
  };

  return (
    <div className="max-w-[880px] mx-auto space-y-12 text-zinc-900 font-sans antialiased py-2">
      
      {/* ================================================== */}
      {/* 1. SELLER STATUS & CONVERSATIONAL INBOX */}
      {/* ================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Seller Desk &middot; Apex Industrial Components
          </p>
          <span className="text-xs font-mono text-zinc-500">
            Policy Rule: 10.0% Min Profit Floor
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            Your agent is negotiating.
          </h1>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-xl">
            Active commercial negotiation in progress with <strong>Acme Manufacturing</strong>. Your representative AI agent is defending your profit margin while exploring upfront settlement concessions.
          </p>
        </div>

        {/* Commercial Request Inbound Summary */}
        <div className="pt-2 flex flex-wrap items-baseline gap-6 font-mono text-xs border-b border-zinc-200 pb-4">
          <div>
            <span className="text-zinc-400 block text-[11px]">INCOMING DEMAND</span>
            <span className="font-semibold text-zinc-900">{formatNumber(currentQty)} industrial bearings</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">DELIVERY WINDOW</span>
            <span className="font-semibold text-zinc-900">{buyerPolicy?.requiredDeliveryDays ?? 6} days SLA</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">CURRENT OFFER VALUE</span>
            <span className="font-semibold text-emerald-700">{formatMoney(revenue)}</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">ESTIMATED MARGIN</span>
            <span className="font-semibold text-zinc-900">{formatPercent(marginPct)} (&ge; 10% floor)</span>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. LIVE AGENT NEGOTIATION LOG */}
      {/* ================================================== */}
      <section className="space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 text-xs">
          <span className="font-semibold text-zinc-900">
            Live Commercial Negotiation Exchange
          </span>
          <span className="text-xs font-mono text-zinc-500">
            Round {state.round} of {state.maxRounds}
          </span>
        </div>

        {/* Alignment: Buyer Left, Seller Right, DealFlow Center */}
        <div className="space-y-4 py-1 text-xs">
          
          {/* BUYER AGENT */}
          <div className="max-w-md">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">
              BUYER AGENT &middot; Acme Manufacturing
            </div>
            <div className="text-zinc-800 pl-3 border-l-2 border-zinc-400 py-1.5 bg-zinc-50/70 leading-relaxed">
              "Requesting formal quotation for {formatNumber(currentQty)} industrial bearings. Mandatory parameters: delivery within {buyerPolicy?.requiredDeliveryDays ?? 6} days under authorized budget."
            </div>
          </div>

          {/* SELLER AGENT */}
          <div className="max-w-md ml-auto text-right">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">
              SELLER AGENT &middot; Apex Industrial
            </div>
            <div className="text-zinc-800 pr-3 border-r-2 border-zinc-900 py-1.5 bg-zinc-50/70 text-left leading-relaxed">
              "Stock available (1,200 units). Initial offer is {formatMoney(unitPrice, true)}/unit ({formatMoney(revenue)} total). Upfront payment can unlock an additional financing discount tier."
            </div>
          </div>

          {/* DEALFLOW POLICY CHECK */}
          <div className="py-2.5 border-y border-zinc-200/80 my-2">
            <div className="max-w-md mx-auto text-center space-y-1">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                DEALFLOW &middot; POLICY EVALUATION
              </div>
              <div className="text-zinc-900 font-medium">
                Mutual zone of agreement available: Immediate digital settlement via Razorpay preserves the seller's 10.0% margin floor while remaining within the buyer's spend limit.
              </div>
            </div>
          </div>

          {/* Custom Seller Notes/Instructions */}
          {sellerNotes.map((note, idx) => (
            <div key={idx} className="max-w-md ml-auto text-right">
              <div className="text-[11px] font-mono text-emerald-800 mb-1">
                MERCHANT DIRECTIVE APPLIED
              </div>
              <div className="text-zinc-800 pr-3 border-r-2 border-emerald-600 py-1.5 bg-emerald-50/40 text-left font-medium">
                "{note}"
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ================================================== */}
      {/* 3. SELLER DECISION MOMENT & ACTIONS */}
      {/* ================================================== */}
      <section className="space-y-6 pt-4 border-t border-zinc-200 text-xs">
        <div className="space-y-3">
          <div className="text-xs font-mono text-emerald-800 uppercase tracking-wider">
            Decision Moment &middot; Counterproposal Ready
          </div>

          <div className="border-b border-zinc-200 pb-4 space-y-1">
            <h2 className="text-lg font-semibold text-zinc-950">
              Acme’s agent is asking for:
            </h2>
            <div className="text-sm font-mono text-zinc-900 pt-0.5">
              {formatNumber(currentQty)} units &middot; {formatMoney(revenue)} ({formatMoney(unitPrice, true)}/unit) &middot; {buyerPolicy?.requiredDeliveryDays ?? 6}-day delivery &middot; Upfront payment
            </div>
          </div>

          {/* Agent Recommendation */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-zinc-900">
              Your agent recommends accepting.
            </span>
            <ul className="space-y-1.5 text-zinc-600 pl-3 border-l-2 border-emerald-600">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                <span>Above minimum acceptable economics ({formatPercent(marginPct)} margin &ge; 10.0% floor)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                <span>Inventory available (1,200 SKF 6205 bearings in stock)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                <span>Delivery feasible within {buyerPolicy?.requiredDeliveryDays ?? 6} business days</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                <span>Immediate upfront digital settlement eliminates credit risk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FOUR CONVERSATIONAL SELLER ACTIONS */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => state.approveDeal()}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Accept
          </button>

          <button
            onClick={() => state.nextRound()}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Send Counter
          </button>

          <button
            onClick={() => setShowCounterModal(true)}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" /> Change Terms
          </button>

          <button
            onClick={() => state.rejectDeal()}
            className="text-zinc-500 hover:text-rose-700 font-medium text-xs px-3 py-2.5 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Decline
          </button>
        </div>

        {/* SELLER INSTRUCTION COMPOSER (SECTION 28) */}
        <div className="pt-4 border-t border-zinc-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-800">
              Instruct your agent on commercial boundaries:
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSellerInstruction(sellerInstructionInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={sellerInstructionInput}
              onChange={(e) => setSellerInstructionInput(e.target.value)}
              placeholder="e.g. Don't go below ₹760/unit, or Offer 5% off if they pay upfront"
              className="flex-1 text-xs border border-zinc-300 focus:border-zinc-900 rounded-md px-3 py-2 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-3.5 py-2 rounded-md transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>Instruct</span>
              <Send className="w-3 h-3" />
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-500">
            <span className="font-mono text-zinc-400">Quick directives:</span>
            {quickSellerDirectives.map((d, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSellerInstruction(d.text)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. MERCHANT METRICS & PROGRESSIVE DISCLOSURE */}
      {/* ================================================== */}
      <section className="space-y-4 pt-6 border-t border-zinc-200 text-xs">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-zinc-500" />
            <span>Merchant Economics & Analytics</span>
            {showAnalytics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showAnalytics && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-zinc-200 font-mono text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">REVENUE</span>
                <span className="font-semibold text-zinc-950 mt-0.5 block">{formatMoney(revenue)}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">GROSS MARGIN</span>
                <span className="font-semibold text-emerald-700 mt-0.5 block">{formatPercent(marginPct)}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">INVENTORY BUFFER</span>
                <span className="font-semibold text-zinc-950 mt-0.5 block">1,200 units</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">HISTORIC WIN RATE</span>
                <span className="font-semibold text-zinc-950 mt-0.5 block">92.4%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <MarginDiscountChart />
              <InventoryPressureChart />
              <DemandCapacityChart />
              <RevenueContributionChart />
            </div>
          </div>
        )}
      </section>

      {/* CUSTOM COUNTER MODAL */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 border border-zinc-200 shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-900">Custom Counterproposal</h3>
            <p className="text-xs text-zinc-600">
              Set counter unit price for {currentQty} units. Floor limit: {formatMoney(sellerFloorUnitPrice, true)}.
            </p>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">UNIT PRICE (₹)</label>
              <input
                type="number"
                value={customCounterPrice}
                onChange={(e) => setCustomCounterPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm font-mono focus:outline-none focus:border-zinc-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setShowCounterModal(false)}
                className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCounterModal(false);
                  state.modifyParameters(currentQty, Math.round(customCounterPrice * currentQty), buyerPolicy?.requiredDeliveryDays ?? 6, '30_days');
                }}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md cursor-pointer"
              >
                Submit Counter
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
