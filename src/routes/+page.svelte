<script>
  import { itemStore } from '$lib/stores/items.js';
  import { themeStore } from '$lib/stores/theme.js';
  import { getItemStatus, formatCurrency } from '$lib/utils/itemUtils.js';
  import { CATEGORIES } from '$lib/data/itemTypes.js';
  import Timeline from '$lib/components/Timeline.svelte';

  let items = $derived($itemStore);

  let stats = $derived((() => {
    const statuses = items.map(a => ({ item: a, ...getItemStatus(a) }));
    const needsAttention = statuses.filter(s => s.status === 'overdue' || s.status === 'critical');
    const dueWithin1yr = statuses.filter(s => s.status === 'critical');
    const totalInvested = items.reduce((sum, a) => sum + (a.purchasePrice ?? 0), 0);
    const totalPlanned = items.reduce((sum, a) => sum + (a.replacementPlan?.estimatedCost ?? 0), 0);
    return {
      total: items.length,
      needsAttention: needsAttention.length,
      dueWithin1yr: dueWithin1yr.length,
      totalInvested,
      totalPlanned,
      attentionItems: needsAttention.sort((a, b) => a.remainingYears - b.remainingYears),
    };
  })());

  // Asset items for timeline (projects don't have lifespans)
  let assetItems = $derived(items.filter(i => i.category !== 'projects'));

  // Per-category cost breakdown
  let categoryCosts = $derived((() => {
    const costs = {};
    for (const item of items) {
      const cat = item.category || 'appliances';
      if (!costs[cat]) costs[cat] = { total: 0, count: 0 };
      costs[cat].count++;
      costs[cat].total += item.purchasePrice ?? 0;
    }
    return Object.entries(CATEGORIES)
      .map(([id, meta]) => ({ id, ...meta, ...(costs[id] ?? { total: 0, count: 0 }) }))
      .filter(c => c.count > 0);
  })());
</script>

<svelte:head>
  <title>Dashboard — HomeBase</title>
</svelte:head>

<div class="dashboard">
  <!-- Stats -->
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-value">{stats.total}</span>
      <span class="stat-label">Total Items</span>
    </div>
    <div class="stat-card stat-attention" class:active={stats.needsAttention > 0}>
      <span class="stat-value">{stats.needsAttention}</span>
      <span class="stat-label">Needs Attention</span>
    </div>
    <div class="stat-card stat-critical" class:active={stats.dueWithin1yr > 0}>
      <span class="stat-value">{stats.dueWithin1yr}</span>
      <span class="stat-label">Due Within 1 Yr</span>
    </div>
    {#if stats.totalInvested > 0}
      <div class="stat-card stat-invested">
        <span class="stat-value">{formatCurrency(stats.totalInvested)}</span>
        <span class="stat-label">Total Invested</span>
      </div>
    {/if}
    {#if stats.totalPlanned > 0}
      <div class="stat-card stat-planned">
        <span class="stat-value">{formatCurrency(stats.totalPlanned)}</span>
        <span class="stat-label">Planned Costs</span>
      </div>
    {/if}
  </div>

  <!-- Cost by Category -->
  {#if categoryCosts.length > 1 && stats.totalInvested > 0}
    <section class="card-section">
      <h2 class="section-heading">Cost by Category</h2>
      <div class="cost-breakdown">
        {#each categoryCosts as cat}
          {#if cat.total > 0}
            <div class="cost-row">
              <span class="cost-dot" style="background: {cat.color};"></span>
              <span class="cost-cat">{cat.label}</span>
              <span class="cost-count">{cat.count} {cat.count === 1 ? 'item' : 'items'}</span>
              <span class="cost-amount" style="color: {cat.color};">{formatCurrency(cat.total)}</span>
            </div>
          {/if}
        {/each}
      </div>
    </section>
  {/if}

  <!-- Needs Attention -->
  <section class="card-section">
    <h2 class="section-heading">Needs Attention</h2>
    {#if stats.attentionItems.length === 0}
      <div class="all-clear">
        <p class="all-clear-text">All {stats.total} items are in good shape.</p>
        {#if assetItems.length > 0}
          {@const nextUp = [...assetItems]
            .map(i => ({ item: i, ...getItemStatus(i) }))
            .filter(s => s.remainingYears != null && s.remainingYears > 0)
            .sort((a, b) => a.remainingYears - b.remainingYears)[0]}
          {#if nextUp}
            <p class="next-up">
              Next up: <a href="/items/{nextUp.item.id}">{nextUp.item.name || nextUp.item.type}</a>
              — {nextUp.remainingYears < 1
                ? `${Math.round(nextUp.remainingYears * 12)} months`
                : `${nextUp.remainingYears.toFixed(1)} years`}
            </p>
          {/if}
        {/if}
      </div>
    {:else}
      <div class="attention-list">
        {#each stats.attentionItems as entry}
          <a href="/items/{entry.item.id}" class="attention-row">
            <span class="attention-name">{entry.item.name || entry.item.type}</span>
            <span class="attention-type">{entry.item.type}</span>
            <span class="attention-status" class:overdue={entry.status === 'overdue'} class:critical={entry.status === 'critical'}>
              {entry.status === 'overdue'
                ? `${Math.abs(entry.remainingYears).toFixed(1)} yrs overdue`
                : `${(entry.remainingYears * 12).toFixed(0)} mo left`}
            </span>
          </a>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Timeline -->
  {#if assetItems.length > 0}
    <section class="card-section">
      <h2 class="section-heading">Lifespan Timeline</h2>
      <p class="section-sub">Each bar spans from purchase date to expected end-of-life. Dashed line = today.</p>
      <Timeline appliances={assetItems} isDark={$themeStore === 'dark'} />
    </section>
  {/if}

  <!-- Empty state -->
  {#if items.length === 0}
    <div class="empty-state">
      <p>No items tracked yet.</p>
      <a href="/items/new" class="btn-primary">Add your first item</a>
    </div>
  {/if}
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  /* Stats */
  .stats-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
  }
  .stat-card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    padding: 0.875rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-dim);
    min-width: 120px;
    transition: border-color 0.2s;
  }
  .stat-value {
    font-family: var(--font-display);
    font-size: 1.625rem;
    font-weight: 400;
    color: var(--text-1);
    line-height: 1;
  }
  .stat-label {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-3);
  }
  .stat-attention.active  { border-color: var(--status-overdue); }
  .stat-attention.active .stat-value { color: var(--status-overdue); }
  .stat-critical.active { border-color: var(--status-critical); }
  .stat-critical.active .stat-value { color: var(--status-critical); }
  .stat-invested .stat-value { color: var(--primary); font-size: 1.25rem; }
  .stat-planned .stat-value { color: var(--cat-appliances); font-size: 1.25rem; }

  /* Sections */
  .card-section {
    background: var(--surface);
    border-radius: var(--radius-xl);
    padding: 1.375rem 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-dim);
  }
  .section-heading {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-1);
    margin-bottom: 0.75rem;
  }
  .section-sub {
    font-size: 0.78rem;
    color: var(--text-3);
    margin-top: -0.5rem;
    margin-bottom: 1rem;
  }

  /* Cost by Category */
  .cost-breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .cost-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.25rem;
  }
  .cost-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .cost-cat {
    font-size: 0.875rem;
    font-weight: 550;
    color: var(--text-1);
    flex: 1;
  }
  .cost-count {
    font-size: 0.75rem;
    color: var(--text-3);
  }
  .cost-amount {
    font-size: 0.9rem;
    font-weight: 650;
    min-width: 70px;
    text-align: right;
  }

  /* Needs Attention */
  .all-clear { padding: 1.5rem 0 0.5rem; }
  .all-clear-text {
    font-size: 0.9rem;
    color: var(--text-2);
  }
  .next-up {
    font-size: 0.825rem;
    color: var(--text-3);
    margin-top: 0.35rem;
  }
  .next-up a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 550;
  }
  .next-up a:hover { text-decoration: underline; }

  .attention-list {
    display: flex;
    flex-direction: column;
  }
  .attention-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-dim);
    text-decoration: none;
    transition: background 0.12s;
    border-radius: var(--radius-sm);
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .attention-row:last-child { border-bottom: none; }
  .attention-row:hover { background: var(--surface-2); }
  .attention-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-1);
    flex: 1;
  }
  .attention-type {
    font-size: 0.75rem;
    color: var(--text-3);
  }
  .attention-status {
    font-size: 0.75rem;
    font-weight: 650;
    white-space: nowrap;
  }
  .attention-status.overdue { color: var(--status-overdue); }
  .attention-status.critical { color: var(--status-critical); }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 4rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .empty-state p {
    color: var(--text-2);
    font-size: 0.9rem;
  }
  .btn-primary {
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s;
  }
  .btn-primary:hover { background: var(--primary-hover); }
</style>
