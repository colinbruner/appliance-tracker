import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock $app/environment so the store never touches localStorage
vi.mock('$app/environment', () => ({ browser: false }));

// Mock Supabase so it's never accidentally instantiated
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({})),
}));

// Import store AFTER mocks are in place
const { applianceStore } = await import('./appliances.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read the current snapshot of the store. */
function snapshot() {
  return get(applianceStore);
}

/** Remove every appliance currently in the store. */
function clearStore() {
  snapshot().forEach(a => applianceStore.remove(a.id));
}

const BASE_APPLIANCE = {
  type: 'Washer',
  name: 'Test Washer',
  brand: 'LG',
  model: 'WM3900HWA',
  purchaseDate: '2022-01-01',
  purchasePrice: 800,
  expectedLifespan: 11,
  notes: '',
  replacementPlan: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  clearStore();
});

describe('applianceStore – initial state', () => {
  it('starts empty in test (non-browser) mode', () => {
    expect(snapshot()).toHaveLength(0);
  });
});

describe('applianceStore – add', () => {
  it('adds an appliance and generates a unique id', () => {
    applianceStore.add({ ...BASE_APPLIANCE });
    const items = snapshot();
    expect(items).toHaveLength(1);
    expect(typeof items[0].id).toBe('string');
    expect(items[0].id.length).toBeGreaterThan(0);
  });

  it('preserves all provided fields', () => {
    applianceStore.add({ ...BASE_APPLIANCE });
    const item = snapshot()[0];
    expect(item.name).toBe('Test Washer');
    expect(item.brand).toBe('LG');
    expect(item.purchasePrice).toBe(800);
    expect(item.expectedLifespan).toBe(11);
  });

  it('assigns a different id to each new appliance', () => {
    applianceStore.add({ ...BASE_APPLIANCE });
    applianceStore.add({ ...BASE_APPLIANCE, name: 'Second Washer' });
    const [a, b] = snapshot();
    expect(a.id).not.toBe(b.id);
  });

  it('appends without replacing existing entries', () => {
    applianceStore.add({ ...BASE_APPLIANCE });
    applianceStore.add({ ...BASE_APPLIANCE, name: 'Dryer' });
    expect(snapshot()).toHaveLength(2);
  });
});

describe('applianceStore – edit', () => {
  it('updates the specified fields of the target appliance', () => {
    applianceStore.add({ ...BASE_APPLIANCE });
    const { id } = snapshot()[0];

    applianceStore.edit(id, { name: 'Updated Name', purchasePrice: 999 });

    const item = snapshot().find(a => a.id === id);
    expect(item.name).toBe('Updated Name');
    expect(item.purchasePrice).toBe(999);
  });

  it('does not mutate other appliances', () => {
    applianceStore.add({ ...BASE_APPLIANCE, name: 'Washer A' });
    applianceStore.add({ ...BASE_APPLIANCE, name: 'Washer B' });
    const [a, b] = snapshot();

    applianceStore.edit(a.id, { name: 'Modified A' });

    const items = snapshot();
    expect(items.find(x => x.id === b.id).name).toBe('Washer B');
  });

  it('preserves fields that were not included in the update', () => {
    applianceStore.add({ ...BASE_APPLIANCE });
    const { id } = snapshot()[0];

    applianceStore.edit(id, { brand: 'Samsung' });

    const item = snapshot().find(a => a.id === id);
    expect(item.brand).toBe('Samsung');
    expect(item.model).toBe('WM3900HWA'); // unchanged
  });
});

describe('applianceStore – remove', () => {
  it('removes only the appliance with the given id', () => {
    applianceStore.add({ ...BASE_APPLIANCE, name: 'Washer A' });
    applianceStore.add({ ...BASE_APPLIANCE, name: 'Washer B' });
    const [a, b] = snapshot();

    applianceStore.remove(a.id);

    const items = snapshot();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(b.id);
  });

  it('results in an empty store after removing the last item', () => {
    applianceStore.add({ ...BASE_APPLIANCE });
    const { id } = snapshot()[0];

    applianceStore.remove(id);

    expect(snapshot()).toHaveLength(0);
  });

  it('is a no-op for an id that does not exist', () => {
    applianceStore.add({ ...BASE_APPLIANCE });
    applianceStore.remove('non-existent-id');
    expect(snapshot()).toHaveLength(1);
  });
});
