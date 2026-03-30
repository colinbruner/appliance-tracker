import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getApplianceStatus,
  formatYearsRemaining,
  formatCurrency,
  formatDate,
  STATUS_META,
} from './applianceUtils.js';

// Fix "now" to a known date so status thresholds are deterministic
const NOW = new Date('2026-03-30T00:00:00Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// STATUS_META
// ---------------------------------------------------------------------------
describe('STATUS_META', () => {
  it('has entries for all four statuses', () => {
    expect(STATUS_META).toHaveProperty('good');
    expect(STATUS_META).toHaveProperty('warning');
    expect(STATUS_META).toHaveProperty('critical');
    expect(STATUS_META).toHaveProperty('overdue');
  });

  it('each entry has a label and a bar color', () => {
    for (const key of ['good', 'warning', 'critical', 'overdue']) {
      expect(typeof STATUS_META[key].label).toBe('string');
      expect(STATUS_META[key].label.length).toBeGreaterThan(0);
      expect(STATUS_META[key].bar).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

// ---------------------------------------------------------------------------
// getApplianceStatus
// ---------------------------------------------------------------------------
describe('getApplianceStatus', () => {
  it('returns "good" when more than 3 years remain', () => {
    // Purchased 2 years ago, lifespan 10 → ~8 years left
    const { status, remainingYears, ageYears, percentUsed } = getApplianceStatus({
      purchaseDate: '2024-03-30',
      expectedLifespan: 10,
    });
    expect(status).toBe('good');
    expect(remainingYears).toBeGreaterThan(3);
    expect(ageYears).toBeCloseTo(2, 0);
    expect(percentUsed).toBeCloseTo(20, 0);
  });

  it('returns "warning" when between 1 and 3 years remain', () => {
    // Purchased 8 years ago, lifespan 10 → ~2 years left
    const { status } = getApplianceStatus({
      purchaseDate: '2018-03-30',
      expectedLifespan: 10,
    });
    expect(status).toBe('warning');
  });

  it('returns "critical" when less than 1 year remains', () => {
    // Purchased 9.5 years ago, lifespan 10 → ~0.5 years left
    const { status } = getApplianceStatus({
      purchaseDate: '2016-09-30',
      expectedLifespan: 10,
    });
    expect(status).toBe('critical');
  });

  it('returns "overdue" when past expected lifespan', () => {
    // Purchased 12 years ago, lifespan 10 → ~2 years overdue
    const { status, remainingYears } = getApplianceStatus({
      purchaseDate: '2014-03-30',
      expectedLifespan: 10,
    });
    expect(status).toBe('overdue');
    expect(remainingYears).toBeLessThan(0);
  });

  it('caps percentUsed at 100 when overdue', () => {
    const { percentUsed } = getApplianceStatus({
      purchaseDate: '2010-01-01',
      expectedLifespan: 10,
    });
    expect(percentUsed).toBe(100);
  });

  it('returns a valid eolDate', () => {
    const { eolDate } = getApplianceStatus({
      purchaseDate: '2020-01-01',
      expectedLifespan: 10,
    });
    expect(eolDate).toBeInstanceOf(Date);
    expect(eolDate.getFullYear()).toBe(2030);
  });

  it('handles fractional lifespan (years + months)', () => {
    // lifespan 10.5 → 10 years + 6 months from purchase
    const { eolDate } = getApplianceStatus({
      purchaseDate: '2020-01-01',
      expectedLifespan: 10.5,
    });
    expect(eolDate.getFullYear()).toBe(2030);
    expect(eolDate.getMonth()).toBe(6); // July (0-indexed)
  });
});

// ---------------------------------------------------------------------------
// formatYearsRemaining
// ---------------------------------------------------------------------------
describe('formatYearsRemaining', () => {
  it('formats years >= 1 as "X.X yrs remaining"', () => {
    expect(formatYearsRemaining(5)).toBe('5.0 yrs remaining');
    expect(formatYearsRemaining(1.5)).toBe('1.5 yrs remaining');
  });

  it('formats 0 < years < 1 as "N mo remaining"', () => {
    expect(formatYearsRemaining(0.5)).toBe('6 mo remaining');
    expect(formatYearsRemaining(0.25)).toBe('3 mo remaining');
  });

  it('formats negative years >= -1 as "N mo overdue"', () => {
    expect(formatYearsRemaining(-0.5)).toBe('6 mo overdue');
  });

  it('formats negative years < -1 as "X.X yrs overdue"', () => {
    expect(formatYearsRemaining(-2)).toBe('2.0 yrs overdue');
    expect(formatYearsRemaining(-1.5)).toBe('1.5 yrs overdue');
  });
});

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------
describe('formatCurrency', () => {
  it('formats a whole number correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats a decimal amount correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats a large number with commas', () => {
    expect(formatCurrency(10000)).toBe('$10,000');
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('formats a date string into a human-readable form', () => {
    // Result is locale-dependent but should contain the year
    const result = formatDate('2021-03-08');
    expect(result).toMatch(/2021/);
  });

  it('returns a non-empty string for a valid date', () => {
    const result = formatDate('2013-07-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
