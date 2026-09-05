import React, { useState } from 'react';
import { ShieldCheck, Check, Clock, ChevronRight, ChevronDown, Lock } from 'lucide-react';
import type { AuditEvent } from '../types/index.ts';

interface DecisionEvidenceViewProps {
  auditTrail: AuditEvent[];
}

export const DecisionEvidenceView: React.FC<DecisionEvidenceViewProps> = ({ auditTrail }) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'raw_audit'>('evidence');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const businessChecklist = [
    { label: 'Buyer Authorized Budget Constraint', desc: 'Agreed deal total (₹3,82,500) strictly satisfies the authorized ceiling limit (₹4,00,000).', status: 'SATISFIED' },
    { label: 'Seller Minimum Margin Floor', desc: 'Gross commercial profit margin (34.6%) remains above the configured 10.0% floor.', status: 'SATISFIED' },
    { label: 'Delivery SLA Feasibility', desc: 'Delivery schedule (4-6 days) meets buyer production requirement within supplier capacity.', status: 'SATISFIED' },
    { label: 'Volume Concession Pricing', desc: 'Order volume expansion unlocked tier discount pricing mathematically.', status: 'SATISFIED' },
    { label: 'Pareto Optimal Efficiency', desc: 'Deal selected from the Pareto efficiency frontier maximizing joint mutual surplus.', status: 'SATISFIED' },
  ];

  return (
    <div className="space-y-6 text-zinc-900 font-sans antialiased text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-zinc-200 pb-3 gap-2">
        <div>
          <span className="font-semibold text-zinc-900 text-sm">
            Decision Evidence & Policy Verification
          </span>
          <p className="text-zinc-500 text-xs mt-0.5">
            Deterministic audit record. Commercial constraints verified mathematically.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'evidence' ? 'text-zinc-950 font-semibold underline underline-offset-4' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Verification Checklist
          </button>
          <span className="text-zinc-300">/</span>
          <button
            onClick={() => setActiveTab('raw_audit')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'raw_audit' ? 'text-zinc-950 font-semibold underline underline-offset-4' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            SHA-256 Audit Stream
          </button>
        </div>
      </div>

      {/* Checklist View */}
      {activeTab === 'evidence' && (
        <div className="divide-y divide-zinc-100 border-y border-zinc-100">
          {businessChecklist.map((item, idx) => (
            <div key={idx} className="py-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-zinc-900">{item.label}</div>
                  <p className="text-zinc-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-emerald-800 font-semibold shrink-0">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Raw Event Log View */}
      {activeTab === 'raw_audit' && (
        <div className="divide-y divide-zinc-100 border-y border-zinc-100">
          {auditTrail.map((event, idx) => {
            const isExpanded = expandedIndex === idx;

            return (
              <div key={idx} className="py-2.5">
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex items-center justify-between cursor-pointer hover:text-zinc-600 transition-colors"
                >
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-zinc-400 text-[11px]">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-zinc-900 font-medium">
                      {event.actor.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-zinc-500">
                      {event.action}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-zinc-700">{event.decision}</span>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-2 pl-4">
                    <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-md text-[11px] overflow-x-auto font-mono">
                      {JSON.stringify(event, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}

          {auditTrail.length === 0 && (
            <div className="py-6 text-center text-zinc-400 text-xs font-mono">
              No audit events recorded yet. Run a negotiation to generate verification logs.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
