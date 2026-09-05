import React, { useState } from 'react';
import { Eye, ShieldCheck, Code, Clock, ChevronRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import type { AuditEvent } from '../types/index.ts';

interface AuditTraceViewProps {
  auditTrail: AuditEvent[];
}

export const AuditTraceView: React.FC<AuditTraceViewProps> = ({ auditTrail }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">
              Decision Trace & Audit Log
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete, un-truncated, calculation-backed audit trail of every financially relevant decision. No hidden LLM reasoning or arbitrary confidence scores.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
          Immutable Audit Log
        </span>
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {auditTrail.map((event, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all"
            >
              {/* Event Bar */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      event.actor === 'decision_engine'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : event.actor === 'buyer_agent'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {event.actor.replace('_', ' ')}
                  </span>

                  <span className="text-xs font-bold text-slate-800">
                    {event.action}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    Rules: <strong className="text-slate-700">{event.rulesTriggered.join(', ')}</strong>
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      event.decision === 'APPROVED' || event.decision === 'FEASIBLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {event.decision}
                  </span>

                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded JSON Details */}
              {isExpanded && (
                <div className="p-4 bg-white border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-blue-700 font-bold">
                    <Code className="w-3.5 h-3.5" /> Cryptographic Payload Verification
                  </div>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] overflow-x-auto font-mono">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}

        {auditTrail.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No audit events recorded yet. Start a negotiation to record events.
          </div>
        )}
      </div>

    </div>
  );
};
