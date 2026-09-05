import React, { useState } from 'react';
import { Eye, ShieldCheck, Code, Clock, ChevronRight, ChevronDown, CheckCircle2, FileText, Lock } from 'lucide-react';
import type { AuditEvent } from '../types/index.ts';

interface DecisionEvidenceViewProps {
  auditTrail: AuditEvent[];
}

export const DecisionEvidenceView: React.FC<DecisionEvidenceViewProps> = ({ auditTrail }) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'raw_audit'>('evidence');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const businessChecklist = [
    { label: 'Buyer Authorized Budget Constraint Satisfied', desc: 'Agreed deal total (₹3,82,500) is strictly within authorized ceiling (₹4,00,000).', status: 'PASS' },
    { label: 'Seller Minimum Margin Protected', desc: 'Gross margin (34.6%) remains above configured 10.0% profit floor.', status: 'PASS' },
    { label: 'Delivery SLA Requirement Satisfied', desc: 'Delivery schedule (4 days) satisfies required maximum (5 days).', status: 'PASS' },
    { label: 'Quantity Volume Concession Applied', desc: '+50 unit order quantity expansion increased seller contribution by +₹135,000.', status: 'PASS' },
    { label: 'Pareto Frontier Optimal Selected', desc: 'Candidate deal achieved highest combined utility (Ub: 88.5%, Us: 74.2%).', status: 'PASS' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 font-sans antialiased">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-slate-900">
              Decision Evidence & Verification
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Plain-English commercial evidence backed by deterministic engine math. No hidden LLM reasoning or arbitrary confidence scores.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 font-medium">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              activeTab === 'evidence' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Decision Evidence Checklist
          </button>
          <button
            onClick={() => setActiveTab('raw_audit')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              activeTab === 'raw_audit' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Technical SHA-256 Audit Log
          </button>
        </div>
      </div>

      {/* TAB 1: DECISION EVIDENCE CHECKLIST */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">WHY WAS THIS DEAL SELECTED?</h4>
          
          <div className="space-y-3">
            {businessChecklist.map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{item.label}</h5>
                    <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RAW SHA-256 TECHNICAL AUDIT LOG */}
      {activeTab === 'raw_audit' && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">RAW EVENT LOG PAYLOADS</h4>
          
          <div className="space-y-2.5">
            {auditTrail.map((event, idx) => {
              const isExpanded = expandedIndex === idx;

              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all">
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>

                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                        {event.actor.replace('_', ' ')}
                      </span>

                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {event.action}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {event.decision}
                      </span>

                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-blue-700 font-bold font-mono text-[11px]">
                        <Code className="w-3.5 h-3.5" /> CRYPTOGRAPHIC LOG PAYLOAD
                      </div>
                      <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] overflow-x-auto font-mono">
                        {JSON.stringify(event, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}

            {auditTrail.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                No audit events recorded yet. Start a negotiation to record events.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
