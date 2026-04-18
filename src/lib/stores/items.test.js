import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock $app/environment so the store never touches localStorage
vi.mock('$app/environment', () => ({ browser: false }));

// Mock Supabase so it's never accidentally instantiated
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({})),
}));

// Mock the supabase module
vi.mock('$lib/supabase.js', () => ({
  getSupabase: vi.fn(() => ({})),
  setIdToken: vi.fn(),
  isSupabaseConfigured: vi.fn(() => false),
}));

// Mock sample items
vi.mock('$lib/data/sampleItems.js', () => ({
  SAMPLE_ITEMS: [],
}));

// Import store AFTER mocks are in place
const { itemStore } = await import('./items.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read the current snapshot of the store. */
function snapshot() {
  return get(itemStore);
}

/** Remove every item currently in the store. */
function clearStore() {
  snapshot().forEach(a => itemStore.remove(a.id));
}

const BASE_ITEM = {
  category: 'appliances',
  type: 'Washer',
  name: 'Test Washer',
  brand: 'LG',
  model: 'WM3900HWA',
  purchaseDate: '2022-01-01',
  purchasePrice: 800,
  expectedLifespan: 11,
  notes: '',
  replacementPlan: null,
  completionDate: null,
  finalCost: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  clearStore();
});

describe('itemStore — initial state', () => {
  it('starts empty in test (non-browser) mode', () => {
    expect(snapshot()).toHaveLength(0);
  });
});

describe('itemStore — add', () => {
  it('adds an item and generates a unique id', () => {
    itemStore.add({ ...BASE_ITEM });
    const items = snapshot();
    expect(items).toHaveLength(1);
    expect(typeof items[0].id).toBe('string');
    expect(items[0].id.length).toBeGreaterThan(0);
  });

  it('preserves all provided fields', () => {
    itemStore.add({ ...BASE_ITEM });
    const item = snapshot()[0];
    expect(item.category).toBe('appliances');
    expect(item.name).toBe('Test Washer');
    expect(item.brand).toBe('LG');
    expect(item.purchasePrice).toBe(800);
    expect(item.expectedLifespan).toBe(11);
  });

  it('assigns a different id to each new item', () => {
    itemStore.add({ ...BASE_ITEM });
    itemStore.add({ ...BASE_ITEM, name: 'Second Washer' });
    const [a, b] = snapshot();
    expect(a.id).not.toBe(b.id);
  });

  it('appends without replacing existing entries', () => {
    itemStore.add({ ...BASE_ITEM });
    itemStore.add({ ...BASE_ITEM, name: 'Dryer' });
    expect(snapshot()).toHaveLength(2);
  });
});

describe('itemStore — edit', () => {
  it('updates the specified fields of the target item', () => {
    itemStore.add({ ...BASE_ITEM });
    const { id } = snapshot()[0];

    itemStore.edit(id, { name: 'Updated Name', purchasePrice: 999 });

    const item = snapshot().find(a => a.id === id);
    expect(item.name).toBe('Updated Name');
    expect(item.purchasePrice).toBe(999);
  });

  it('does not mutate other items', () => {
    itemStore.add({ ...BASE_ITEM, name: 'Washer A' });
    itemStore.add({ ...BASE_ITEM, name: 'Washer B' });
    const [a, b] = snapshot();

    itemStore.edit(a.id, { name: 'Modified A' });

    const items = snapshot();
    expect(items.find(x => x.id === b.id).name).toBe('Washer B');
  });

  it('preserves fields that were not included in the update', () => {
    itemStore.add({ ...BASE_ITEM });
    const { id } = snapshot()[0];

    itemStore.edit(id, { brand: 'Samsung' });

    const item = snapshot().find(a => a.id === id);
    expect(item.brand).toBe('Samsung');
    expect(item.model).toBe('WM3900HWA'); // unchanged
  });
});

describe('itemStore — remove', () => {
  it('removes only the item with the given id', () => {
    itemStore.add({ ...BASE_ITEM, name: 'Washer A' });
    itemStore.add({ ...BASE_ITEM, name: 'Washer B' });
    const [a, b] = snapshot();

    itemStore.remove(a.id);

    const items = snapshot();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(b.id);
  });

  it('results in an empty store after removing the last item', () => {
    itemStore.add({ ...BASE_ITEM });
    const { id } = snapshot()[0];

    itemStore.remove(id);

    expect(snapshot()).toHaveLength(0);
  });

  it('is a no-op for an id that does not exist', () => {
    itemStore.add({ ...BASE_ITEM });
    itemStore.remove('non-existent-id');
    expect(snapshot()).toHaveLength(1);
  });
});
