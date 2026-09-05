import React from 'react';

interface Point {
  x: number;
  y: number;
  label?: string;
}

interface PriceQuantityChartProps {
  currentQty: number;
  currentUnitPrice: number;
  targetBudget?: number;
}

export function PriceQuantityChart({ currentQty, currentUnitPrice }: PriceQuantityChartProps) {
  // Generate sample curve points around currentQty
  const tiers = [
    { qty: 100, price: Math.round(currentUnitPrice * 1.3) },
    { qty: 250, price: Math.round(currentUnitPrice * 1.15) },
    { qty: 500, price: Math.round(currentUnitPrice * 1.0) },
    { qty: 750, price: Math.round(currentUnitPrice * 0.88) },
    { qty: 1000, price: Math.round(currentUnitPrice * 0.80) },
  ];

  const minX = 0;
  const maxX = 1100;
  const minY = Math.round(currentUnitPrice * 0.7);
  const maxY = Math.round(currentUnitPrice * 1.4);

  const width = 360;
  const height = 180;
  const padding = 35;

  const getX = (qty: number) => padding + ((qty - minX) / (maxX - minX)) * (width - 2 * padding);
  const getY = (price: number) => height - padding - ((price - minY) / (maxY - minY)) * (height - 2 * padding);

  const pathPoints = tiers.map((t) => `${getX(t.qty)},${getY(t.price)}`).join(' L ');

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Price vs. Quantity Curve</h4>
        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Volume Tiering</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />

        {/* Price tiers curve */}
        <path d={`M ${pathPoints}`} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

        {/* Tier dots */}
        {tiers.map((t, idx) => (
          <circle
            key={idx}
            cx={getX(t.qty)}
            cy={getY(t.price)}
            r={t.qty === currentQty ? 6 : 3.5}
            className={t.qty === currentQty ? 'fill-blue-600 stroke-2 stroke-white' : 'fill-slate-400'}
          />
        ))}

        {/* Active deal highlight */}
        <circle
          cx={getX(currentQty)}
          cy={getY(currentUnitPrice)}
          r="6"
          fill="#059669"
          stroke="#ffffff"
          strokeWidth="2"
        />

        {/* Labels */}
        <text x={getX(currentQty)} y={getY(currentUnitPrice) - 10} textAnchor="middle" className="text-[10px] font-bold fill-emerald-700">
          ₹{currentUnitPrice}/u ({currentQty} units)
        </text>

        {/* Axis Labels */}
        <text x={width - padding} y={height - 10} textAnchor="end" className="text-[9px] fill-slate-400">Qty →</text>
        <text x={10} y={padding - 5} textAnchor="start" className="text-[9px] fill-slate-400">Unit ₹</text>
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
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Buyer vs. Seller Utility (Pareto)</h4>
        <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
          Pareto Optimal
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />

        {/* Pareto Frontier Arc */}
        <path
          d={`M ${padding},${padding + 10} Q ${width - padding - 20},${padding + 20} ${width - padding},${height - padding - 10}`}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />

        {/* Candidates on Pareto Frontier */}
        {paretoDeals.map((d, i) => (
          <circle
            key={i}
            cx={getX(d.buyerUtility)}
            cy={getY(d.sellerUtility)}
            r="4"
            className="fill-blue-500 hover:fill-blue-700 cursor-pointer"
          />
        ))}

        {/* Current Active Deal */}
        <circle
          cx={getX(buyerUtility)}
          cy={getY(sellerUtility)}
          r="7"
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth="2"
        />

        <text x={getX(buyerUtility)} y={getY(sellerUtility) - 10} textAnchor="middle" className="text-[10px] font-bold fill-emerald-800">
          Current Deal (Ub: {(buyerUtility * 100).toFixed(0)}%, Us: {(sellerUtility * 100).toFixed(0)}%)
        </text>

        <text x={width - padding} y={height - 10} textAnchor="end" className="text-[9px] fill-slate-400">Buyer Utility Ub →</text>
        <text x={10} y={padding - 5} textAnchor="start" className="text-[9px] fill-slate-400">Seller Utility Us ↑</text>
      </svg>
    </div>
  );
}

export function MarginDiscountChart() {
  const width = 360;
  const height = 180;
  const padding = 35;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Gross Margin vs. Concession Discount</h4>
        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Seller Economics</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />

        {/* Min margin floor line (10%) */}
        <line x1={padding} y1={height - padding - 40} x2={width - padding} y2={height - padding - 40} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
        <text x={width - padding - 5} y={height - padding - 45} textAnchor="end" className="text-[9px] font-bold fill-red-600">10% Min Margin Floor</text>

        {/* Target margin line (22%) */}
        <line x1={padding} y1={height - padding - 95} x2={width - padding} y2={height - padding - 95} stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" />
        <text x={width - padding - 5} y={height - padding - 100} textAnchor="end" className="text-[9px] fill-emerald-600">22% Target Margin</text>

        {/* Margin curve */}
        <path d={`M ${padding},${height - padding - 120} L ${width - padding - 40},${height - padding - 45}`} fill="none" stroke="#6366f1" strokeWidth="2.5" />

        <circle cx={padding + 80} cy={height - padding - 90} r="5" fill="#6366f1" />
        <text x={padding + 85} y={height - padding - 95} className="text-[10px] font-medium fill-slate-700">Current Deal (34.6% Margin)</text>
      </svg>
    </div>
  );
}

export function PortfolioFunnelChart() {
  const steps = [
    { label: 'Initiated Deals', count: 124, pct: 100, color: 'bg-blue-600' },
    { label: 'Engine Evaluated', count: 118, pct: 95, color: 'bg-blue-500' },
    { label: 'Feasible Candidates', count: 98, pct: 79, color: 'bg-emerald-500' },
    { label: 'Human Approved', count: 92, pct: 74, color: 'bg-emerald-600' },
    { label: 'Razorpay Executed', count: 88, pct: 71, color: 'bg-indigo-600' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Portfolio Conversion Funnel</h4>
      <div className="space-y-2">
        {steps.map((s, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>{s.label}</span>
              <span className="font-semibold text-slate-900">{s.count} deals ({s.pct}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className={`${s.color} h-2.5 rounded-full`} style={{ width: `${s.pct}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
