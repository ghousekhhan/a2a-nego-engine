import React from 'react';
import {
  ShieldCheck,
  Zap,
  Building2,
  Users,
  Play,
  RotateCcw,
  PlusCircle,
  BarChart3,
  FileText,
  CreditCard,
  History,
  Layers,
  ChevronDown,
} from 'lucide-react';
import type { UserRole, ViewTab } from '../store/canonicalState.ts';
import { CANONICAL_SCENARIOS } from '../data/canonicalScenarios.ts';

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
  const getStatusBadge = () => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-300"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Human Approved</span>;
      case 'FEASIBLE':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-300"><Zap className="w-3.5 h-3.5 text-blue-600" /> Feasible Deal</span>;
      case 'NO_DEAL':
        return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-red-300">No-Deal Certificate</span>;
      case 'NEEDS_INFORMATION':
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-300">Needs Information</span>;
      case 'HUMAN_REVIEW':
        return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-purple-300">Governance Review</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-300">{status}</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      {/* Top Banner Bar */}
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold flex items-center justify-center shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-base tracking-tight">A2A Deal Engine</h1>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
                v2.0 Fintech Core
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Autonomous Commercial Negotiation & Settlement Platform</p>
          </div>
        </div>

        {/* Persona Role Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setRole('landing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              role === 'landing' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Landing Overview
          </button>
          <button
            onClick={() => setRole('buyer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
              role === 'buyer' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Buyer Workspace
          </button>
          <button
            onClick={() => setRole('seller')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
              role === 'seller' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Seller Command
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
              role === 'admin' ? 'bg-white text-purple-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Enterprise Admin
          </button>
        </div>

        {/* 10 Canonical Demo Scenario Selector & Quick Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Scenario:
            </span>
            <select
              value={activeScenarioId}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium rounded-lg px-3 py-1.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {CANONICAL_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  Scenario {sc.scenarioNumber}: {sc.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onNewNegotiation}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" /> New Deal
          </button>

          <button
            onClick={onReset}
            title="Reset Scenario"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Sub Navigation Tabs (When inside a workspace role) */}
      {role !== 'landing' && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between">
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('control_room')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  activeTab === 'control_room'
                    ? 'bg-white text-blue-700 border border-slate-200 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Control Room
              </button>
              <button
                onClick={() => setActiveTab('what_if')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  activeTab === 'what_if'
                    ? 'bg-white text-blue-700 border border-slate-200 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> What-If Simulator
              </button>
              <button
                onClick={() => setActiveTab('contract')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  activeTab === 'contract'
                    ? 'bg-white text-blue-700 border border-slate-200 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Contract & Settlement
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  activeTab === 'audit'
                    ? 'bg-white text-blue-700 border border-slate-200 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Decision Engine Audit
              </button>
            </nav>

            {/* Current Deal Summary KPIs */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Status:</span>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="text-slate-400 font-medium">Round:</span>
                <span className="font-semibold text-slate-900">{round}/{maxRounds}</span>
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                <span className="text-slate-500 font-medium">Current Value:</span>
                <span className="font-bold text-slate-900">₹{dealValue.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
