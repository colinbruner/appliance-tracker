<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { itemStore } from '$lib/stores/items.js';
  import { getItemStatus, STATUS_META, formatYearsRemaining, formatCurrency, formatDate } from '$lib/utils/itemUtils.js';
  import { CATEGORIES } from '$lib/data/itemTypes.js';

  let items = $derived($itemStore);
  let item = $derived(items.find(i => i.id === $page.params.id));
  let info = $derived(item ? getItemStatus(item) : null);
  let meta = $derived(info ? STATUS_META[info.status] : null);
  let cat = $derived(item ? (CATEGORIES[item.category] ?? CATEGORIES.appliances) : null);
  let isProject = $derived(item?.category === 'projects');

  function confirmDelete() {
    if (!item) return;
    if (confirm(`Remove "${item.name || item.type}"?`)) {
      itemStore.remove(item.id);
      goto('/items');
    }
  }
</script>

<svelte:head>
  <title>{item ? (item.name || item.type) : 'Item'} — HomeBase</title>
</svelte:head>

{#if !item}
  <div class="not-found">
    <h2>Item not found</h2>
    <p>This item may have been removed.</p>
    <a href="/items" class="btn-back">Back to Items</a>
  </div>
{:else}
  <div class="detail-page">
    <!-- Breadcrumb + actions -->
    <div class="top-bar">
      <a href="/items" class="back-link">← Items</a>
      <div class="top-actions">
        <a href="/items/{item.id}/edit" class="btn-edit">Edit</a>
        <button class="btn-delete" onclick={confirmDelete}>Delete</button>
      </div>
    </div>

    <!-- Header -->
    <div class="detail-header">
      <div>
        <div class="cat-badge" style="color: {cat.color}; border-color: {cat.color}66; background: {cat.color}1a;">
          {cat.label}
        </div>
        <h1 class="detail-name">{item.name || item.type}</h1>
        {#if item.brand || item.model}
          <p class="detail-subtitle">{[item.brand, item.model].filter(Boolean).join(' · ')}</p>
        {/if}
      </div>
      <span class="status-pill" style="color:{meta.bar}; border-color:{meta.bar}66; background:{meta.bar}1a;">
        {meta.label}
      </span>
    </div>

    <!-- Lifecycle progress (assets only) -->
    {#if !isProject && info.percentUsed != null}
      <div class="section progress-section">
        <div class="progress-track">
          <div class="progress-fill" style="width:{info.percentUsed}%; background:{meta.bar}"></div>
        </div>
        <div class="progress-labels">
          <span>
            {info.ageYears < 1
              ? `${Math.round(info.ageYears * 12)} mo old`
              : `${info.ageYears.toFixed(1)} yrs old`}
          </span>
          <span>{Math.round(info.percentUsed)}% of {item.expectedLifespan} yr lifespan</span>
        </div>
        <p class="years-remaining" style="color:{meta.bar}">{formatYearsRemaining(info.remainingYears)}</p>
      </div>
    {/if}

    <!-- Key details -->
    <div class="section">
      <h2 class="section-title">Details</h2>
      <dl class="detail-grid">
        {#if isProject}
          <dt>Started</dt>
          <dd>{formatDate(item.purchaseDate)}</dd>
          {#if item.completionDate}
            <dt>Completed</dt>
            <dd>{formatDate(item.completionDate)}</dd>
          {/if}
          {#if item.purchasePrice}
            <dt>{item.completionDate ? 'Estimated Cost' : 'Budget'}</dt>
            <dd>{formatCurrency(item.purchasePrice)}</dd>
          {/if}
          {#if item.finalCost}
            <dt>Final Cost</dt>
            <dd>{formatCurrency(item.finalCost)}</dd>
          {/if}
        {:else}
          <dt>Purchased</dt>
          <dd>{formatDate(item.purchaseDate)}</dd>
          {#if item.purchasePrice}
            <dt>Paid</dt>
            <dd>{formatCurrency(item.purchasePrice)}</dd>
          {/if}
          <dt>Type</dt>
          <dd>{item.type}</dd>
          {#if info.eolDate}
            <dt>Expected EOL</dt>
            <dd>{formatDate(info.eolDate.toISOString())}</dd>
          {/if}
        {/if}
      </dl>
    </div>

    <!-- Photos placeholder -->
    <div class="section placeholder-section">
      <h2 class="section-title">Photos</h2>
      <p class="placeholder-text">Photo uploads coming soon.</p>
    </div>

    <!-- Replacement plan (assets only) -->
    {#if !isProject && item.replacementPlan}
      <div class="section">
        <h2 class="section-title">Replacement Plan</h2>
        <div class="plan-box">
          <div class="plan-row">
            <span class="plan-name">
              {[item.replacementPlan.brand, item.replacementPlan.model].filter(Boolean).join(' ') || 'TBD'}
            </span>
            {#if item.replacementPlan.estimatedCost}
              <span class="plan-cost">{formatCurrency(item.replacementPlan.estimatedCost)}</span>
            {/if}
          </div>
          {#if item.replacementPlan.notes}
            <p class="plan-notes">{item.replacementPlan.notes}</p>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Maintenance log placeholder -->
    <div class="section placeholder-section">
      <h2 class="section-title">Maintenance Log</h2>
      <p class="placeholder-text">Maintenance tracking coming soon.</p>
    </div>

    <!-- Notes -->
    {#if item.notes}
      <div class="section">
        <h2 class="section-title">Notes</h2>
        <p class="notes-text">{item.notes}</p>
      </div>
    {/if}
  </div>
{/if}

<style>
  .not-found {
    text-align: center;
    padding: 4rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  .not-found h2 { font-size: 1.1rem; color: var(--text-1); }
  .not-found p { color: var(--text-2); font-size: 0.9rem; }
  .btn-back {
    background: var(--primary);
    color: #fff;
    padding: 0.5rem 1.25rem;
    border-radius: 7px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .detail-page {
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* Top bar */
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .back-link {
    color: var(--text-3);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .back-link:hover { color: var(--primary); }
  .top-actions { display: flex; gap: 0.5rem; }
  .btn-edit {
    background: none;
    border: 1px solid var(--primary-border);
    color: var(--primary);
    padding: 0.4rem 1rem;
    border-radius: 7px;
    font-size: 0.825rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.12s;
  }
  .btn-edit:hover { background: var(--primary-subtle); }
  .btn-delete {
    background: none;
    border: 1px solid rgba(184,92,92,0.3);
    color: var(--semantic-error);
    padding: 0.4rem 1rem;
    border-radius: 7px;
    font-size: 0.825rem;
    font-weight: 600;
    transition: background 0.12s;
  }
  .btn-delete:hover { background: rgba(184,92,92,0.08); }

  /* Header */
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }
  .cat-badge {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.2rem 0.6rem;
    border-radius: 100px;
    border: 1px solid;
    margin-bottom: 0.4rem;
  }
  .detail-name {
    font-family: var(--font-display);
    font-size: 1.625rem;
    font-weight: 400;
    color: var(--text-1);
  }
  .detail-subtitle {
    font-size: 0.875rem;
    color: var(--text-2);
    margin-top: 0.25rem;
  }
  .status-pill {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
    border: 1px solid;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Sections */
  .section {
    background: var(--surface);
    border-radius: var(--radius-lg);
    padding: 1.125rem 1.25rem;
    border: 1px solid var(--border-dim);
  }
  .section-title {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-3);
    margin-bottom: 0.75rem;
  }

  /* Progress */
  .progress-section { display: flex; flex-direction: column; gap: 0.4rem; }
  .progress-track {
    height: 8px;
    background: var(--border);
    border-radius: 100px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 0.6s ease;
  }
  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    color: var(--text-2);
  }
  .years-remaining {
    font-size: 1rem;
    font-weight: 650;
  }

  /* Detail grid */
  .detail-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.4rem 1rem;
    font-size: 0.875rem;
  }
  dt { color: var(--text-3); font-weight: 500; }
  dd { color: var(--text-1); }

  /* Placeholder */
  .placeholder-section { opacity: 0.6; }
  .placeholder-text { font-size: 0.85rem; color: var(--text-3); font-style: italic; }

  /* Plan */
  .plan-box {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .plan-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
  .plan-name { font-size: 0.9rem; font-weight: 600; color: var(--text-1); }
  .plan-cost { font-size: 0.9rem; font-weight: 700; color: var(--primary); }
  .plan-notes { font-size: 0.825rem; color: var(--text-2); }

  /* Notes */
  .notes-text {
    font-size: 0.875rem;
    color: var(--text-2);
    line-height: 1.5;
  }
</style>
