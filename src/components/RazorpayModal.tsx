import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ArrowLeft, Lock, RefreshCw } from 'lucide-react';
import type { ScoredDeal } from '../types/index.ts';
import { formatMoney, formatNumber } from '../utils/formatters.ts';

interface RazorpayModalProps {
  scoredDeal: ScoredDeal;
  onPaymentSuccess: (paymentId: string, orderId: string) => void;
  onBack: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  scoredDeal,
  onPaymentSuccess,
  onBack,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
  const [paymentId, setPaymentId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

  const amountRupees = scoredDeal.totalBuyerCost;
  const amountPaise = amountRupees * 100;
  const qty = scoredDeal.deal.items[0]?.quantity ?? 500;
  const unitPrice = scoredDeal.deal.items[0]?.unitPrice ?? 765;

  const handleRazorpayCheckout = () => {
    setIsProcessing(true);

    const generatedOrderId = `order_a2a_${Math.random().toString(36).substring(2, 9)}`;
    const generatedPaymentId = `pay_a2a_${Math.random().toString(36).substring(2, 10)}`;

    if (typeof window !== 'undefined' && window.Razorpay) {
      const options = {
        key: 'rzp_test_a2a_deal_engine',
        amount: amountPaise,
        currency: 'INR',
        name: 'A2A DealFlow Settlement',
        description: `Payment for Contract #${scoredDeal.deal.id ?? 'DF-1048'} (${qty} units @ ${formatMoney(unitPrice, true)})`,
        order_id: generatedOrderId,
        handler: function (response: any) {
          setIsProcessing(false);
          setPaymentComplete(true);
          setPaymentId(response.razorpay_payment_id || generatedPaymentId);
          setOrderId(response.razorpay_order_id || generatedOrderId);
          onPaymentSuccess(response.razorpay_payment_id || generatedPaymentId, generatedOrderId);
        },
        prefill: {
          name: 'Procurement Manager',
          email: 'procurement@a2adealflow.com',
          contact: '9999999999',
        },
        theme: {
          color: '#18181b',
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
        setIsProcessing(false);
        return;
      } catch (err) {
        console.log('Razorpay fallback triggered');
      }
    }

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
      setPaymentId(generatedPaymentId);
      setOrderId(generatedOrderId);
      onPaymentSuccess(generatedPaymentId, generatedOrderId);
    }, 900);
  };

  return (
    <div className="max-w-[560px] mx-auto space-y-8 text-zinc-900 font-sans antialiased py-6">
      
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Contract
        </button>
      </div>

      {!paymentComplete ? (
        /* Calm, trustworthy payment checkout */
        <div className="space-y-6 pt-2">
          <div className="space-y-1">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              FINAL COMMERCIAL ACTION
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Ready to pay
            </h1>
            <p className="text-xs text-zinc-500">
              Contract #CTR-2026-8829 is validated and ready for digital settlement.
            </p>
          </div>

          {/* Amount and Items */}
          <div className="py-5 border-y border-zinc-200 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-zinc-900">
                {formatNumber(qty)} industrial bearings
              </span>
              <span className="text-2xl font-bold text-zinc-950 font-mono">
                {formatMoney(amountRupees)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-zinc-500 font-mono">
              <span>Unit Rate: {formatMoney(unitPrice, true)} / unit</span>
              <span>Terms: {scoredDeal.deal.paymentTerms.toUpperCase()}</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Payment Gateway</span>
              <span className="font-medium text-zinc-900">Razorpay Sandbox</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Merchant Destination</span>
              <span className="font-medium text-zinc-900">Apex Industrial Components</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Security</span>
              <span className="font-mono text-zinc-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <div className="pt-4">
            <button
              onClick={handleRazorpayCheckout}
              disabled={isProcessing}
              className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium text-sm py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing Payment...
                </>
              ) : (
                `Pay ${formatMoney(amountRupees)}`
              )}
            </button>
            <p className="text-center text-[11px] text-zinc-400 mt-2 font-mono">
              Demo sandbox mode &middot; Test funds only
            </p>
          </div>
        </div>
      ) : (
        /* Payment Complete Receipt */
        <div className="space-y-6 pt-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-emerald-700 uppercase tracking-wider block">
              SETTLEMENT COMPLETED
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Payment Confirmed
            </h1>
            <p className="text-xs text-zinc-600">
              {formatMoney(amountRupees)} successfully transferred to Apex Industrial Components.
            </p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-left font-mono text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Payment ID:</span>
              <span className="font-semibold text-zinc-900">{paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Order ID:</span>
              <span className="font-semibold text-zinc-900">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status:</span>
              <span className="text-emerald-700 font-semibold">PAID & SETTLED</span>
            </div>
          </div>

          <button
            onClick={onBack}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors inline-block"
          >
            Return to Deal Workspace
          </button>
        </div>
      )}

    </div>
  );
};
