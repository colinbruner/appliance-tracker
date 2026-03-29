<script>
  import {
    getApplianceStatus,
    STATUS_META,
    formatYearsRemaining,
    formatCurrency,
    formatDate
  } from '$lib/utils/applianceUtils.js';

  /** @type {{ appliance: any, onedit: (detail: { appliance: any, focusReplacement: boolean }) => void, ondelete: (id: any) => void }} */
  let { appliance, onedit, ondelete } = $props();

  let info = $derived(getApplianceStatus(appliance));
  let meta = $derived(STATUS_META[info.status]);

  function confirmDelete() {
    if (confirm(`Remove "${appliance.name || appliance.type}"?`)) {
      ondelete(appliance.id);
    }
  }
</script>

<article class="card" style="--accent: {meta.bar};">
  <header class="card-header">
    <div>
      <span class="type-label">{appliance.type}</span>
      <h3 class="name">{appliance.name || appliance.type}</h3>
      {#if appliance.brand || appliance.model}
        <p class="subtitle">{[appliance.brand, appliance.model].filter(Boolean).join(' · ')}</p>
      {/if}
    </div>
    <span class="status-pill" style="color:{meta.bar}; border-color:{meta.bar}66; background:{meta.bar}1a">
      {meta.label}
    </span>
  </header>

  <!-- Lifespan progress -->
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
      <span>{Math.round(info.percentUsed)}% of {appliance.expectedLifespan} yr lifespan</span>
    </div>
    <p class="years-remaining" style="color:{meta.bar}">{formatYearsRemaining(info.remainingYears)}</p>
  </div>

  <!-- Key dates -->
  <dl class="meta-grid">
    <dt>Purchased</dt>
    <dd>{formatDate(appliance.purchaseDate)}</dd>

    {#if appliance.purchasePrice}
      <dt>Paid</dt>
      <dd>{formatCurrency(appliance.purchasePrice)}</dd>
    {/if}

    <dt>Expected EOL</dt>
    <dd>{formatDate(info.eolDate.toISOString())}</dd>
  </dl>

  {#if appliance.replacementPlan}
    <div class="plan-box">
      <span class="plan-label">Replacement Plan</span>
      <div class="plan-row">
        <span class="plan-name">
          {[appliance.replacementPlan.brand, appliance.replacementPlan.model].filter(Boolean).join(' ') || 'TBD'}
        </span>
        {#if appliance.replacementPlan.estimatedCost}
          <span class="plan-cost">{formatCurrency(appliance.replacementPlan.estimatedCost)}</span>
        {/if}
      </div>
      {#if appliance.replacementPlan.notes}
        <p class="plan-notes">{appliance.replacementPlan.notes}</p>
      {/if}
    </div>
  {/if}

  {#if appliance.notes}
    <p class="notes">{appliance.notes}</p>
  {/if}

  <footer class="card-footer">
    <button class="btn-sm" onclick={() => onedit({ appliance, focusReplacement: false })}>
      Edit
    </button>
    <button class="btn-sm btn-plan" onclick={() => onedit({ appliance, focusReplacement: true })}>
      {appliance.replacementPlan ? 'Update Plan' : 'Add Plan'}
    </button>
    <button class="btn-sm btn-danger" onclick={confirmDelete}>Remove</button>
  </footer>
</article>

<style>
  .card {
    background: var(--surface);
    border-radius: 12px;
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

  .type-label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-3);
  }

  .name {
    font-size: 1rem;
    font-weight: 650;
    color: var(--text-1);
    margin-top: 0.1rem;
    line-height: 1.3;
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

  /* Replacement plan */
  .plan-box {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.625rem 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .plan-label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-3);
  }
  .plan-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
  .plan-name { font-size: 0.875rem; font-weight: 600; color: var(--text-1); }
  .plan-cost { font-size: 0.875rem; font-weight: 700; color: var(--primary); }
  .plan-notes { font-size: 0.75rem; color: var(--text-2); }

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
    transition: background 0.12s, border-color 0.12s;
  }
  .btn-sm:hover { background: var(--surface-2); border-color: var(--text-3); }

  .btn-plan { color: var(--primary); border-color: var(--primary-border); }
  .btn-plan:hover { background: var(--primary-subtle); border-color: var(--primary); }

  .btn-danger { margin-left: auto; color: #ef4444; border-color: #fecaca; }
  .btn-danger:hover { background: rgba(239,68,68,0.08); border-color: #ef4444; }
</style>
