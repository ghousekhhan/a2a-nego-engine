import React, { useState } from 'react';
import { X, SlidersHorizontal, Cpu, CheckCircle2 } from 'lucide-react';
import type { BuyerPolicy, CanonicalDeal } from '../types/index.ts';

interface ModifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerPolicy: BuyerPolicy;
  currentDeal: CanonicalDeal;
  onApplyModification: (newQuantity: number, newTargetBudget: number, newDeliveryDays: number, newPaymentTerms: string) => void;
}

export const ModifyModal: React.FC<ModifyModalProps> = ({
  isOpen,
  onClose,
  buyerPolicy,
  currentDeal,
  onApplyModification,
}) => {
  if (!isOpen) return null;

  const [quantity, setQuantity] = useState<number>(currentDeal.items[0]?.quantity ?? 550);
  const [targetBudget, setTargetBudget] = useState<number>(buyerPolicy.targetTotalBudget ?? 360000);
  const [deliveryDays, setDeliveryDays] = useState<number>(currentDeal.deliveryDays ?? 4);
  const [paymentTerms, setPaymentTerms] = useState<string>(currentDeal.paymentTerms ?? 'upfront');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyModification(quantity, targetBudget, deliveryDays, paymentTerms);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden space-y-4">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider font-mono">
              Human Parameter Modification
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex justify-between">
              <span>Required Quantity</span>
              <span className="text-indigo-400 font-bold">{quantity} units</span>
            </label>
            <input
              type="range"
              min="400"
              max="1000"
              step="25"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex justify-between">
              <span>Target Budget (₹)</span>
              <span className="text-emerald-400 font-bold">₹{targetBudget.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="300000"
              max="500000"
              step="10000"
              value={targetBudget}
              onChange={(e) => setTargetBudget(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex justify-between">
              <span>Delivery SLA (Days)</span>
              <span className="text-amber-400 font-bold">{deliveryDays} Days</span>
            </label>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Payment Terms</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
            >
              <option value="upfront">Upfront Payment (100% Cash)</option>
              <option value="15_days">Net 15 Days</option>
              <option value="30_days">Net 30 Days</option>
            </select>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-500/20 text-[11px] text-slate-400 flex items-start gap-2">
            <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Modifications are instantly routed through the Decision Engine. Hard budget ceilings and seller profit floors remain strictly enforced.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <CheckCircle2 className="w-4 h-4" /> Recalculate with Decision Engine
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
