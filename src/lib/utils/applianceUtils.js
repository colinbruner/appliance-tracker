/** @typedef {'good'|'warning'|'critical'|'overdue'} ApplianceStatus */

export const STATUS_META = {
  good:     { label: 'Good',         bg: '#dcfce7', border: '#22c55e', text: '#15803d', bar: '#22c55e' },
  warning:  { label: 'Due Soon',     bg: '#fef9c3', border: '#eab308', text: '#a16207', bar: '#eab308' },
  critical: { label: 'Replace Soon', bg: '#ffedd5', border: '#f97316', text: '#c2410c', bar: '#f97316' },
  overdue:  { label: 'Overdue',      bg: '#fee2e2', border: '#ef4444', text: '#b91c1c', bar: '#ef4444' },
};

/**
 * Compute derived status info for an appliance.
 * @param {{ purchaseDate: string, expectedLifespan: number }} appliance
 */
export function getApplianceStatus(appliance) {
  const now = new Date();
  const purchase = new Date(appliance.purchaseDate);

  const ageMs = now - purchase;
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);

  const eolDate = new Date(purchase);
  eolDate.setFullYear(eolDate.getFullYear() + Math.floor(appliance.expectedLifespan));
  const remMonths = Math.round((appliance.expectedLifespan % 1) * 12);
  eolDate.setMonth(eolDate.getMonth() + remMonths);

  const remainingMs = eolDate - now;
  const remainingYears = remainingMs / (1000 * 60 * 60 * 24 * 365.25);
  const percentUsed = Math.min((ageYears / appliance.expectedLifespan) * 100, 100);

  /** @type {ApplianceStatus} */
  let status;
  if (remainingYears < 0)  status = 'overdue';
  else if (remainingYears < 1)  status = 'critical';
  else if (remainingYears < 3)  status = 'warning';
  else                          status = 'good';

  return { ageYears, eolDate, remainingYears, percentUsed, status };
}

/**
 * Format a years value as a readable string.
 * @param {number} years
 */
export function formatYearsRemaining(years) {
  if (years < 0) {
    const abs = Math.abs(years);
    return abs < 1
      ? `${Math.round(abs * 12)} mo overdue`
      : `${abs.toFixed(1)} yrs overdue`;
  }
  if (years < 1) return `${Math.round(years * 12)} mo remaining`;
  return `${years.toFixed(1)} yrs remaining`;
}

/**
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}
