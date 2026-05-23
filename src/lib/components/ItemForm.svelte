<script>
  import { ITEM_TYPES, CATEGORIES, getTypesForCategory } from '$lib/data/itemTypes.js';

  /** @type {{ item?: any, onsave: (data: any) => void, oncancel: () => void }} */
  let { item = null, onsave, oncancel } = $props();

  const today = new Date().toISOString().split('T')[0];

  // --- Form state ---
  let category = $state(item?.category ?? 'appliances');
  let type = $state(item?.type ?? '');
  let name = $state(item?.name ?? '');
  let brand = $state(item?.brand ?? '');
  let model = $state(item?.model ?? '');
  let purchaseDate = $state(item?.purchaseDate ?? today);
  let purchasePrice = $state(item?.purchasePrice ?? '');
  let expectedLifespan = $state(item?.expectedLifespan ?? 10);
  let notes = $state(item?.notes ?? '');

  // Replacement plan (assets only)
  let planEnabled = $state(!!item?.replacementPlan);
  let planBrand = $state(item?.replacementPlan?.brand ?? '');
  let planModel = $state(item?.replacementPlan?.model ?? '');
  let planCost = $state(item?.replacementPlan?.estimatedCost ?? '');
  let planUrl = $state(item?.replacementPlan?.storeUrl ?? '');
  let planNotes = $state(item?.replacementPlan?.notes ?? '');

  // Project fields
  let completionDate = $state(item?.completionDate ?? '');
  let finalCost = $state(item?.finalCost ?? '');

  let isProject = $derived(category === 'projects');
  let availableTypes = $derived(getTypesForCategory(category));

  function handleCategoryChange() {
    type = '';
    if (isProject) {
      planEnabled = false;
      expectedLifespan = 0;
    }
  }

  function handleTypeChange() {
    const found = ITEM_TYPES.find(t => t.type === type);
    if (found) {
      if (found.avgLifespan != null) expectedLifespan = found.avgLifespan;
      if (!name) name = found.type;
    }
  }

  function handleSubmit() {
    const result = {
      category,
      type,
      name: name.trim() || type,
      brand: brand.trim(),
      model: model.trim(),
      purchaseDate,
      purchasePrice: purchasePrice !== '' ? Number(purchasePrice) : null,
      expectedLifespan: isProject ? null : Number(expectedLifespan),
      notes: notes.trim(),
      replacementPlan: (!isProject && planEnabled) ? {
        brand: planBrand.trim(),
        model: planModel.trim(),
        estimatedCost: planCost !== '' ? Number(planCost) : null,
        storeUrl: planUrl.trim(),
        notes: planNotes.trim()
      } : null,
      completionDate: isProject && completionDate ? completionDate : null,
      finalCost: (isProject && finalCost !== '') ? Number(finalCost) : null,
    };
    onsave(result);
  }
</script>

<form class="item-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
  <!-- Category -->
  <section class="section">
    <h3 class="section-title">Category</h3>
    <div class="cat-picker">
      {#each Object.entries(CATEGORIES) as [id, meta]}
        <label class="cat-option" class:selected={category === id} style="--cat-color: {meta.color};">
          <input
            type="radio"
            name="category"
            value={id}
            bind:group={category}
            onchange={handleCategoryChange}
            disabled={!!item?.id}
          />
          <span class="cat-dot" style="background: {meta.color};"></span>
          <span>{meta.label}</span>
        </label>
      {/each}
    </div>
  </section>

  <!-- Item Details -->
  <section class="section">
    <h3 class="section-title">{isProject ? 'Project' : 'Item'} Details</h3>

    <div class="row">
      <label class="field">
        <span>Type <span class="req">*</span></span>
        <select bind:value={type} onchange={handleTypeChange} required>
          <option value="">Select type...</option>
          {#each availableTypes as t}
            <option value={t.type}>{t.type}</option>
          {/each}
        </select>
      </label>
      <label class="field">
        <span>Name / Location</span>
        <input type="text" bind:value={name} placeholder={isProject ? 'e.g. Kitchen Renovation' : 'e.g. Kitchen Fridge'} />
      </label>
    </div>

    {#if !isProject}
      <div class="row">
        <label class="field">
          <span>Brand</span>
          <input type="text" bind:value={brand} placeholder="e.g. Samsung" />
        </label>
        <label class="field">
          <span>Model</span>
          <input type="text" bind:value={model} placeholder="e.g. RF23M8090SG" />
        </label>
      </div>
    {/if}

    <div class="row">
      <label class="field">
        <span>{isProject ? 'Start Date' : 'Purchase Date'} <span class="req">*</span></span>
        <input type="date" bind:value={purchaseDate} max={today} required />
      </label>
      <label class="field">
        <span>{isProject ? 'Estimated Cost ($)' : 'Purchase Price ($)'}</span>
        <input type="number" bind:value={purchasePrice} placeholder="0.00" min="0" step="0.01" />
      </label>
    </div>

    {#if !isProject}
      <label class="field">
        <span>
          Expected Lifespan (years)
          <span class="hint"> — industry average pre-filled</span>
        </span>
        <input type="number" bind:value={expectedLifespan} min="1" max="60" required />
      </label>
    {/if}

    {#if isProject}
      <div class="row">
        <label class="field">
          <span>Completion Date</span>
          <input type="date" bind:value={completionDate} />
        </label>
        <label class="field">
          <span>Final Cost ($)</span>
          <input type="number" bind:value={finalCost} placeholder="0.00" min="0" step="0.01" />
        </label>
      </div>
    {/if}

    <label class="field">
      <span>Notes</span>
      <textarea bind:value={notes} rows="2" placeholder="Any notes..."></textarea>
    </label>
  </section>

  <!-- Replacement Plan (assets only) -->
  {#if !isProject}
    <section class="section">
      <div class="section-title-row">
        <h3 class="section-title">Replacement Plan</h3>
        <button type="button" class="toggle-btn" onclick={() => planEnabled = !planEnabled}>
          {planEnabled ? 'Remove Plan' : '+ Add Plan'}
        </button>
      </div>

      {#if planEnabled}
        <div class="row">
          <label class="field">
            <span>Target Brand</span>
            <input type="text" bind:value={planBrand} placeholder="e.g. LG" />
          </label>
          <label class="field">
            <span>Target Model</span>
            <input type="text" bind:value={planModel} placeholder="e.g. LRMVS3006S" />
          </label>
        </div>

        <div class="row">
          <label class="field">
            <span>Estimated Cost ($)</span>
            <input type="number" bind:value={planCost} placeholder="0.00" min="0" step="0.01" />
          </label>
          <label class="field">
            <span>Store / URL</span>
            <input type="url" bind:value={planUrl} placeholder="https://..." />
          </label>
        </div>

        <label class="field">
          <span>Notes</span>
          <textarea bind:value={planNotes} rows="2" placeholder="Notes about the replacement..."></textarea>
        </label>
      {/if}
    </section>
  {/if}

  <div class="actions">
    <button type="button" class="btn-cancel" onclick={oncancel}>Cancel</button>
    <button type="submit" class="btn-save">
      {item ? 'Save Changes' : isProject ? 'Add Project' : 'Add Item'}
    </button>
  </div>
</form>

<style>
  .item-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section { display: flex; flex-direction: column; gap: 0.875rem; }

  .section-title {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-3);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
  }

  .section-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Category picker */
  .cat-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .cat-option {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.875rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    font-size: 0.825rem;
    font-weight: 500;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.12s;
  }
  .cat-option input { display: none; }
  .cat-option .cat-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .cat-option.selected {
    color: var(--cat-color);
    border-color: var(--cat-color);
    background: color-mix(in srgb, var(--cat-color) 8%, transparent);
  }
  .cat-option:hover:not(.selected) {
    border-color: var(--text-3);
  }
  .cat-option:has(input:disabled) {
    opacity: 0.6;
    cursor: default;
  }

  .toggle-btn {
    background: none;
    border: 1px solid var(--primary-border);
    color: var(--primary);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
  }
  .toggle-btn:hover { background: var(--primary-subtle); }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.875rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.825rem;
    font-weight: 550;
    color: var(--text-2);
  }
  .hint { font-size: 0.72rem; font-weight: 400; color: var(--text-3); }
  .req { color: var(--semantic-error); }

  input, select, textarea {
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--border);
    border-radius: 7px;
    font-size: 0.875rem;
    color: var(--text-1);
    background: var(--surface-input);
    transition: border-color 0.15s, box-shadow 0.15s;
    width: 100%;
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-subtle);
    background: var(--surface-input);
  }
  textarea { resize: vertical; }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.25rem;
    border-top: 1px solid var(--border-dim);
  }

  .btn-cancel {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-2);
    padding: 0.575rem 1.375rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 550;
  }
  .btn-cancel:hover { background: var(--surface-2); }

  .btn-save {
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 0.575rem 1.5rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background 0.15s;
  }
  .btn-save:hover { background: var(--primary-hover); }

  @media (max-width: 520px) {
    .row { grid-template-columns: 1fr; }
    .cat-picker { gap: 0.375rem; }
    .cat-option { font-size: 0.75rem; padding: 0.375rem 0.625rem; }
  }
</style>
