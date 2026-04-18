import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getItemStatus,
  formatYearsRemaining,
  formatCurrency,
  formatDate,
  STATUS_META,
} from './itemUtils.js';

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
  it('has entries for all six statuses', () => {
    expect(STATUS_META).toHaveProperty('good');
    expect(STATUS_META).toHaveProperty('warning');
    expect(STATUS_META).toHaveProperty('critical');
    expect(STATUS_META).toHaveProperty('overdue');
    expect(STATUS_META).toHaveProperty('active');
    expect(STATUS_META).toHaveProperty('completed');
  });

  it('each entry has a label and a bar color', () => {
    for (const key of Object.keys(STATUS_META)) {
      expect(typeof STATUS_META[key].label).toBe('string');
      expect(STATUS_META[key].label.length).toBeGreaterThan(0);
      expect(STATUS_META[key].bar).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('each entry has a cssVar', () => {
    for (const key of Object.keys(STATUS_META)) {
      expect(STATUS_META[key].cssVar).toMatch(/^--status-/);
    }
  });
});

// ---------------------------------------------------------------------------
// getItemStatus — asset lifecycle (appliances, structure, systems)
// ---------------------------------------------------------------------------
describe('getItemStatus — asset lifecycle', () => {
  it('returns "good" when more than 3 years remain', () => {
    const { status, remainingYears, ageYears, percentUsed } = getItemStatus({
      category: 'appliances',
      purchaseDate: '2024-03-30',
      expectedLifespan: 10,
    });
    expect(status).toBe('good');
    expect(remainingYears).toBeGreaterThan(3);
    expect(ageYears).toBeCloseTo(2, 0);
    expect(percentUsed).toBeCloseTo(20, 0);
  });

  it('returns "warning" when between 1 and 3 years remain', () => {
    const { status } = getItemStatus({
      category: 'systems',
      purchaseDate: '2018-03-30',
      expectedLifespan: 10,
    });
    expect(status).toBe('warning');
  });

  it('returns "critical" when less than 1 year remains', () => {
    const { status } = getItemStatus({
      category: 'structure',
      purchaseDate: '2016-09-30',
      expectedLifespan: 10,
    });
    expect(status).toBe('critical');
  });

  it('returns "overdue" when past expected lifespan', () => {
    const { status, remainingYears } = getItemStatus({
      category: 'appliances',
      purchaseDate: '2014-03-30',
      expectedLifespan: 10,
    });
    expect(status).toBe('overdue');
    expect(remainingYears).toBeLessThan(0);
  });

  it('caps percentUsed at 100 when overdue', () => {
    const { percentUsed } = getItemStatus({
      category: 'appliances',
      purchaseDate: '2010-01-01',
      expectedLifespan: 10,
    });
    expect(percentUsed).toBe(100);
  });

  it('returns a valid eolDate', () => {
    const { eolDate } = getItemStatus({
      category: 'appliances',
      purchaseDate: '2020-01-01',
      expectedLifespan: 10,
    });
    expect(eolDate).toBeInstanceOf(Date);
    expect(eolDate.getFullYear()).toBe(2030);
  });

  it('handles fractional lifespan (years + months)', () => {
    const { eolDate } = getItemStatus({
      category: 'appliances',
      purchaseDate: '2020-01-01',
      expectedLifespan: 10.5,
    });
    expect(eolDate.getFullYear()).toBe(2030);
    expect(eolDate.getMonth()).toBe(6); // July (0-indexed)
  });

  it('defaults to asset lifecycle when category is missing', () => {
    const { status } = getItemStatus({
      purchaseDate: '2024-03-30',
      expectedLifespan: 10,
    });
    expect(status).toBe('good');
  });
});

// ---------------------------------------------------------------------------
// getItemStatus — project lifecycle
// ---------------------------------------------------------------------------
describe('getItemStatus — project lifecycle', () => {
  it('returns "active" for a project with no completion date', () => {
    const result = getItemStatus({
      category: 'projects',
      purchaseDate: '2025-06-01',
    });
    expect(result.status).toBe('active');
    expect(result.eolDate).toBeNull();
    expect(result.remainingYears).toBeNull();
    expect(result.percentUsed).toBeNull();
    expect(result.ageYears).toBeGreaterThan(0);
  });

  it('returns "completed" for a project with a completion date', () => {
    const result = getItemStatus({
      category: 'projects',
      purchaseDate: '2024-01-01',
      completionDate: '2024-06-15',
    });
    expect(result.status).toBe('completed');
    expect(result.percentUsed).toBe(100);
    expect(result.remainingYears).toBe(0);
    expect(result.eolDate).toBeInstanceOf(Date);
    expect(result.ageYears).toBeCloseTo(0.45, 1);
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
    const result = formatDate('2021-03-08');
    expect(result).toMatch(/2021/);
  });

  it('returns a non-empty string for a valid date', () => {
    const result = formatDate('2013-07-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
