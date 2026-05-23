import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getSupabase, setIdToken, isSupabaseConfigured } from '$lib/supabase.js';
import { SAMPLE_ITEMS } from '$lib/data/sampleItems.js';

const PREFIX = 'hb-items';

let _userId = null;

// --- localStorage helpers ---

function storageKey() {
  return _userId ? `${PREFIX}-${_userId}` : `${PREFIX}-demo`;
}

function load() {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) return JSON.parse(raw);
    return _userId ? [] : SAMPLE_ITEMS;
  } catch {
    return _userId ? [] : SAMPLE_ITEMS;
  }
}

function persist(list) {
  if (browser) localStorage.setItem(storageKey(), JSON.stringify(list));
  return list;
}

// --- Supabase field mapping ---

function toRow(item) {
  return {
    id: item.id,
    user_id: _userId,
    category: item.category || 'appliances',
    type: item.type || null,
    name: item.name || null,
    brand: item.brand || null,
    model: item.model || null,
    purchase_date: item.purchaseDate || null,
    purchase_price: item.purchasePrice ?? null,
    expected_lifespan: item.expectedLifespan ?? null,
    notes: item.notes || null,
    replacement_plan: item.replacementPlan || null,
    completion_date: item.completionDate || null,
    final_cost: item.finalCost ?? null,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    category: row.category ?? 'appliances',
    type: row.type ?? '',
    name: row.name ?? '',
    brand: row.brand ?? '',
    model: row.model ?? '',
    purchaseDate: row.purchase_date ?? '',
    purchasePrice: row.purchase_price != null ? Number(row.purchase_price) : null,
    expectedLifespan: row.expected_lifespan ?? null,
    notes: row.notes ?? '',
    replacementPlan: row.replacement_plan ?? null,
    completionDate: row.completion_date ?? null,
    finalCost: row.final_cost != null ? Number(row.final_cost) : null,
  };
}

async function loadFromSupabase() {
  const { data, error } = await getSupabase()
    .from('items')
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
  const { subscribe, set, update } = writable(browser ? load() : []);

  return {
    subscribe,
    async setUser(userId, idToken = null) {
      if (userId === _userId) return;
      _userId = userId;
      setIdToken(idToken);

      if (isSupabaseConfigured() && userId) {
        set([]);
        set(await loadFromSupabase());
      } else {
        set(load());
      }
    },
    add(item) {
      const newItem = { ...item, id: crypto.randomUUID() };
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

export const itemStore = createStore();
