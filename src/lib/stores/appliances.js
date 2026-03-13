import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'appliance-tracker-v1';

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

function loadInitial() {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : SAMPLE_APPLIANCES;
  } catch {
    return SAMPLE_APPLIANCES;
  }
}

function createApplianceStore() {
  const { subscribe, update } = writable(loadInitial());

  function persist(list) {
    if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  }

  return {
    subscribe,
    add(appliance) {
      update(list => persist([...list, { ...appliance, id: crypto.randomUUID() }]));
    },
    edit(id, data) {
      update(list => persist(list.map(a => a.id === id ? { ...a, ...data } : a)));
    },
    remove(id) {
      update(list => persist(list.filter(a => a.id !== id)));
    }
  };
}

export const applianceStore = createApplianceStore();
