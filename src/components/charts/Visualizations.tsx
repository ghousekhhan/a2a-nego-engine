import React from 'react';
import { formatMoney, formatPercent, formatNumber } from '../../utils/formatters.ts';

// ----------------------------------------------------
// BUYER GRAPHS
// ----------------------------------------------------

export function PriceQuantityChart({ currentQty, currentUnitPrice }: { currentQty: number; currentUnitPrice: number }) {
  const tiers = [
    { qty: 100, price: Math.round(currentUnitPrice * 1.25) },
    { qty: 250, price: Math.round(currentUnitPrice * 1.12) },
    { qty: 500, price: Math.round(currentUnitPrice * 1.0) },
    { qty: 750, price: Math.round(currentUnitPrice * 0.88) },
    { qty: 1000, price: Math.round(currentUnitPrice * 0.80) },
  ];

  const width = 360;
  const height = 180;
  const padding = 35;

  const minX = 0;
  const maxX = 1100;
  const minY = Math.round(currentUnitPrice * 0.7);
  const maxY = Math.round(currentUnitPrice * 1.35);

  const getX = (qty: number) => padding + ((qty - minX) / (maxX - minX)) * (width - 2 * padding);
  const getY = (price: number) => height - padding - ((price - minY) / (maxY - minY)) * (height - 2 * padding);

  const pathPoints = tiers.map((t) => `${getX(t.qty)},${getY(t.price)}`).join(' L ');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Price vs. Quantity Curve</h4>
        <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-semibold">Volume Tiering</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />

        <path d={`M ${pathPoints}`} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

        {tiers.map((t, idx) => (
          <circle
            key={idx}
            cx={getX(t.qty)}
            cy={getY(t.price)}
            r={t.qty === currentQty ? 6 : 3.5}
            className={t.qty === currentQty ? 'fill-emerald-600 stroke-2 stroke-white' : 'fill-slate-400'}
          />
        ))}

        <text x={getX(currentQty)} y={getY(currentUnitPrice) - 10} textAnchor="middle" className="text-[10px] font-bold fill-emerald-800">
          {formatMoney(currentUnitPrice, true)} ({currentQty} u)
        </text>

        <text x={width - padding} y={height - 10} textAnchor="end" className="text-[9px] fill-slate-400 font-medium">Quantity →</text>
        <text x={10} y={padding - 5} textAnchor="start" className="text-[9px] fill-slate-400 font-medium">Unit ₹</text>
      </svg>
    </div>
  );
}

export function UtilityScatterChart({ buyerUtility, sellerUtility, paretoDeals = [] }: { buyerUtility: number; sellerUtility: number; paretoDeals?: any[] }) {
  const width = 360;
  const height = 180;
  const padding = 35;

  const getX = (bu: number) => padding + Math.min(1, Math.max(0, bu)) * (width - 2 * padding);
  const getY = (su: number) => height - padding - Math.min(1, Math.max(0, su)) * (height - 2 * padding);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Buyer vs. Seller Utility (Pareto)</h4>
        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
          Pareto Frontier Highlighted
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />

        <path
          d={`M ${padding},${padding + 10} Q ${width - padding - 20},${padding + 20} ${width - padding},${height - padding - 10}`}
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          strokeDasharray="4,4"
        />

        {paretoDeals.map((d, i) => (
          <circle key={i} cx={getX(d.buyerUtility)} cy={getY(d.sellerUtility)} r="4" className="fill-blue-500" />
        ))}

        <circle cx={getX(buyerUtility)} cy={getY(sellerUtility)} r="7" fill="#059669" stroke="#ffffff" strokeWidth="2" />

        <text x={getX(buyerUtility)} y={getY(sellerUtility) - 10} textAnchor="middle" className="text-[10px] font-bold fill-emerald-800">
          Selected Deal (Ub: {formatPercent(buyerUtility)}, Us: {formatPercent(sellerUtility)})
        </text>

        <text x={width - padding} y={height - 10} textAnchor="end" className="text-[9px] fill-slate-400 font-medium">Buyer Utility Ub →</text>
        <text x={10} y={padding - 5} textAnchor="start" className="text-[9px] fill-slate-400 font-medium">Seller Utility Us ↑</text>
      </svg>
    </div>
  );
}

export function SupplierComparisonChart() {
  const suppliers = [
    { name: 'Apex Industrial', priceScore: 88, deliveryScore: 92, relScore: 96 },
    { name: 'Meridian Bearings', priceScore: 82, deliveryScore: 95, relScore: 98 },
    { name: 'Nova Supplies', priceScore: 96, deliveryScore: 70, relScore: 82 },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Supplier Comparison Matrix</h4>
        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">Price / Delivery / Reliability</span>
      </div>

      <div className="space-y-3 text-xs">
        {suppliers.map((s, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-slate-800 font-semibold text-[11px]">
              <span>{s.name}</span>
              <span className="text-slate-500">Rel: {s.relScore}% | SLA: {s.deliveryScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div className="bg-blue-600 h-2" style={{ width: `${s.priceScore * 0.4}%` }} title="Price Utility" />
              <div className="bg-emerald-500 h-2" style={{ width: `${s.deliveryScore * 0.3}%` }} title="Delivery" />
              <div className="bg-purple-600 h-2" style={{ width: `${s.relScore * 0.3}%` }} title="Reliability" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NegotiationTrajectoryChart() {
  const rounds = [
    { round: 1, score: 72 },
    { round: 2, score: 81 },
    { round: 3, score: 88.5 },
  ];

  const width = 360;
  const height = 180;
  const padding = 35;

  const getX = (r: number) => padding + ((r - 1) / 2) * (width - 2 * padding);
  const getY = (sc: number) => height - padding - ((sc - 60) / 40) * (height - 2 * padding);

  const points = rounds.map((r) => `${getX(r.round)},${getY(r.score)}`).join(' L ');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Negotiation Value Across Rounds</h4>
        <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">Value Improvement</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />

        <path d={`M ${points}`} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

        {rounds.map((r, i) => (
          <circle key={i} cx={getX(r.round)} cy={getY(r.score)} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
        ))}

        <text x={width - padding} y={height - 10} textAnchor="end" className="text-[9px] fill-slate-400 font-medium">Round →</text>
        <text x={10} y={padding - 5} textAnchor="start" className="text-[9px] fill-slate-400 font-medium">Value Score ↑</text>
      </svg>
    </div>
  );
}

// ----------------------------------------------------
// SELLER GRAPHS
// ----------------------------------------------------

export function MarginDiscountChart() {
  const width = 360;
  const height = 180;
  const padding = 35;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Margin vs. Concession Discount</h4>
        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">Seller Floor Economics</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />

        {/* 10% Floor */}
        <line x1={padding} y1={height - padding - 40} x2={width - padding} y2={height - padding - 40} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3,3" />
        <text x={width - padding - 5} y={height - padding - 45} textAnchor="end" className="text-[9px] font-bold fill-red-600">10.0% Min Margin Floor</text>

        {/* 22% Target */}
        <line x1={padding} y1={height - padding - 95} x2={width - padding} y2={height - padding - 95} stroke="#059669" strokeWidth="1" strokeDasharray="3,3" />
        <text x={width - padding - 5} y={height - padding - 100} textAnchor="end" className="text-[9px] font-semibold fill-emerald-600">22.0% Target Margin</text>

        <path d={`M ${padding},${height - padding - 120} L ${width - padding - 40},${height - padding - 45}`} fill="none" stroke="#2563eb" strokeWidth="2.5" />
        <circle cx={padding + 80} cy={height - padding - 90} r="5" fill="#2563eb" />
        <text x={padding + 85} y={height - padding - 95} className="text-[10px] font-bold fill-slate-800">Current Deal (34.6% Margin)</text>
      </svg>
    </div>
  );
}

export function InventoryPressureChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Inventory Stock Pressure</h4>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">High Clearance Rate</span>
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <div className="flex justify-between text-slate-700 font-medium mb-1">
            <span>SKF 6205 Bearing (1,200 Stock)</span>
            <span className="font-bold text-slate-900">45.8% Clearance</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '45.8%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemandCapacityChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Demand vs. Capacity</h4>
        <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">92% Dispatch Capacity</span>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-700">
          <span>Weekly Demand:</span>
          <span className="font-bold text-slate-900">2,400 units</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>Fulfilled by Engine:</span>
          <span className="font-bold text-emerald-600">2,208 units (92%)</span>
        </div>
      </div>
    </div>
  );
}

export function RevenueContributionChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Negotiated Contribution</h4>
        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Gross Contribution</span>
      </div>
      <div className="text-lg font-black text-slate-900">{formatMoney(135000)}</div>
      <p className="text-[11px] text-emerald-600 font-semibold">+₹25,000 Volume Concession Surplus</p>
    </div>
  );
}

// ----------------------------------------------------
// ADMIN / MARKETPLACE INTELLIGENCE GRAPHS
// ----------------------------------------------------

export function PortfolioFunnelChart() {
  const steps = [
    { label: 'Initiated Deals', count: 124, pct: 100, color: 'bg-blue-600' },
    { label: 'Engine Evaluated', count: 118, pct: 95, color: 'bg-blue-500' },
    { label: 'Feasible Candidates', count: 98, pct: 79, color: 'bg-emerald-500' },
    { label: 'Human Approved', count: 92, pct: 74, color: 'bg-emerald-600' },
    { label: 'Razorpay Executed', count: 88, pct: 71, color: 'bg-purple-600' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Marketplace Conversion Funnel</h4>
      <div className="space-y-2.5">
        {steps.map((s, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-800">
              <span>{s.label}</span>
              <span className="font-extrabold text-slate-900">{formatNumber(s.count)} deals ({s.pct}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className={`${s.color} h-2.5 rounded-full`} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GmvOverTimeChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">GMV Negotiated Over Time</h4>
      <div className="text-2xl font-black text-slate-900">{formatMoney(18450000)}</div>
      <p className="text-xs text-emerald-600 font-semibold">+18.2% Monthly Growth</p>
    </div>
  );
}

export function SavingsOverTimeChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Buyer Savings Over Time</h4>
      <div className="text-2xl font-black text-emerald-600">{formatMoney(742500)}</div>
      <p className="text-xs text-slate-500 font-medium">Average 4.02% price compression</p>
    </div>
  );
}

export function DealOutcomeChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Deal Outcome Distribution</h4>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Approved</span>
          <p className="font-extrabold text-emerald-700">74.2%</p>
        </div>
        <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Human Review</span>
          <p className="font-extrabold text-purple-700">17.4%</p>
        </div>
        <div className="bg-red-50 p-2 rounded-lg border border-red-200">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">No-Deal</span>
          <p className="font-extrabold text-red-700">8.4%</p>
        </div>
      </div>
    </div>
  );
}

export function SupplierPerformanceChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Supplier Performance Index</h4>
      <div className="text-xs text-slate-700 space-y-1.5">
        <div className="flex justify-between">
          <span>Average SLA Reliability:</span>
          <span className="font-bold text-emerald-600">95.4%</span>
        </div>
        <div className="flex justify-between">
          <span>Average Margin Retention:</span>
          <span className="font-bold text-blue-600">24.2%</span>
        </div>
      </div>
    </div>
  );
}

export function EnginePerformanceChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Decision Engine Performance Metrics</h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-[10px]">Constraint Block Rate:</span>
          <p className="font-bold text-slate-900">8.4%</p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-[10px]">Agreement Rate:</span>
          <p className="font-bold text-emerald-600">74.2%</p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-[10px]">Average Rounds:</span>
          <p className="font-bold text-blue-600">2.4 Rounds</p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-[10px]">Pareto Improvement:</span>
          <p className="font-bold text-purple-600">+14.2%</p>
        </div>
      </div>
    </div>
  );
}
