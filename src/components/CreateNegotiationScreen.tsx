import React, { useState } from 'react';
import { Cpu, Play, Sparkles, ShieldCheck, ArrowRight, Package, DollarSign, Clock, CreditCard, Lock } from 'lucide-react';
import type { BuyerPolicy } from '../types/index.ts';
import { SEEDED_PRODUCT } from '../demoData.ts';

interface CreateNegotiationScreenProps {
  onStartNegotiation: (
    productName: string,
    quantity: number,
    targetBudget: number,
    maxBudget: number,
    deliveryDays: number,
    paymentPreference: string
  ) => void;
  onLoadDemo: () => void;
}

export const CreateNegotiationScreen: React.FC<CreateNegotiationScreenProps> = ({
  onStartNegotiation,
  onLoadDemo,
}) => {
  const [productName, setProductName] = useState<string>(SEEDED_PRODUCT.name);
  const [quantity, setQuantity] = useState<number>(500);
  const [targetBudget, setTargetBudget] = useState<number>(360000);
  const [maxBudget, setMaxBudget] = useState<number>(400000);
  const [deliveryDays, setDeliveryDays] = useState<number>(5);
  const [paymentPreference, setPaymentPreference] = useState<string>('30_days');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartNegotiation(
      productName,
      quantity,
      targetBudget,
      maxBudget,
      deliveryDays,
      paymentPreference
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8 py-10 font-sans">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-semibold">
          <Cpu className="w-3.5 h-3.5" /> Agent-to-Agent Commercial Decision Backend
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100 font-mono">
          Create Commercial Negotiation
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Define your procurement parameters. AI agents communicate, the deterministic Decision Engine evaluates deal space trade-offs, and human authority approves the contract before Razorpay payment.
        </p>
      </div>

      {/* Main Grid: Form + Demo Launch Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Container (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <h2 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-400" /> Buyer Procurement Intent
            </h2>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
              HUMAN AUTHORIZED
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono">
            
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex justify-between">
                <span>Product Name / Specification</span>
                <span className="text-slate-500 font-normal">Industrial Component</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Quantity & Delivery Days Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-blue-400" /> Required Quantity
                  </span>
                  <span className="text-indigo-400 font-bold">{quantity} units</span>
                </label>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 500)}
                  required
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Required Delivery SLA
                  </span>
                  <span className="text-amber-400 font-bold">≤ {deliveryDays} Days</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(parseInt(e.target.value, 10) || 5)}
                  required
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Budgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Target Budget (₹)
                  </span>
                  <span className="text-emerald-400 font-bold">₹{targetBudget.toLocaleString()}</span>
                </label>
                <input
                  type="number"
                  min="50000"
                  max="2000000"
                  step="5000"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(parseInt(e.target.value, 10) || 360000)}
                  required
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1 text-rose-300">
                    <Lock className="w-3.5 h-3.5 text-rose-400" /> Max Authorized Budget Ceiling
                  </span>
                  <span className="text-rose-400 font-bold">₹{maxBudget.toLocaleString()}</span>
                </label>
                <input
                  type="number"
                  min={targetBudget}
                  max="3000000"
                  step="5000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(parseInt(e.target.value, 10) || 400000)}
                  required
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Payment Preference */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Payment Preference
              </label>
              <select
                value={paymentPreference}
                onChange={(e) => setPaymentPreference(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none transition-colors"
              >
                <option value="30_days">Net 30 Days (Standard Commercial Credit)</option>
                <option value="upfront">Upfront Cash Payment (100% Advance for Financing Discount)</option>
                <option value="15_days">Net 15 Days</option>
              </select>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onLoadDemo}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" /> Load Seeded Demo Scenario
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> Start Negotiation <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>

        {/* Demo Box & Principles (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 font-mono">
          
          <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 rounded-2xl p-5 border border-indigo-500/30 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase">
              <Sparkles className="w-4 h-4" /> Recommended Demo Launch
            </div>
            <h3 className="font-bold text-sm text-slate-100">Seeded 4-Round MRO Negotiation</h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Demonstrates Round 1 initial counter $\rightarrow$ Round 2 quantity concession $\rightarrow$ Round 3 upfront payment trade $\rightarrow$ Round 4 Human Approval.
            </p>
            <button
              onClick={onLoadDemo}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Load Demo Scenario (Recommended)
            </button>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Core System Guarantees
            </div>
            <ul className="space-y-2 text-slate-400 font-sans">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono">✓</span>
                <span>Agents communicate; deterministic engine decides.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono">✓</span>
                <span>Buyer max budget (₹4.0L) & Seller unit cost (₹450) stay private.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono">✓</span>
                <span>Human retains final authority (Approve / Modify / Reject).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono">✓</span>
                <span>Razorpay executes payment only after contract approval.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
