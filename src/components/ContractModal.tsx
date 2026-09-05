import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, ArrowRight, Building2, Calendar, CreditCard, Lock } from 'lucide-react';
import type { CanonicalDeal, ScoredDeal } from '../types/index.ts';
import { SEEDED_PRODUCT } from '../demoData.ts';

interface ContractModalProps {
  scoredDeal: ScoredDeal;
  onProceedToPayment: () => void;
  onBack: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  scoredDeal,
  onProceedToPayment,
  onBack,
}) => {
  const deal = scoredDeal.deal;
  const contractId = `CTR-2026-8829`;
  const dealId = deal.id ?? 'DEAL-8829-MRO';
  const timestamp = new Date().toISOString();

  const qty = deal.items[0]?.quantity ?? 500;
  const unitPrice = deal.items[0]?.unitPrice ?? 695.45;
  const lineTotal = Math.round(qty * unitPrice);

  return (
    <div className="max-w-[1000px] mx-auto p-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Commercial Purchase Agreement
            </h2>
            <p className="text-xs text-slate-500">
              Generated automatically from Decision Engine validated commercial terms.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
          TERMS FROZEN & VALIDATED
        </span>
      </div>

      {/* Contract Document Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 font-sans">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
          <div>
            <h1 className="font-bold text-xl text-slate-900 tracking-tight">
              BINDING COMMERCIAL PURCHASE CONTRACT
            </h1>
            <div className="text-xs text-slate-500 mt-1 space-x-4">
              <span>Contract ID: <strong className="text-blue-700 font-mono">{contractId}</strong></span>
              <span>Deal Ref: <strong className="text-slate-800 font-mono">{dealId}</strong></span>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Executed: {new Date(timestamp).toLocaleDateString()}</div>
            <div className="text-emerald-600 font-semibold mt-0.5">Status: READY FOR SETTLEMENT</div>
          </div>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">BUYING ENTITY</span>
            <div className="font-bold text-slate-900 text-sm">Industrial Procurement Corp Ltd</div>
            <div className="text-slate-500">GSTIN: 27AAAAA0000A1Z5</div>
            <div className="text-slate-500">Authorized Agent: Buyer AI Agent v1.0</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">SELLING ENTITY</span>
            <div className="font-bold text-slate-900 text-sm">Apex Industrial Components Ltd</div>
            <div className="text-slate-500">GSTIN: 07BBBBB1111B1Z2</div>
            <div className="text-slate-500">Authorized Agent: Seller AI Agent v1.0</div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Itemized Schedule</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                <tr>
                  <th className="p-3">Product Specification</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Agreed Unit Price</th>
                  <th className="p-3 text-right">Total Line Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="p-3 font-semibold">{SEEDED_PRODUCT.name}</td>
                  <td className="p-3">{qty} units</td>
                  <td className="p-3">₹{unitPrice.toFixed(2)}/unit</td>
                  <td className="p-3 text-right font-bold text-emerald-700">
                    ₹{lineTotal.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms & Conditions Summary */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Delivery SLA</div>
            <div className="font-bold text-slate-900 mt-1">{deal.deliveryDays} Calendar Days</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Payment Terms</div>
            <div className="font-bold text-blue-700 mt-1">{deal.paymentTerms}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Warranty</div>
            <div className="font-bold text-slate-900 mt-1">12 Months Manufacturer Warranty</div>
          </div>
        </div>

        {/* Cryptographic Checksum Banner */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>SHA-256 Checksum: <strong className="text-slate-800">9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a</strong></span>
          </div>
          <span className="text-emerald-700 font-semibold font-sans">Verified by Decision Engine</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300 transition-all"
        >
          Back to Control Room
        </button>
        <button
          onClick={onProceedToPayment}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
        >
          <CreditCard className="w-4 h-4" /> Proceed to Razorpay Checkout <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
