/** @typedef {{ type: string, avgLifespan: number }} ApplianceType */

/** @type {ApplianceType[]} */
export const APPLIANCE_TYPES = [
  { type: 'Washer',              avgLifespan: 11 },
  { type: 'Dryer',               avgLifespan: 13 },
  { type: 'Washer/Dryer Combo',  avgLifespan: 12 },
  { type: 'Refrigerator',        avgLifespan: 14 },
  { type: 'Freezer',             avgLifespan: 16 },
  { type: 'Dishwasher',          avgLifespan: 10 },
  { type: 'Oven / Range',        avgLifespan: 15 },
  { type: 'Microwave',           avgLifespan:  9 },
  { type: 'Air Conditioner',     avgLifespan: 15 },
  { type: 'Furnace',             avgLifespan: 20 },
  { type: 'Heat Pump',           avgLifespan: 16 },
  { type: 'Water Heater',        avgLifespan: 11 },
  { type: 'Garbage Disposal',    avgLifespan: 12 },
  { type: 'Other',               avgLifespan: 10 },
];

/** @param {string} typeName */
export function getTypeInfo(typeName) {
  return APPLIANCE_TYPES.find(t => t.type === typeName) ?? { type: typeName, avgLifespan: 10 };
}
