import { describe, it, expect } from 'vitest';
import { ITEM_TYPES, CATEGORIES, getTypeInfo, getTypesForCategory } from './itemTypes.js';

describe('CATEGORIES', () => {
  it('has exactly 4 categories', () => {
    expect(Object.keys(CATEGORIES)).toHaveLength(4);
  });

  it('each category has a label, color, and cssVar', () => {
    for (const [id, meta] of Object.entries(CATEGORIES)) {
      expect(typeof meta.label).toBe('string');
      expect(meta.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(meta.cssVar).toMatch(/^--cat-/);
    }
  });

  it('has the expected category keys', () => {
    expect(CATEGORIES).toHaveProperty('appliances');
    expect(CATEGORIES).toHaveProperty('structure');
    expect(CATEGORIES).toHaveProperty('systems');
    expect(CATEGORIES).toHaveProperty('projects');
  });
});

describe('ITEM_TYPES', () => {
  it('contains 30 item types', () => {
    expect(ITEM_TYPES).toHaveLength(30);
  });

  it('every entry has a non-empty type string', () => {
    for (const entry of ITEM_TYPES) {
      expect(typeof entry.type).toBe('string');
      expect(entry.type.length).toBeGreaterThan(0);
    }
  });

  it('every entry has a valid category', () => {
    const validCategories = Object.keys(CATEGORIES);
    for (const entry of ITEM_TYPES) {
      expect(validCategories).toContain(entry.category);
    }
  });

  it('non-project entries have a positive integer avgLifespan', () => {
    for (const entry of ITEM_TYPES.filter(t => t.category !== 'projects')) {
      expect(Number.isInteger(entry.avgLifespan)).toBe(true);
      expect(entry.avgLifespan).toBeGreaterThan(0);
    }
  });

  it('project entries have null avgLifespan', () => {
    for (const entry of ITEM_TYPES.filter(t => t.category === 'projects')) {
      expect(entry.avgLifespan).toBeNull();
    }
  });

  it('all type names are unique', () => {
    const names = ITEM_TYPES.map(t => t.type);
    expect(new Set(names).size).toBe(names.length);
  });

  it('has 8 appliance types', () => {
    expect(ITEM_TYPES.filter(t => t.category === 'appliances')).toHaveLength(8);
  });

  it('has 9 structure types', () => {
    expect(ITEM_TYPES.filter(t => t.category === 'structure')).toHaveLength(9);
  });

  it('has 7 systems types', () => {
    expect(ITEM_TYPES.filter(t => t.category === 'systems')).toHaveLength(7);
  });

  it('has 6 project types', () => {
    expect(ITEM_TYPES.filter(t => t.category === 'projects')).toHaveLength(6);
  });

  it.each([
    ['Washer', 'appliances', 11],
    ['Dryer', 'appliances', 13],
    ['Refrigerator', 'appliances', 14],
    ['Dishwasher', 'appliances', 10],
    ['Microwave', 'appliances', 9],
    ['Roof', 'structure', 25],
    ['Furnace', 'systems', 20],
    ['Water Heater', 'systems', 11],
    ['Electrical Panel', 'systems', 40],
  ])('%s has category %s and avgLifespan %i', (type, category, lifespan) => {
    const entry = ITEM_TYPES.find(t => t.type === type);
    expect(entry).toBeDefined();
    expect(entry.category).toBe(category);
    expect(entry.avgLifespan).toBe(lifespan);
  });
});

describe('getTypesForCategory', () => {
  it('returns only types matching the given category', () => {
    const types = getTypesForCategory('structure');
    expect(types.length).toBe(9);
    for (const t of types) {
      expect(t.category).toBe('structure');
    }
  });

  it('returns an empty array for an unknown category', () => {
    expect(getTypesForCategory('nonexistent')).toHaveLength(0);
  });
});

describe('getTypeInfo', () => {
  it('returns the matching entry for a known type', () => {
    const info = getTypeInfo('Refrigerator');
    expect(info.type).toBe('Refrigerator');
    expect(info.category).toBe('appliances');
    expect(info.avgLifespan).toBe(14);
  });

  it('returns a fallback with avgLifespan 10 for an unknown type', () => {
    const info = getTypeInfo('Teleporter');
    expect(info.type).toBe('Teleporter');
    expect(info.avgLifespan).toBe(10);
  });

  it('returns a project type correctly', () => {
    const info = getTypeInfo('Renovation');
    expect(info.type).toBe('Renovation');
    expect(info.category).toBe('projects');
    expect(info.avgLifespan).toBeNull();
  });
});
