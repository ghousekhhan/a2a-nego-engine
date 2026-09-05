import React from 'react';
import { Header } from './components/Header.tsx';
import { RoleSelectionLanding } from './components/RoleSelectionLanding.tsx';
import { BuyerInterface } from './components/BuyerInterface.tsx';
import { SellerInterface } from './components/SellerInterface.tsx';
import { AdminConsole } from './components/AdminConsole.tsx';
import { WhatIfSimulator } from './components/WhatIfSimulator.tsx';
import { AuditTraceView } from './components/AuditTraceView.tsx';
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100">
      
      {/* Light B2B SaaS Header Bar */}
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
        
        {/* LANDING PAGE ROUTE */}
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

        {/* BUYER WORKSPACE ROUTE */}
        {role === 'buyer' && (
          <>
            {activeTab === 'control_room' && <BuyerInterface state={state} />}
            {activeTab === 'what_if' && (
              <WhatIfSimulator
                baselineDeal={state.currentDeal}
                buyerPolicy={state.buyerPolicy}
                sellerPolicy={state.sellerPolicy}
                supplierFacts={state.supplierFacts}
              />
            )}
            {activeTab === 'contract' && scoredDeal && (
              <ContractModal
                scoredDeal={scoredDeal}
                onProceedToPayment={() => setActiveTab('payment')}
                onBack={() => setActiveTab('control_room')}
              />
            )}
            {activeTab === 'payment' && scoredDeal && (
              <RazorpayModal
                scoredDeal={scoredDeal}
                onPaymentSuccess={(payId, ordId) => {
                  setPaymentDetails(payId, ordId);
                }}
                onBack={() => setActiveTab('contract')}
              />
            )}
            {activeTab === 'audit' && <AuditTraceView auditTrail={state.auditTrail} />}
          </>
        )}

        {/* SELLER COMMAND CENTER ROUTE */}
        {role === 'seller' && (
          <>
            {activeTab === 'control_room' && <SellerInterface state={state} />}
            {activeTab === 'what_if' && (
              <WhatIfSimulator
                baselineDeal={state.currentDeal}
                buyerPolicy={state.buyerPolicy}
                sellerPolicy={state.sellerPolicy}
                supplierFacts={state.supplierFacts}
              />
            )}
            {activeTab === 'contract' && scoredDeal && (
              <ContractModal
                scoredDeal={scoredDeal}
                onProceedToPayment={() => setActiveTab('payment')}
                onBack={() => setActiveTab('control_room')}
              />
            )}
            {activeTab === 'payment' && scoredDeal && (
              <RazorpayModal
                scoredDeal={scoredDeal}
                onPaymentSuccess={(payId, ordId) => {
                  setPaymentDetails(payId, ordId);
                }}
                onBack={() => setActiveTab('contract')}
              />
            )}
            {activeTab === 'audit' && <AuditTraceView auditTrail={state.auditTrail} />}
          </>
        )}

        {/* ENTERPRISE ADMIN CONSOLE ROUTE */}
        {role === 'admin' && <AdminConsole state={state} />}

      </main>
    </div>
  );
}
