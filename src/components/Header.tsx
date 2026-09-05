import React from 'react';
import {
  RotateCcw,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import type { UserRole, ViewTab } from '../store/canonicalState.ts';
import { CANONICAL_SCENARIOS } from '../data/canonicalScenarios.ts';
import { formatMoney } from '../utils/formatters.ts';

interface HeaderProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  status: string;
  round: number;
  maxRounds: number;
  dealValue: number;
  humanApproved: boolean;
  onNewNegotiation: () => void;
  onReset: () => void;
}

export function Header({
  role,
  setRole,
  activeTab,
  setActiveTab,
  activeScenarioId,
  onSelectScenario,
  status,
  round,
  maxRounds,
  dealValue,
  humanApproved,
  onNewNegotiation,
  onReset,
}: HeaderProps) {
  // Map internal status to human-readable commercial state
  const getHumanStatus = () => {
    if (humanApproved) return 'Executed & Paid';
    if (status === 'DEAL_REACHED' || status === 'ACCEPTED') return 'Deal found';
    if (status === 'EVALUATING') return 'Checking policy';
    if (status === 'REJECTED' || status === 'NO_DEAL') return 'No agreement';
    return 'Negotiating';
  };

  const humanStatus = getHumanStatus();

  return (
    <header className="bg-white/95 backdrop-blur-xs border-b border-zinc-200/80 sticky top-0 z-40 text-zinc-900 transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setRole('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
              <span className="leading-none">D</span>
            </div>
            <span className="font-semibold text-zinc-900 text-sm tracking-tight group-hover:text-zinc-600 transition-colors">
              DealFlow
            </span>
          </button>

          {/* Core Navigation: Negotiate · Deals · Activity */}
          <nav className="flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => {
                setRole('buyer');
                setActiveTab('control_room');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                role === 'buyer'
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              Negotiate
            </button>
            <button
              onClick={() => {
                setRole('seller');
                setActiveTab('control_room');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                role === 'seller'
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              Deals
            </button>
            <button
              onClick={() => {
                setRole('admin');
                setActiveTab('control_room');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                role === 'admin'
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              Activity
            </button>
          </nav>
        </div>

        {/* Right Section: Status, Scenario Switcher, or Try CTA */}
        <div className="flex items-center gap-3">
          {role === 'landing' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRole('buyer');
                  setActiveTab('control_room');
                }}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
              >
                Try DealFlow <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Human-readable State Badge */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 font-medium pl-1 pr-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    humanApproved
                      ? 'bg-emerald-600'
                      : status === 'DEAL_REACHED'
                      ? 'bg-emerald-500 animate-pulse'
                      : status === 'NO_DEAL' || status === 'REJECTED'
                      ? 'bg-rose-500'
                      : 'bg-zinc-400'
                  }`}
                />
                <span>{humanStatus}</span>
              </div>

              {/* Minimal Scenario Switcher */}
              <div className="relative flex items-center">
                <select
                  value={activeScenarioId}
                  onChange={(e) => onSelectScenario(e.target.value)}
                  className="appearance-none bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none cursor-pointer"
                >
                  {CANONICAL_SCENARIOS.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.scenarioNumber}. {sc.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 pointer-events-none" />
              </div>

              {/* Quiet Reset Button */}
              <button
                onClick={onReset}
                title="Reset active negotiation"
                className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Contextual Sub-navigation (Inside Deal Flow when relevant) */}
      {role !== 'landing' && (
        <div className="border-t border-zinc-100 bg-[#FAFAFA] px-4 sm:px-6 py-1.5">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('control_room')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'control_room'
                    ? 'text-zinc-900 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Negotiation
              </button>
              <span className="text-zinc-300">/</span>
              <button
                onClick={() => setActiveTab('what_if')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'what_if'
                    ? 'text-zinc-900 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Trade-off Simulator
              </button>
              <span className="text-zinc-300">/</span>
              <button
                onClick={() => setActiveTab('contract')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'contract'
                    ? 'text-zinc-900 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Contract
              </button>
              <span className="text-zinc-300">/</span>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'audit'
                    ? 'text-zinc-900 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Policy Evidence
              </button>
            </div>

            {dealValue > 0 && (
              <div className="text-zinc-500 font-mono text-[11px]">
                Deal Value: <strong className="text-zinc-900 font-semibold">{formatMoney(dealValue)}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
