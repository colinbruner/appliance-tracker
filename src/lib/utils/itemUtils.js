/** @typedef {'good'|'warning'|'critical'|'overdue'|'active'|'completed'} ItemStatus */

export const STATUS_META = {
  good:      { label: 'Good',         bar: '#5A7C65', cssVar: '--status-good' },
  warning:   { label: 'Due Soon',     bar: '#C4915C', cssVar: '--status-warning' },
  critical:  { label: 'Replace Soon', bar: '#C4735C', cssVar: '--status-critical' },
  overdue:   { label: 'Overdue',      bar: '#B85C5C', cssVar: '--status-overdue' },
  active:    { label: 'In Progress',  bar: '#5A8C84', cssVar: '--status-active' },
  completed: { label: 'Completed',    bar: '#5A7C65', cssVar: '--status-completed' },
};

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

/** Parse a YYYY-MM-DD string as a local date (avoids UTC timezone shift). */
function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Compute lifecycle status for an asset (appliance, structure, system).
 * @param {{ purchaseDate: string, expectedLifespan: number }} item
 */
function getAssetStatus(item) {
  const now = new Date();
  const purchase = parseLocalDate(item.purchaseDate);

  const ageMs = now - purchase;
  const ageYears = ageMs / MS_PER_YEAR;

  const eolDate = new Date(purchase);
  eolDate.setFullYear(eolDate.getFullYear() + Math.floor(item.expectedLifespan));
  const remMonths = Math.round((item.expectedLifespan % 1) * 12);
  eolDate.setMonth(eolDate.getMonth() + remMonths);

  const remainingMs = eolDate - now;
  const remainingYears = remainingMs / MS_PER_YEAR;
  const percentUsed = Math.min((ageYears / item.expectedLifespan) * 100, 100);

  /** @type {ItemStatus} */
  let status;
  if (remainingYears < 0)       status = 'overdue';
  else if (remainingYears < 1)  status = 'critical';
  else if (remainingYears < 3)  status = 'warning';
  else                          status = 'good';

  return { ageYears, eolDate, remainingYears, percentUsed, status };
}

/**
 * Compute lifecycle status for a project.
 * @param {{ purchaseDate: string, completionDate?: string | null }} item
 */
function getProjectStatus(item) {
  const now = new Date();
  const start = parseLocalDate(item.purchaseDate);

  if (item.completionDate) {
    const completion = parseLocalDate(item.completionDate);
    const durationYears = (completion - start) / MS_PER_YEAR;
    return {
      ageYears: durationYears,
      eolDate: completion,
      remainingYears: 0,
      percentUsed: 100,
      status: /** @type {ItemStatus} */ ('completed'),
    };
  }

  const ageYears = (now - start) / MS_PER_YEAR;
  return {
    ageYears,
    eolDate: null,
    remainingYears: null,
    percentUsed: null,
    status: /** @type {ItemStatus} */ ('active'),
  };
}

/**
 * Compute derived status for any item. Delegates to asset or project logic.
 * @param {{ category?: string, purchaseDate: string, expectedLifespan?: number | null, completionDate?: string | null }} item
 */
export function getItemStatus(item) {
  if (item.category === 'projects') {
    return getProjectStatus(item);
  }
  return getAssetStatus(item);
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
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
