import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { createClient } from '@supabase/supabase-js';

const PREFIX = 'at-appliances';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Seeded sample data so the app is useful on first launch */
const SAMPLE_APPLIANCES = [
  {
    id: 'sample-1',
    type: 'Refrigerator',
    name: 'Kitchen Refrigerator',
    brand: 'Samsung',
    model: 'RF23M8090SG',
    purchaseDate: '2013-07-15',
    purchasePrice: 1350,
    expectedLifespan: 14,
    notes: 'French door, needs seal check on bottom drawer',
    replacementPlan: {
      brand: 'LG',
      model: 'LRMVS3006S',
      estimatedCost: 1900,
      storeUrl: '',
      notes: 'Looking at counter-depth French door options'
    }
  },
  {
    id: 'sample-2',
    type: 'Washer',
    name: 'Main Washer',
    brand: 'LG',
    model: 'WM3900HWA',
    purchaseDate: '2019-04-10',
    purchasePrice: 850,
    expectedLifespan: 11,
    notes: 'Front-load, running well',
    replacementPlan: null
  },
  {
    id: 'sample-3',
    type: 'Dishwasher',
    name: 'Kitchen Dishwasher',
    brand: 'Bosch',
    model: 'SHPM88Z75N',
    purchaseDate: '2021-03-08',
    purchasePrice: 1100,
    expectedLifespan: 10,
    notes: '',
    replacementPlan: null
  },
  {
    id: 'sample-4',
    type: 'Water Heater',
    name: 'Main Water Heater',
    brand: 'Bradford White',
    model: 'RE250T6',
    purchaseDate: '2016-09-05',
    purchasePrice: 650,
    expectedLifespan: 11,
    notes: 'Gas water heater, 50 gallon',
    replacementPlan: {
      brand: 'Rheem',
      model: 'RTEX-24',
      estimatedCost: 950,
      storeUrl: '',
      notes: 'Considering tankless electric upgrade'
    }
  },
  {
    id: 'sample-5',
    type: 'Furnace',
    name: 'Main Furnace',
    brand: 'Carrier',
    model: '58CVA',
    purchaseDate: '2015-11-20',
    purchasePrice: 3200,
    expectedLifespan: 20,
    notes: 'Annual service in October',
    replacementPlan: null
  }
];

let _userId = null;
let _idToken = null;
let _supabase = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      accessToken: () => _idToken
    });
  }
  return _supabase;
}

// --- localStorage helpers ---

function storageKey() {
  return _userId ? `${PREFIX}-${_userId}` : `${PREFIX}-demo`;
}

function load() {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) return JSON.parse(raw);
    return _userId ? [] : SAMPLE_APPLIANCES;
  } catch {
    return _userId ? [] : SAMPLE_APPLIANCES;
  }
}

function persist(list) {
  if (browser) localStorage.setItem(storageKey(), JSON.stringify(list));
  return list;
}

// --- Supabase field mapping ---

function toRow(appliance) {
  return {
    id: appliance.id,
    user_id: _userId,
    type: appliance.type || null,
    name: appliance.name || null,
    brand: appliance.brand || null,
    model: appliance.model || null,
    purchase_date: appliance.purchaseDate || null,
    purchase_price: appliance.purchasePrice ?? null,
    expected_lifespan: appliance.expectedLifespan ?? null,
    notes: appliance.notes || null,
    replacement_plan: appliance.replacementPlan || null
  };
}

function fromRow(row) {
  return {
    id: row.id,
    type: row.type ?? '',
    name: row.name ?? '',
    brand: row.brand ?? '',
    model: row.model ?? '',
    purchaseDate: row.purchase_date ?? '',
    purchasePrice: row.purchase_price != null ? Number(row.purchase_price) : null,
    expectedLifespan: row.expected_lifespan ?? null,
    notes: row.notes ?? '',
    replacementPlan: row.replacement_plan ?? null
  };
}

async function loadFromSupabase() {
  const { data, error } = await getSupabase()
    .from('appliances')
    .select('*')
    .eq('user_id', _userId);
  if (error) {
    console.error('Supabase load error:', error);
    return [];
  }
  return (data ?? []).map(fromRow);
}

// --- Store ---

function createStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    async setUser(userId, idToken = null) {
      if (userId === _userId) return;
      _userId = userId;
      _idToken = idToken;

      if (isSupabaseConfigured() && userId) {
        set([]);
        set(await loadFromSupabase());
      } else {
        set(load());
      }
    },
    add(appliance) {
      const newItem = { ...appliance, id: crypto.randomUUID() };
      update(list => {
        const next = [...list, newItem];
        if (isSupabaseConfigured() && _userId) {
          getSupabase().from('appliances').insert(toRow(newItem))
            .then(({ error }) => { if (error) console.error('Supabase insert error:', error); });
        } else {
          persist(next);
        }
        return next;
      });
    },
    edit(id, data) {
      update(list => {
        const next = list.map(a => a.id === id ? { ...a, ...data } : a);
        if (isSupabaseConfigured() && _userId) {
          const updated = next.find(a => a.id === id);
          getSupabase().from('appliances').update(toRow(updated)).eq('id', id)
            .then(({ error }) => { if (error) console.error('Supabase update error:', error); });
        } else {
          persist(next);
        }
        return next;
      });
    },
    remove(id) {
      update(list => {
        const next = list.filter(a => a.id !== id);
        if (isSupabaseConfigured() && _userId) {
          getSupabase().from('appliances').delete().eq('id', id)
            .then(({ error }) => { if (error) console.error('Supabase delete error:', error); });
        } else {
          persist(next);
        }
        return next;
      });
    }
  };
}

export const applianceStore = createStore();
