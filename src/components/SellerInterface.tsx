import React from 'react';
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Package,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  DollarSign,
} from 'lucide-react';
import type { CanonicalState } from '../store/canonicalState.ts';
import { MarginDiscountChart } from './charts/Visualizations.tsx';

export function SellerInterface({ state }: { state: CanonicalState }) {
  const { sellerPolicy, currentDeal, scoredDeal } = state;

  const currentQty = currentDeal.items[0]?.quantity ?? 500;
  const unitPrice = Math.round(currentDeal.items[0]?.unitPrice ?? 750);
  const revenue = currentQty * unitPrice;
  const unitCost = 450;
  const profit = (unitPrice - unitCost) * currentQty;
  const marginPct = ((profit / revenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Merchant Command Center</span>
            <h2 className="text-lg font-bold text-slate-900">Apex Industrial Components — Deal Engine Desk</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Inventory Status:</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-300">
            High Stock (1,200 units available)
          </span>
        </div>
      </div>

      {/* Seller KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Gross Deal Revenue</span>
          <p className="text-xl font-bold text-slate-900 mt-0.5">₹{revenue.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> +12.4% vs Base Pricing
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Unit Gross Margin %</span>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">{marginPct}%</p>
          <span className="text-[10px] text-slate-400">Min Floor: 10.0% | Target: 22.0%</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Gross Profit Contribution</span>
          <p className="text-xl font-bold text-slate-900 mt-0.5">₹{profit.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Unit Profit: ₹{unitPrice - unitCost}/u</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Inventory Clearance</span>
          <p className="text-xl font-bold text-blue-600 mt-0.5">
            {((currentQty / 1200) * 100).toFixed(0)}%
          </p>
          <span className="text-[10px] text-slate-400">{currentQty} of 1,200 units committed</span>
        </div>
      </div>

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: DEMAND INBOX & CONCESSION MATRIX (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Demand Inbox */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Demand Inbox & RFQs</h3>
                <p className="text-xs text-slate-500">Active agent-to-agent procurement requests</p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                1 Active RFQ
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">REQ-2026-8841</span>
                  <h4 className="text-xs font-bold text-slate-900">SKF 6205-2RS1 Deep Groove Ball Bearing</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Quantity: {currentQty} units | Delivery: 5 days</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  MARGIN FEASIBLE
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400">Buyer Target:</span>
                  <p className="font-semibold text-slate-800">₹{(state.buyerPolicy.targetTotalBudget || 360000).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-400">Offered Unit Price:</span>
                  <p className="font-semibold text-slate-800">₹{unitPrice}</p>
                </div>
                <div>
                  <span className="text-slate-400">Payment Terms:</span>
                  <p className="font-semibold text-slate-800">{currentDeal.paymentTerms}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Give/Get Concession Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Give/Get Concession Trade-Off Engine</h3>
                <p className="text-xs text-slate-500">Deterministic value exchange visualizer</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                +₹25,000 Net Seller Surplus
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* WHAT SELLER GIVES */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">What Seller Gives</span>
                <ul className="text-xs space-y-1.5 text-amber-950 font-medium">
                  <li className="flex items-center justify-between">
                    <span>• Unit Price Discount:</span>
                    <span className="font-bold">-₹124.55/unit</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>• Expedited Dispatch:</span>
                    <span className="font-bold">4 days (-1 day)</span>
                  </li>
                </ul>
              </div>

              {/* WHAT SELLER GETS */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">What Seller Gets</span>
                <ul className="text-xs space-y-1.5 text-emerald-950 font-medium">
                  <li className="flex items-center justify-between">
                    <span>• Order Volume Concession:</span>
                    <span className="font-bold">+50 units</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>• Immediate Cashflow:</span>
                    <span className="font-bold">Upfront Payment</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MARGIN VS DISCOUNT GRAPH (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <MarginDiscountChart />

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automated Margin Guardrails</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Hard Minimum Floor Margin:</span>
                <span className="font-bold text-red-600">10.0% (₹516/unit)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Target Profit Margin:</span>
                <span className="font-bold text-emerald-600">22.0% (₹577/unit)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Current Deal Margin:</span>
                <span className="font-bold text-blue-600">{marginPct}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
