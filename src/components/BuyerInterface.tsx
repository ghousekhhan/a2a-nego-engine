import React, { useState } from 'react';
import {
  Search,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import {
  PriceQuantityChart,
  UtilityScatterChart,
  SupplierComparisonChart,
  NegotiationTrajectoryChart,
} from './charts/Visualizations.tsx';
import { generateDecisionExplanation } from '../engine/explanation.ts';
import { MOCK_SUPPLIERS } from '../data/mockSuppliers.ts';
import { resolveCommercialRequest } from '../data/catalogResolver.ts';
import { formatMoney, formatNumber, formatPercent } from '../utils/formatters.ts';
import { ModifyModal } from './ModifyModal.tsx';

export function BuyerInterface({ state }: { state: CanonicalState }) {
  const [nlInput, setNlInput] = useState('I need 500 bearings within 6 days under ₹390,000.');
  const [selectedSupplierId, setSelectedSupplierId] = useState('supplier-apex-mro');
  const [isModifyOpen, setIsModifyOpen] = useState(false);

  const {
    buyerPolicy,
    currentDeal,
    scoredDeal,
    paretoDeals,
    dialogueHistory,
    round,
    maxRounds,
    status,
    humanApproved,
    startCustomNegotiation,
    nextRound,
    approveDeal,
    rejectDeal,
    modifyParameters,
  } = state;

  const currentQty = currentDeal.items[0]?.quantity ?? buyerPolicy.requiredQuantity;
  const currentUnitPrice = Math.round(currentDeal.items[0]?.unitPrice ?? 750);
  const totalPrice = currentQty * currentUnitPrice;
  const initialOfferPrice = 410000;
  const buyerSavings = Math.max(0, initialOfferPrice - totalPrice);

  // Handle Natural Language Submit
  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlInput.trim()) return;

    const resolved = resolveCommercialRequest(nlInput, selectedSupplierId);
    startCustomNegotiation(
      resolved.catalogItem.name,
      resolved.quantity,
      resolved.targetBudget,
      resolved.maxBudget,
      resolved.deliveryDays,
      resolved.paymentPreference,
      selectedSupplierId
    );
  };

  const rankedOptions = [
    {
      type: '1. Best Balanced',
      badge: 'Recommended',
      total: 382500,
      qty: 550,
      unitPrice: 695.45,
      delivery: 4,
      payment: 'upfront',
      supplier: 'Apex Industrial Components',
      buyerUtility: 0.885,
      sellerUtility: 0.742,
      risk: 'Low',
    },
    {
      type: '2. Best Buyer Outcome',
      badge: 'Lowest Total Cost',
      total: 360000,
      qty: 450,
      unitPrice: 800.0,
      delivery: 5,
      payment: '30_days',
      supplier: 'Apex Industrial Components',
      buyerUtility: 0.812,
      sellerUtility: 0.690,
      risk: 'Low',
    },
    {
      type: '3. Lowest Risk',
      badge: 'Highest Reliability',
      total: 425000,
      qty: 500,
      unitPrice: 850.0,
      delivery: 3,
      payment: '30_days',
      supplier: 'Meridian Bearings',
      buyerUtility: 0.794,
      sellerUtility: 0.780,
      risk: 'Minimal',
    },
  ];

  const buyerInsights = [
    "Increasing order quantity from 500 to 550 units unlocked a lower unit price tier (₹695.45/u) without exceeding the buyer's budget.",
    "Upfront cash payment terms generated +₹12,500 in seller cashflow utility, enabling a 3% cash discount.",
    "Supplier Nova Discount Supplies (₹680/u) was eliminated because its 82% reliability fell below the buyer's hard constraint (85%).",
  ];

  return (
    <div className="max-w-[1140px] mx-auto space-y-6 font-sans antialiased text-slate-900">
      
      {/* 1. PRIMARY NATURAL LANGUAGE REQUEST BOX */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-900">What is your commercial requirement?</label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-semibold">Supplier:</span>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded px-2.5 py-1 focus:outline-none"
            >
              {MOCK_SUPPLIERS.map((s) => (
                <option key={s.supplierId} value={s.supplierId}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleNlSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            placeholder="e.g., I need 500 bearings within 6 days under ₹390,000."
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-medium"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all shrink-0"
          >
            Run Negotiation
          </button>
        </form>

        <div className="text-[11px] text-slate-500 flex flex-wrap gap-4 pt-1">
          <span>Request: <strong className="text-slate-900">{formatNumber(currentQty)} units</strong></span>
          <span>Delivery SLA: <strong className="text-slate-900">≤ {buyerPolicy.requiredDeliveryDays} Days</strong></span>
          <span>Budget Ceiling: <strong className="text-slate-900">{formatMoney(buyerPolicy.maxTotalBudget)}</strong></span>
        </div>
      </div>

      {/* 2. PRIMARY ANSWER: BEST AVAILABLE DEAL */}
      <div className="bg-white border-2 border-emerald-500 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">BEST AVAILABLE DEAL</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-0.5">{formatMoney(totalPrice)}</h2>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800">
            Save {formatMoney(buyerSavings)} vs Initial Offer
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-semibold">Quantity:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{formatNumber(currentQty)} units</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-semibold">Unit Price:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{formatMoney(currentUnitPrice, true)}/u</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-semibold">Delivery SLA:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{buyerPolicy.requiredDeliveryDays} Calendar Days</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-semibold">Payment Terms:</span>
            <p className="font-bold text-blue-700 text-sm mt-0.5">{currentDeal.paymentTerms.toUpperCase()}</p>
          </div>
        </div>

        {/* WHY THIS DEAL WON */}
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg text-xs space-y-1">
          <span className="font-bold text-emerald-900 uppercase text-[10px]">WHY THIS DEAL WON</span>
          <p className="text-slate-800 leading-relaxed font-medium">
            Selected because it stays within your authorized budget limit while improving delivery SLA to 4 days and capturing a cash discount via upfront payment.
          </p>
        </div>
      </div>

      {/* 3. OTHER FEASIBLE OPTIONS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">OTHER FEASIBLE OPTIONS</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rankedOptions.map((opt, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">{opt.type}</span>
                <span className="bg-white border border-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">{opt.badge}</span>
              </div>
              <p className="text-base font-bold text-slate-900">{formatMoney(opt.total)}</p>

              <div className="space-y-1 text-slate-600 border-t border-slate-200 pt-2 text-[11px]">
                <div className="flex justify-between"><span>Quantity:</span><span className="font-semibold text-slate-900">{formatNumber(opt.qty)} units</span></div>
                <div className="flex justify-between"><span>Unit Price:</span><span className="font-semibold text-slate-900">{formatMoney(opt.unitPrice, true)}</span></div>
                <div className="flex justify-between"><span>Delivery:</span><span className="font-semibold text-slate-900">{opt.delivery} days</span></div>
                <div className="flex justify-between"><span>Supplier:</span><span className="font-semibold text-slate-900">{opt.supplier}</span></div>
                <div className="flex justify-between"><span>Buyer Utility:</span><span className="font-bold text-emerald-700">{formatPercent(opt.buyerUtility)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. COMMERCIAL INSIGHTS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">COMMERCIAL INSIGHTS</h3>
        <div className="space-y-2 text-xs">
          {buyerInsights.map((insight, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CHARTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PriceQuantityChart currentQty={currentQty} currentUnitPrice={currentUnitPrice} />
        <UtilityScatterChart
          buyerUtility={scoredDeal?.buyerUtility ?? 0.885}
          sellerUtility={scoredDeal?.sellerUtility ?? 0.742}
          paretoDeals={paretoDeals}
        />
      </div>

      {/* 6. NEGOTIATION LOOP & HUMAN AUTHORIZATION CONTROL */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 text-xs">
            <span className="font-bold text-slate-900">Negotiation Progress</span>
            <span className="text-slate-500 font-semibold">Round {round} / {maxRounds}</span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto text-xs">
            {dialogueHistory.map((msg, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>{msg.sender.replace('_', ' ')}</span>
                  <span>Round {msg.round}</span>
                </div>
                <p className="text-slate-800 leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={nextRound}
            disabled={round >= maxRounds || humanApproved}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-lg transition-all"
          >
            Advance Negotiation Step →
          </button>
        </div>

        {/* HUMAN AUTHORIZATION CARD */}
        <div className="md:col-span-5 bg-white border-2 border-blue-600 rounded-xl p-5 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Human Authorization</h3>
          <p className="text-slate-600">Autonomous spend limit: {formatMoney(buyerPolicy.maxTotalBudget)}</p>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="flex justify-between"><span className="text-slate-500">Agreed Total:</span><span className="font-bold text-slate-900">{formatMoney(totalPrice)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Decision Engine:</span><span className="font-bold text-blue-700">Recommends Approval</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status:</span><span className="font-bold text-emerald-600">{humanApproved ? 'APPROVED' : 'PENDING APPROVAL'}</span></div>
          </div>

          <button
            onClick={approveDeal}
            disabled={humanApproved}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg transition-all"
          >
            Approve Agreement & Execute Payment
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setIsModifyOpen(true)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2 rounded-lg border border-slate-300">
              Modify Parameters
            </button>
            <button onClick={rejectDeal} className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs py-2 rounded-lg border border-red-200">
              Reject Offer
            </button>
          </div>
        </div>
      </div>

      <ModifyModal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        buyerPolicy={buyerPolicy}
        currentDeal={currentDeal}
        onApplyModification={modifyParameters}
      />

    </div>
  );
}
