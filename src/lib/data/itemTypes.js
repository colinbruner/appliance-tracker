/**
 * @typedef {{ id: string, label: string, color: string, cssVar: string }} Category
 * @typedef {{ type: string, category: string, avgLifespan: number | null }} ItemType
 */

/** Category definitions aligned with DESIGN.md category colors. */
export const CATEGORIES = {
  appliances: { label: 'Appliances',           color: '#C4915C', cssVar: '--cat-appliances' },
  structure:  { label: 'Structure & Exterior',  color: '#A67B5B', cssVar: '--cat-structure' },
  systems:    { label: 'Home Systems',          color: '#5A8C84', cssVar: '--cat-systems' },
  projects:   { label: 'Projects',             color: '#8B7396', cssVar: '--cat-projects' },
};

/** @type {ItemType[]} */
export const ITEM_TYPES = [
  // Appliances (8 types, 9-16yr lifespans)
  { type: 'Refrigerator',      category: 'appliances', avgLifespan: 14 },
  { type: 'Washer',            category: 'appliances', avgLifespan: 11 },
  { type: 'Dryer',             category: 'appliances', avgLifespan: 13 },
  { type: 'Dishwasher',        category: 'appliances', avgLifespan: 10 },
  { type: 'Oven / Range',      category: 'appliances', avgLifespan: 15 },
  { type: 'Microwave',         category: 'appliances', avgLifespan:  9 },
  { type: 'Freezer',           category: 'appliances', avgLifespan: 16 },
  { type: 'Garbage Disposal',  category: 'appliances', avgLifespan: 12 },

  // Structure & Exterior (9 types, 15-30yr lifespans)
  { type: 'Roof',              category: 'structure', avgLifespan: 25 },
  { type: 'Windows',           category: 'structure', avgLifespan: 25 },
  { type: 'Siding',            category: 'structure', avgLifespan: 25 },
  { type: 'Deck / Patio',      category: 'structure', avgLifespan: 20 },
  { type: 'Driveway',          category: 'structure', avgLifespan: 25 },
  { type: 'Fencing',           category: 'structure', avgLifespan: 20 },
  { type: 'Garage Door',       category: 'structure', avgLifespan: 20 },
  { type: 'Front Door',        category: 'structure', avgLifespan: 30 },
  { type: 'Gutters',           category: 'structure', avgLifespan: 20 },

  // Home Systems (7 types, 11-40yr lifespans)
  { type: 'HVAC / AC',         category: 'systems', avgLifespan: 15 },
  { type: 'Furnace',           category: 'systems', avgLifespan: 20 },
  { type: 'Heat Pump',         category: 'systems', avgLifespan: 16 },
  { type: 'Water Heater',      category: 'systems', avgLifespan: 11 },
  { type: 'Electrical Panel',  category: 'systems', avgLifespan: 40 },
  { type: 'Plumbing',          category: 'systems', avgLifespan: 30 },
  { type: 'Septic',            category: 'systems', avgLifespan: 30 },

  // Projects (6 types, no lifespan)
  { type: 'Renovation',        category: 'projects', avgLifespan: null },
  { type: 'Landscaping',       category: 'projects', avgLifespan: null },
  { type: 'Painting',          category: 'projects', avgLifespan: null },
  { type: 'Repair',            category: 'projects', avgLifespan: null },
  { type: 'Improvement',       category: 'projects', avgLifespan: null },
  { type: 'Custom',            category: 'projects', avgLifespan: null },
];

/** @param {string} category */
export function getTypesForCategory(category) {
  return ITEM_TYPES.filter(t => t.category === category);
}

/** @param {string} typeName */
export function getTypeInfo(typeName) {
  return ITEM_TYPES.find(t => t.type === typeName)
    ?? { type: typeName, category: 'appliances', avgLifespan: 10 };
}
