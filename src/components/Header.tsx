import React from 'react';
import {
  Zap,
  Building2,
  Users,
  BarChart3,
  RotateCcw,
  PlusCircle,
  FileText,
  History,
  Layers,
  ArrowLeft,
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
  const scrollToSection = (id: string) => {
    if (role !== 'landing') {
      setRole('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 font-sans antialiased text-slate-900">
      {/* Top Banner Bar */}
      <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setRole('landing')}
            className="cursor-pointer flex items-center gap-2"
          >
            <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">A2A DealFlow</span>
          </div>
        </div>

        {/* Homepage Navigation Links (When on landing page) */}
        {role === 'landing' ? (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button onClick={() => setRole('landing')} className="hover:text-slate-900 transition-colors">
              Product
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-slate-900 transition-colors">
              How it works
            </button>
            <button onClick={() => scrollToSection('try-section')} className="hover:text-slate-900 transition-colors">
              Try it
            </button>
          </nav>
        ) : (
          /* Role Switcher Perspective Bar (When inside product) */
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setRole('landing')}
              className="px-2.5 py-1 rounded text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Overview
            </button>
            <button
              onClick={() => {
                setRole('buyer');
                setActiveTab('control_room');
              }}
              className={`px-3 py-1 rounded transition-all ${
                role === 'buyer' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buyer View
            </button>
            <button
              onClick={() => {
                setRole('seller');
                setActiveTab('control_room');
              }}
              className={`px-3 py-1 rounded transition-all ${
                role === 'seller' ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seller View
            </button>
            <button
              onClick={() => {
                setRole('admin');
                setActiveTab('control_room');
              }}
              className={`px-3 py-1 rounded transition-all ${
                role === 'admin' ? 'bg-white text-purple-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin View
            </button>
          </div>
        )}

        {/* Right CTA / Controls */}
        <div className="flex items-center gap-3">
          {role === 'landing' ? (
            <button
              onClick={() => {
                setRole('buyer');
                setActiveTab('control_room');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all"
            >
              TRY DEALFLOW
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={activeScenarioId}
                onChange={(e) => onSelectScenario(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                {CANONICAL_SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    Demo {sc.scenarioNumber}: {sc.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onReset}
                title="Reset Scenario"
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Sub Navigation Bar inside product views */}
      {role !== 'landing' && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between">
            <nav className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTab('control_room')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'control_room'
                    ? 'bg-white text-slate-900 border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Deal Room
              </button>
              <button
                onClick={() => setActiveTab('what_if')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'what_if'
                    ? 'bg-white text-slate-900 border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                What-If Simulator
              </button>
              <button
                onClick={() => setActiveTab('contract')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'contract'
                    ? 'bg-white text-slate-900 border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Contract & Settlement
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'audit'
                    ? 'bg-white text-slate-900 border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Decision Evidence
              </button>
            </nav>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500">Status: <strong className="text-slate-900 font-bold">{status}</strong></span>
              <span className="text-slate-500">Agreed Total: <strong className="text-slate-900 font-bold">{formatMoney(dealValue)}</strong></span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
