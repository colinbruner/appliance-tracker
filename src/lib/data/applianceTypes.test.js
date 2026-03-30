import { describe, it, expect } from 'vitest';
import { APPLIANCE_TYPES, getTypeInfo } from './applianceTypes.js';

describe('APPLIANCE_TYPES', () => {
  it('contains 14 appliance types', () => {
    expect(APPLIANCE_TYPES).toHaveLength(14);
  });

  it('every entry has a non-empty type string', () => {
    for (const entry of APPLIANCE_TYPES) {
      expect(typeof entry.type).toBe('string');
      expect(entry.type.length).toBeGreaterThan(0);
    }
  });

  it('every entry has a positive integer avgLifespan', () => {
    for (const entry of APPLIANCE_TYPES) {
      expect(Number.isInteger(entry.avgLifespan)).toBe(true);
      expect(entry.avgLifespan).toBeGreaterThan(0);
    }
  });

  it('all type names are unique', () => {
    const names = APPLIANCE_TYPES.map(t => t.type);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each([
    ['Washer', 11],
    ['Dryer', 13],
    ['Refrigerator', 14],
    ['Dishwasher', 10],
    ['Furnace', 20],
    ['Water Heater', 11],
    ['Microwave', 9],
  ])('%s has avgLifespan %i', (type, lifespan) => {
    const entry = APPLIANCE_TYPES.find(t => t.type === type);
    expect(entry).toBeDefined();
    expect(entry.avgLifespan).toBe(lifespan);
  });
});

describe('getTypeInfo', () => {
  it('returns the matching entry for a known type', () => {
    const info = getTypeInfo('Refrigerator');
    expect(info.type).toBe('Refrigerator');
    expect(info.avgLifespan).toBe(14);
  });

  it('returns a fallback with avgLifespan 10 for an unknown type', () => {
    const info = getTypeInfo('Teleporter');
    expect(info.type).toBe('Teleporter');
    expect(info.avgLifespan).toBe(10);
  });

  it('returns the "Other" entry when queried directly', () => {
    const info = getTypeInfo('Other');
    expect(info.type).toBe('Other');
    expect(info.avgLifespan).toBe(10);
  });
});
