import React from 'react';
import { FileText, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import type { ScoredDeal } from '../types/index.ts';
import { SEEDED_PRODUCT } from '../demoData.ts';
import { formatMoney, formatNumber } from '../utils/formatters.ts';

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
  const dealId = deal.id ?? 'DF-1048';
  const timestamp = new Date().toISOString();

  const qty = deal.items[0]?.quantity ?? 500;
  const unitPrice = deal.items[0]?.unitPrice ?? 765;
  const lineTotal = Math.round(qty * unitPrice);

  return (
    <div className="max-w-[760px] mx-auto space-y-8 text-zinc-900 font-sans antialiased py-2">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 text-xs">
        <button
          onClick={onBack}
          className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Negotiation
        </button>

        <span className="font-mono text-zinc-400 text-[11px]">
          Contract #{contractId} &middot; Validated
        </span>
      </div>

      {/* Contract Document (Document Typography) */}
      <div className="bg-white p-8 sm:p-12 border border-zinc-200/80 rounded-lg shadow-2xs space-y-8 text-xs leading-relaxed">
        
        {/* Document Header */}
        <div className="space-y-2 border-b border-zinc-200 pb-6">
          <div className="flex justify-between items-baseline font-mono text-[11px] text-zinc-400">
            <span>BINDING COMMERCIAL PURCHASE AGREEMENT</span>
            <span>Ref: {dealId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
            Commercial Supply & Purchase Contract
          </h1>
          <p className="text-zinc-500 text-xs">
            Executed on {new Date(timestamp).toLocaleDateString()} through the DealFlow Autonomous Commercial Protocol.
          </p>
        </div>

        {/* Contract Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-2 text-xs">
          <div className="space-y-1">
            <span className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider block">BUYER (ACCREDITED)</span>
            <div className="font-semibold text-zinc-900 text-sm">Industrial Procurement Corp Ltd</div>
            <div className="text-zinc-500">GSTIN: 27AAAAA0000A1Z5</div>
            <div className="text-zinc-500 font-mono text-[11px]">Agent: Acme Buyer Agent v1.0</div>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider block">SUPPLIER (VERIFIED)</span>
            <div className="font-semibold text-zinc-900 text-sm">Apex Industrial Components Ltd</div>
            <div className="text-zinc-500">GSTIN: 07BBBBB1111B1Z2</div>
            <div className="text-zinc-500 font-mono text-[11px]">Agent: Apex Seller Agent v1.0</div>
          </div>
        </div>

        {/* Itemized Specification Schedule */}
        <div className="space-y-3 pt-4 border-t border-zinc-100">
          <span className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider block">
            SCHEDULE A &middot; DELIVERABLES & PRICING
          </span>

          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 text-[11px]">
                <th className="pb-2 font-medium">ITEM SPECIFICATION</th>
                <th className="pb-2 font-medium">QTY</th>
                <th className="pb-2 font-medium">UNIT PRICE</th>
                <th className="pb-2 font-medium text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-900">
              <tr>
                <td className="py-3 font-sans font-medium">{SEEDED_PRODUCT.name}</td>
                <td className="py-3">{formatNumber(qty)} units</td>
                <td className="py-3">{formatMoney(unitPrice, true)}</td>
                <td className="py-3 text-right font-semibold">{formatMoney(lineTotal)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 font-semibold text-sm">
                <td colSpan={3} className="pt-3 font-sans">Agreed Commercial Settlement</td>
                <td className="pt-3 text-right font-bold text-zinc-950">{formatMoney(lineTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Commercial Covenants */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-zinc-100 text-xs">
          <div>
            <span className="font-mono text-zinc-400 text-[11px] block">DELIVERY COVENANT</span>
            <p className="font-medium text-zinc-900 mt-1">{deal.deliveryDays} Business Days</p>
            <p className="text-zinc-500 text-[11px] mt-0.5">Expedited fulfillment from central warehouse.</p>
          </div>
          <div>
            <span className="font-mono text-zinc-400 text-[11px] block">PAYMENT TERMS</span>
            <p className="font-medium text-zinc-900 mt-1">{deal.paymentTerms.toUpperCase()}</p>
            <p className="text-zinc-500 text-[11px] mt-0.5">Digital escrow release via Razorpay.</p>
          </div>
          <div>
            <span className="font-mono text-zinc-400 text-[11px] block">WARRANTY & SLA</span>
            <p className="font-medium text-zinc-900 mt-1">12 Months Direct</p>
            <p className="text-zinc-500 text-[11px] mt-0.5">96.0% historical delivery SLA guarantee.</p>
          </div>
        </div>

        {/* Immutable Cryptographic Verification */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between font-mono text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-zinc-500" />
            <span>SHA-256 Digest: 9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a</span>
          </div>
          <span className="text-emerald-700 font-sans font-medium">Policy Engine Verified</span>
        </div>

      </div>

      {/* Primary Action Button */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <button
          onClick={onProceedToPayment}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
        >
          Proceed to Razorpay Checkout <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
