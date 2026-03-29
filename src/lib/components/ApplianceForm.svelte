<script>
  import { tick } from 'svelte';
  import { APPLIANCE_TYPES } from '$lib/data/applianceTypes.js';

  /** @type {{ appliance?: any, focusReplacement?: boolean, onsave: (data: any) => void, oncancel: () => void }} */
  let { appliance = null, focusReplacement = false, onsave, oncancel } = $props();

  const today = new Date().toISOString().split('T')[0];

  // --- Form state ---
  let type = $state(appliance?.type ?? '');
  let name = $state(appliance?.name ?? '');
  let brand = $state(appliance?.brand ?? '');
  let model = $state(appliance?.model ?? '');
  let purchaseDate = $state(appliance?.purchaseDate ?? today);
  let purchasePrice = $state(appliance?.purchasePrice ?? '');
  let expectedLifespan = $state(appliance?.expectedLifespan ?? 10);
  let notes = $state(appliance?.notes ?? '');

  // Replacement plan
  let planEnabled = $state(focusReplacement || !!appliance?.replacementPlan);
  let planBrand = $state(appliance?.replacementPlan?.brand ?? '');
  let planModel = $state(appliance?.replacementPlan?.model ?? '');
  let planCost = $state(appliance?.replacementPlan?.estimatedCost ?? '');
  let planUrl = $state(appliance?.replacementPlan?.storeUrl ?? '');
  let planNotes = $state(appliance?.replacementPlan?.notes ?? '');

  let planSection = $state(null);

  function handleTypeChange() {
    const found = APPLIANCE_TYPES.find(t => t.type === type);
    if (found) {
      expectedLifespan = found.avgLifespan;
      if (!name) name = found.type;
    }
  }

  async function togglePlan() {
    planEnabled = !planEnabled;
    if (planEnabled) {
      await tick();
      planSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function handleSubmit() {
    const result = {
      type,
      name: name.trim() || type,
      brand: brand.trim(),
      model: model.trim(),
      purchaseDate,
      purchasePrice: purchasePrice !== '' ? Number(purchasePrice) : null,
      expectedLifespan: Number(expectedLifespan),
      notes: notes.trim(),
      replacementPlan: planEnabled ? {
        brand: planBrand.trim(),
        model: planModel.trim(),
        estimatedCost: planCost !== '' ? Number(planCost) : null,
        storeUrl: planUrl.trim(),
        notes: planNotes.trim()
      } : null
    };
    onsave(result);
  }
</script>

<div class="overlay" role="dialog" aria-modal="true">
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={oncancel}></div>
  <div class="modal">
    <div class="modal-header">
      <h2>{appliance ? 'Edit Appliance' : 'Add Appliance'}</h2>
      <button class="close" onclick={oncancel} aria-label="Close">&#x2715;</button>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <!-- === Appliance Details === -->
      <section class="section">
        <h3 class="section-title">Appliance Details</h3>

        <div class="row">
          <label class="field">
            <span>Type <span class="req">*</span></span>
            <select bind:value={type} onchange={handleTypeChange} required>
              <option value="">Select type...</option>
              {#each APPLIANCE_TYPES as t}
                <option value={t.type}>{t.type}</option>
              {/each}
            </select>
          </label>
          <label class="field">
            <span>Name / Location</span>
            <input type="text" bind:value={name} placeholder="e.g. Kitchen Fridge" />
          </label>
        </div>

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

        <div class="row">
          <label class="field">
            <span>Purchase Date <span class="req">*</span></span>
            <input type="date" bind:value={purchaseDate} max={today} required />
          </label>
          <label class="field">
            <span>Purchase Price ($)</span>
            <input type="number" bind:value={purchasePrice} placeholder="0.00" min="0" step="0.01" />
          </label>
        </div>

        <label class="field">
          <span>
            Expected Lifespan (years)
            <span class="hint"> — industry average pre-filled</span>
          </span>
          <input type="number" bind:value={expectedLifespan} min="1" max="60" required />
        </label>

        <label class="field">
          <span>Notes</span>
          <textarea bind:value={notes} rows="2" placeholder="Any notes about this appliance..."></textarea>
        </label>
      </section>

      <!-- === Replacement Plan === -->
      <section class="section" bind:this={planSection}>
        <div class="section-title-row">
          <h3 class="section-title">Replacement Plan</h3>
          <button type="button" class="toggle-btn" onclick={togglePlan}>
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

      <div class="actions">
        <button type="button" class="btn-cancel" onclick={oncancel}>Cancel</button>
        <button type="submit" class="btn-save">
          {appliance ? 'Save Changes' : 'Add Appliance'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 1000;
    padding: 2rem 1rem 1rem;
    overflow-y: auto;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(2px);
    z-index: -1;
  }

  .modal {
    background: var(--surface);
    border-radius: 14px;
    width: 100%;
    max-width: 620px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.375rem 1.5rem 0;
  }
  .modal-header h2 {
    font-size: 1.175rem;
    font-weight: 700;
    color: var(--text-1);
  }
  .close {
    background: none;
    border: none;
    font-size: 1rem;
    color: var(--text-3);
    padding: 0.25rem 0.4rem;
    border-radius: 6px;
    line-height: 1;
  }
  .close:hover { background: var(--surface-2); color: var(--text-1); }

  form {
    padding: 1.25rem 1.5rem 1.5rem;
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

  .hint {
    font-size: 0.72rem;
    font-weight: 400;
    color: var(--text-3);
  }

  .req { color: #ef4444; }

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
    .overlay { padding: 0.75rem 0.5rem; }
  }
</style>
