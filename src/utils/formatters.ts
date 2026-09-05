/**
 * Centralized Money & Number Formatting Utility
 * Prevents floating-point artifacts (e.g. ₹695.4545454545455 -> ₹695.45 or ₹3,90,000)
 */

export function formatMoney(amount: number, includeDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  
  // Format whole numbers cleanly with Indian numbering formatting
  if (!includeDecimals || Number.isInteger(amount)) {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }

  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return val.toLocaleString('en-IN');
}

export function formatPercent(fraction: number, decimals = 1): string {
  if (isNaN(fraction) || fraction === null || fraction === undefined) return '0%';
  const pct = fraction > 1 ? fraction : fraction * 100;
  return `${pct.toFixed(decimals)}%`;
}

export function formatRatio(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0.00';
  return val.toFixed(2);
}
