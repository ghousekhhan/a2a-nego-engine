import React from 'react';
import { Header } from './components/Header.tsx';
import { RoleSelectionLanding } from './components/RoleSelectionLanding.tsx';
import { BuyerInterface } from './components/BuyerInterface.tsx';
import { SellerInterface } from './components/SellerInterface.tsx';
import { DealFlowWorkspace } from './components/DealFlowWorkspace.tsx';
import { AdminConsole } from './components/AdminConsole.tsx';
import { WhatIfSimulator } from './components/WhatIfSimulator.tsx';
import { DecisionEvidenceView } from './components/DecisionEvidenceView.tsx';
import { ContractModal } from './components/ContractModal.tsx';
import { RazorpayModal } from './components/RazorpayModal.tsx';

import { useCanonicalState } from './store/canonicalState.ts';

export function App() {
  const state = useCanonicalState();

  const {
    role,
    activeTab,
    activeScenario,
    status,
    round,
    maxRounds,
    scoredDeal,
    humanApproved,
    setRole,
    setActiveTab,
    loadScenario,
    startCustomNegotiation,
    onReset,
    setPaymentDetails,
  } = state;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased selection:bg-zinc-200">
      
      {/* Editorial Navigation Header */}
      <Header
        role={role}
        setRole={setRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeScenarioId={activeScenario.id}
        onSelectScenario={loadScenario}
        status={status}
        round={round}
        maxRounds={maxRounds}
        dealValue={scoredDeal?.totalBuyerCost ?? 382500}
        humanApproved={humanApproved}
        onNewNegotiation={() => {
          setRole('buyer');
          setActiveTab('control_room');
        }}
        onReset={() => loadScenario('scenario-01')}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6">
        {/* Landing page route */}
        {role === 'landing' && (
          <RoleSelectionLanding
            onSelectRole={setRole}
            onSelectScenario={(scId) => {
              loadScenario(scId);
              setRole('buyer');
              setActiveTab('control_room');
            }}
          />
        )}

        {/* Contract Document View (Document UI) */}
        {activeTab === 'contract' && (
          <ContractModal
            scoredDeal={
              scoredDeal || {
                deal: currentDeal,
                buyerUtility: 0.94,
                sellerUtility: 0.92,
                jointUtility: 1.86,
                totalBuyerCost: currentDeal.items[0]?.unitPrice * currentDeal.items[0]?.quantity || 382500,
                totalSellerRevenue: currentDeal.items[0]?.unitPrice * currentDeal.items[0]?.quantity || 382500,
                paretoOptimal: true,
                feasible: true,
                sellerMarginPct: 0.41,
                riskScore: 0.05,
                qualityScore: 0.95,
                buyerViolations: [],
                sellerViolations: [],
              }
            }
            onProceedToPayment={() => setActiveTab('payment')}
            onBack={() => setActiveTab('control_room')}
          />
        )}

        {/* Payment Transaction View (Transaction UI) */}
        {activeTab === 'payment' && (
          <RazorpayModal
            scoredDeal={
              scoredDeal || {
                deal: currentDeal,
                buyerUtility: 0.94,
                sellerUtility: 0.92,
                jointUtility: 1.86,
                totalBuyerCost: currentDeal.items[0]?.unitPrice * currentDeal.items[0]?.quantity || 382500,
                totalSellerRevenue: currentDeal.items[0]?.unitPrice * currentDeal.items[0]?.quantity || 382500,
                paretoOptimal: true,
                feasible: true,
                sellerMarginPct: 0.41,
                riskScore: 0.05,
                qualityScore: 0.95,
                buyerViolations: [],
                sellerViolations: [],
              }
            }
            onPaymentSuccess={(payId, ordId) => {
              setPaymentDetails(payId, ordId);
            }}
            onBack={() => setActiveTab('contract')}
          />
        )}

        {/* Unified Hybrid DealFlow Workspace */}
        {activeTab === 'control_room' && (role === 'buyer' || role === 'seller') && (
          <DealFlowWorkspace state={state} />
        )}

        {/* Operational Admin Console */}
        {role === 'admin' && <AdminConsole state={state} />}
      </main>
    </div>
  );
}
