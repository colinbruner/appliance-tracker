<script>
  import { onMount } from 'svelte';
  import { applianceStore } from '$lib/stores/appliances.js';
  import { themeStore } from '$lib/stores/theme.js';
  import { currentUser, authLoading, initAuth, login, isOidcConfigured } from '$lib/stores/auth.js';
  import { getApplianceStatus, formatCurrency } from '$lib/utils/applianceUtils.js';
  import Timeline from '$lib/components/Timeline.svelte';
  import ApplianceCard from '$lib/components/ApplianceCard.svelte';
  import ApplianceForm from '$lib/components/ApplianceForm.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import AuthButton from '$lib/components/AuthButton.svelte';

  let showForm = false;
  let editingAppliance = null;
  let focusReplacement = false;

  onMount(() => {
    initAuth();
  });

  // Set user namespace whenever currentUser changes
  $: applianceStore.setUser($currentUser?.profile?.sub ?? null, $currentUser?.id_token ?? null);

  $: appliances = $applianceStore;

  $: stats = (() => {
    const statuses = appliances.map(a => getApplianceStatus(a));
    const overdue  = statuses.filter(s => s.status === 'overdue').length;
    const critical = statuses.filter(s => s.status === 'critical').length;
    const warning  = statuses.filter(s => s.status === 'warning').length;
    const good     = statuses.filter(s => s.status === 'good').length;
    const totalReplacementCost = appliances.reduce((sum, a) => {
      return sum + (a.replacementPlan?.estimatedCost ?? 0);
    }, 0);
    return { total: appliances.length, overdue, critical, warning, good, totalReplacementCost };
  })();

  function openAdd() {
    editingAppliance = null;
    focusReplacement = false;
    showForm = true;
  }

  /** @param {{ appliance: any, focusReplacement: boolean }} detail */
  function openEdit({ appliance, focusReplacement: fr }) {
    editingAppliance = appliance;
    focusReplacement = fr;
    showForm = true;
  }

  function handleSave(event) {
    const data = event.detail;
    if (editingAppliance) {
      applianceStore.edit(editingAppliance.id, data);
    } else {
      applianceStore.add(data);
    }
    closeForm();
  }

  function handleDelete(event) {
    applianceStore.remove(event.detail);
  }

  function closeForm() {
    showForm = false;
    editingAppliance = null;
    focusReplacement = false;
  }
</script>

<svelte:head>
  <title>Appliance Tracker</title>
</svelte:head>

{#if $authLoading}
  <!-- Loading spinner -->
  <div class="loading-page">
    <div class="spinner"></div>
  </div>

{:else if isOidcConfigured() && !$currentUser}
  <!-- Login page -->
  <div class="login-page">
    <div class="login-theme-corner">
      <ThemeToggle />
    </div>
    <div class="login-card">
      <div class="login-brand">
        <h1 class="login-title">Appliance Tracker</h1>
        <p class="login-sub">Monitor lifespans, plan replacements, budget ahead</p>
      </div>

      <ul class="feature-list">
        <li>
          <span class="feat-icon">&#9881;</span>
          <span>Track appliance lifespans and get ahead of failures</span>
        </li>
        <li>
          <span class="feat-icon">&#128197;</span>
          <span>Plan replacements before appliances reach end-of-life</span>
        </li>
        <li>
          <span class="feat-icon">&#128176;</span>
          <span>Budget for future replacement costs in one place</span>
        </li>
      </ul>

      <button class="login-btn" on:click={login}>Sign In</button>
    </div>
  </div>

{:else}
  <!-- Main app -->
  <div class="app">
    <header class="header">
      <div class="header-inner">
        <div class="brand">
          <h1>Appliance Tracker</h1>
          <p>Monitor, plan, budget</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" on:click={openAdd}>+ Add Appliance</button>
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>

    <main class="main">
      <!-- Stats row -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{stats.total}</span>
          <span class="stat-label">Total Appliances</span>
        </div>
        <div class="stat-card stat-overdue" class:active={stats.overdue > 0}>
          <span class="stat-value">{stats.overdue}</span>
          <span class="stat-label">Overdue</span>
        </div>
        <div class="stat-card stat-critical" class:active={stats.critical > 0}>
          <span class="stat-value">{stats.critical}</span>
          <span class="stat-label">Replace Soon</span>
        </div>
        <div class="stat-card stat-warning" class:active={stats.warning > 0}>
          <span class="stat-value">{stats.warning}</span>
          <span class="stat-label">Due Within 3 Yrs</span>
        </div>
        {#if stats.totalReplacementCost > 0}
          <div class="stat-card stat-cost">
            <span class="stat-value">{formatCurrency(stats.totalReplacementCost)}</span>
            <span class="stat-label">Planned Replacement Cost</span>
          </div>
        {/if}
      </div>

      <!-- Timeline -->
      <section class="card-section">
        <h2 class="section-heading">Lifespan Timeline</h2>
        <p class="section-sub">Each bar spans from purchase date to expected end-of-life. Dashed line = today.</p>
        <Timeline {appliances} isDark={$themeStore === 'dark'} />
      </section>

      <!-- Appliance cards -->
      <section class="card-section">
        <div class="section-heading-row">
          <h2 class="section-heading">Your Appliances</h2>
          <button class="btn-add-sm" on:click={openAdd}>+ Add</button>
        </div>

        {#if appliances.length === 0}
          <div class="empty-state">
            <p>No appliances yet.</p>
            <button class="btn-primary" on:click={openAdd}>Add your first appliance</button>
          </div>
        {:else}
          <div class="cards-grid">
            {#each appliances as appliance (appliance.id)}
              <ApplianceCard
                {appliance}
                on:edit={(e) => openEdit(e.detail)}
                on:delete={handleDelete}
              />
            {/each}
          </div>
        {/if}
      </section>
    </main>
  </div>

  {#if showForm}
    <ApplianceForm
      appliance={editingAppliance}
      {focusReplacement}
      on:save={handleSave}
      on:cancel={closeForm}
    />
  {/if}
{/if}

<style>
  /* Loading */
  .loading-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
  }
  .spinner {
    width: 36px; height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Login page */
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    padding: 1.5rem;
    position: relative;
  }
  .login-theme-corner {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
  }
  .login-card {
    background: var(--surface);
    border-radius: 16px;
    padding: 2.5rem 2rem;
    max-width: 400px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.75rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
  }
  .login-brand {
    text-align: center;
  }
  .login-title {
    font-size: 1.625rem;
    font-weight: 800;
    color: var(--text-1);
    letter-spacing: -0.01em;
  }
  .login-sub {
    font-size: 0.85rem;
    color: var(--text-2);
    margin-top: 0.4rem;
  }
  .feature-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    width: 100%;
  }
  .feature-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: var(--text-2);
  }
  .feat-icon {
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 0.05rem;
  }
  .login-btn {
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 0.7rem 2.25rem;
    border-radius: 9px;
    font-size: 0.925rem;
    font-weight: 600;
    transition: background 0.15s;
    width: 100%;
  }
  .login-btn:hover { background: var(--primary-hover); }

  /* App layout */
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .header {
    background: var(--header-bg);
    color: #fff;
    padding: 1.5rem 0;
    box-shadow: var(--shadow-md);
  }
  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .brand h1 {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  .brand p {
    font-size: 0.8rem;
    opacity: 0.8;
    margin-top: 0.2rem;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-wrap: wrap;
  }

  /* Main */
  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.75rem 1.5rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    width: 100%;
  }

  /* Stats */
  .stats-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
  }
  .stat-card {
    background: var(--surface);
    border-radius: 10px;
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
    font-size: 1.625rem;
    font-weight: 800;
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
  .stat-overdue.active  { border-color: #ef4444; }
  .stat-overdue.active .stat-value { color: #ef4444; }
  .stat-critical.active { border-color: #f97316; }
  .stat-critical.active .stat-value { color: #f97316; }
  .stat-warning.active  { border-color: #f59e0b; }
  .stat-warning.active .stat-value { color: #f59e0b; }
  .stat-cost .stat-value { color: var(--primary); font-size: 1.25rem; }

  /* Sections */
  .card-section {
    background: var(--surface);
    border-radius: 14px;
    padding: 1.375rem 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-dim);
  }
  .section-heading {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-1);
    margin-bottom: 0.2rem;
  }
  .section-sub {
    font-size: 0.78rem;
    color: var(--text-3);
    margin-bottom: 1rem;
  }
  .section-heading-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  /* Cards grid */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  /* Buttons */
  .btn-add {
    background: rgba(255,255,255,0.15);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,0.5);
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .btn-add:hover { background: rgba(255,255,255,0.25); }

  .btn-add-sm {
    background: none;
    border: 1px solid var(--primary-border);
    color: var(--primary);
    padding: 0.3rem 0.875rem;
    border-radius: 7px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  .btn-add-sm:hover { background: var(--primary-subtle); }

  .btn-primary {
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background 0.15s;
  }
  .btn-primary:hover { background: var(--primary-hover); }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .empty-state p {
    color: var(--text-2);
    font-size: 0.9rem;
  }

  @media (max-width: 600px) {
    .header-inner { flex-direction: column; align-items: flex-start; }
    .main { padding: 1rem 1rem 2rem; }
    .cards-grid { grid-template-columns: 1fr; }
  }
</style>
