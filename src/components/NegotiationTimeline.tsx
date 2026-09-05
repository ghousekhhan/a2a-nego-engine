import React from 'react';
import { Bot, User, Cpu, ShieldCheck, Zap, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import type { AgentMessage } from '../agents/orchestrator.ts';

interface NegotiationTimelineProps {
  messages: AgentMessage[];
  currentRound: number;
}

export const NegotiationTimeline: React.FC<NegotiationTimelineProps> = ({
  messages,
  currentRound,
}) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* Timeline Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="font-semibold text-sm text-slate-100 uppercase tracking-wider font-mono">
            Live Agent-to-Agent Negotiation Stream
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
          Deterministic Engine Validated
        </span>
      </div>

      {/* Message Feed Container */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const isBuyer = msg.sender === 'buyer_agent';
          const isSeller = msg.sender === 'seller_agent';
          const isEngine = msg.sender === 'decision_engine';

          return (
            <div
              key={index}
              className={`flex items-start gap-3 transition-all duration-300 ${
                isEngine ? 'my-3' : ''
              }`}
            >
              {/* Sender Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                  isUser
                    ? 'bg-slate-700 text-slate-200'
                    : isBuyer
                    ? 'bg-indigo-600/90 text-white border border-indigo-500/30'
                    : isSeller
                    ? 'bg-blue-600/90 text-white border border-blue-500/30'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                }`}
              >
                {isUser && <User className="w-4 h-4" />}
                {isBuyer && <Bot className="w-4 h-4" />}
                {isSeller && <Bot className="w-4 h-4" />}
                {isEngine && <Cpu className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold font-mono ${
                        isUser
                          ? 'text-slate-300'
                          : isBuyer
                          ? 'text-indigo-400'
                          : isSeller
                          ? 'text-blue-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {isUser
                        ? 'USER INTENT'
                        : isBuyer
                        ? 'BUYER AGENT'
                        : isSeller
                        ? 'SELLER AGENT'
                        : 'DECISION ENGINE'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Round {msg.round}
                    </span>
                  </div>
                  {msg.payload?.deal && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      Validated Deal
                    </span>
                  )}
                </div>

                {/* Bubble Container */}
                <div
                  className={`rounded-xl p-3.5 text-xs leading-relaxed ${
                    isEngine
                      ? 'bg-slate-950/90 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                      : isUser
                      ? 'bg-slate-800/80 border border-slate-700 text-slate-200'
                      : isBuyer
                      ? 'bg-indigo-950/40 border border-indigo-800/50 text-indigo-100'
                      : 'bg-blue-950/40 border border-blue-800/50 text-blue-100'
                  }`}
                >
                  <p className="font-sans">{msg.text}</p>

                  {/* Decision Engine Callout Details */}
                  {isEngine && msg.payload && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                        <div className="text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Constraint Status
                        </div>
                        <div className="text-emerald-400 font-bold mt-0.5">6/6 Hard Checks Passed</div>
                      </div>

                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                        <div className="text-slate-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-indigo-400" /> Search Optimization
                        </div>
                        <div className="text-slate-200 font-bold mt-0.5">142 candidates → 6 Pareto</div>
                      </div>
                    </div>
                  )}

                  {/* Structured Deal Offer Details */}
                  {msg.payload?.quantity && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-3 text-[11px] font-mono">
                      <span className="text-slate-300">
                        Qty: <strong className="text-slate-100">{String(msg.payload.quantity)}</strong>
                      </span>
                      <span className="text-slate-300">
                        Price: <strong className="text-emerald-400">₹{Number(msg.payload.unitPrice).toLocaleString()}/unit</strong>
                      </span>
                      <span className="text-slate-300">
                        Delivery: <strong className="text-amber-300">{String(msg.payload.deliveryDays)}d</strong>
                      </span>
                      {msg.payload.paymentTerms && (
                        <span className="text-slate-300">
                          Terms: <strong className="text-indigo-300">{String(msg.payload.paymentTerms)}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-16">
            <Cpu className="w-8 h-8 text-slate-600 animate-pulse" />
            <p className="text-xs">Click "Start Demo" to initialize the live 4-round A2A negotiation.</p>
          </div>
        )}
      </div>

    </div>
  );
};
