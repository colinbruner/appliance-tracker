<script>
  import {
    getItemStatus,
    STATUS_META,
    formatYearsRemaining,
    formatCurrency,
    formatDate
  } from '$lib/utils/itemUtils.js';
  import { CATEGORIES } from '$lib/data/itemTypes.js';

  /** @type {{ item: any, ondelete?: (id: any) => void }} */
  let { item, ondelete } = $props();

  let info = $derived(getItemStatus(item));
  let meta = $derived(STATUS_META[info.status]);
  let cat = $derived(CATEGORIES[item.category] ?? CATEGORIES.appliances);
  let isProject = $derived(item.category === 'projects');

  function confirmDelete() {
    if (confirm(`Remove "${item.name || item.type}"?`)) {
      ondelete?.(item.id);
    }
  }
</script>

<article class="card" style="--accent: {meta.bar};">
  <header class="card-header">
    <div>
      <div class="card-meta">
        <span class="cat-dot" style="background: {cat.color};"></span>
        <span class="type-label">{item.type}</span>
      </div>
      <a href="/items/{item.id}" class="name-link">
        <h3 class="name">{item.name || item.type}</h3>
      </a>
      {#if item.brand || item.model}
        <p class="subtitle">{[item.brand, item.model].filter(Boolean).join(' · ')}</p>
      {/if}
    </div>
    <span class="status-pill" style="color:{meta.bar}; border-color:{meta.bar}66; background:{meta.bar}1a">
      {meta.label}
    </span>
  </header>

  {#if !isProject && info.percentUsed != null}
    <div class="progress-section">
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

  {#if isProject}
    <dl class="meta-grid">
      <dt>Started</dt>
      <dd>{formatDate(item.purchaseDate)}</dd>
      {#if item.completionDate}
        <dt>Completed</dt>
        <dd>{formatDate(item.completionDate)}</dd>
      {/if}
      {#if item.purchasePrice}
        <dt>{item.completionDate ? 'Estimated' : 'Budget'}</dt>
        <dd>{formatCurrency(item.purchasePrice)}</dd>
      {/if}
      {#if item.finalCost}
        <dt>Final Cost</dt>
        <dd>{formatCurrency(item.finalCost)}</dd>
      {/if}
    </dl>
  {:else}
    <dl class="meta-grid">
      <dt>Purchased</dt>
      <dd>{formatDate(item.purchaseDate)}</dd>
      {#if item.purchasePrice}
        <dt>Paid</dt>
        <dd>{formatCurrency(item.purchasePrice)}</dd>
      {/if}
      {#if info.eolDate}
        <dt>Expected EOL</dt>
        <dd>{formatDate(info.eolDate.toISOString())}</dd>
      {/if}
    </dl>
  {/if}

  {#if item.notes}
    <p class="notes">{item.notes}</p>
  {/if}

  <footer class="card-footer">
    <a href="/items/{item.id}" class="btn-sm">View</a>
    <a href="/items/{item.id}/edit" class="btn-sm btn-edit">Edit</a>
    {#if ondelete}
      <button class="btn-sm btn-danger" onclick={confirmDelete}>Remove</button>
    {/if}
  </footer>
</article>

<style>
  .card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    border-left: 4px solid var(--accent);
    padding: 1.125rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s;
  }
  .card:hover { box-shadow: var(--shadow-md); }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.15rem;
  }
  .cat-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .type-label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-3);
  }

  .name-link {
    text-decoration: none;
    color: inherit;
  }
  .name-link:hover .name { color: var(--primary); }

  .name {
    font-size: 1rem;
    font-weight: 650;
    color: var(--text-1);
    line-height: 1.3;
    transition: color 0.12s;
  }

  .subtitle {
    font-size: 0.78rem;
    color: var(--text-2);
    margin-top: 0.15rem;
  }

  .status-pill {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.2rem 0.65rem;
    border-radius: 100px;
    border: 1px solid;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 0.15rem;
  }

  /* Progress */
  .progress-section { display: flex; flex-direction: column; gap: 0.35rem; }
  .progress-track {
    height: 7px;
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
    font-size: 0.72rem;
    color: var(--text-2);
  }
  .years-remaining {
    font-size: 0.875rem;
    font-weight: 650;
  }

  /* Meta */
  .meta-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.2rem 0.75rem;
    font-size: 0.75rem;
  }
  dt { color: var(--text-3); }
  dd { color: var(--text-2); }

  .notes {
    font-size: 0.78rem;
    color: var(--text-2);
    font-style: italic;
  }

  /* Footer */
  .card-footer {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-dim);
    margin-top: 0.25rem;
  }

  .btn-sm {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-2);
    padding: 0.325rem 0.75rem;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.12s, border-color 0.12s;
  }
  .btn-sm:hover { background: var(--surface-2); border-color: var(--text-3); }

  .btn-edit { color: var(--primary); border-color: var(--primary-border); }
  .btn-edit:hover { background: var(--primary-subtle); border-color: var(--primary); }

  .btn-danger { margin-left: auto; color: var(--semantic-error); border-color: rgba(184,92,92,0.3); }
  .btn-danger:hover { background: rgba(184,92,92,0.08); border-color: var(--semantic-error); }
</style>
