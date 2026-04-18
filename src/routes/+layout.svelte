<script>
  import { onMount } from 'svelte';
  import { themeStore } from '$lib/stores/theme.js';
  import { itemStore } from '$lib/stores/items.js';
  import { currentUser, authLoading, initAuth, login, isOidcConfigured } from '$lib/stores/auth.js';
  import Nav from '$lib/components/Nav.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';

  let { children } = $props();
  let viewDemo = $state(false);

  onMount(() => {
    themeStore.init();
    initAuth();
  });

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = $themeStore;
    }
  });

  $effect(() => {
    itemStore.setUser($currentUser?.profile?.sub ?? null, $currentUser?.id_token ?? null);
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
</svelte:head>

{#if $authLoading}
  <div class="loading-page">
    <div class="spinner"></div>
  </div>

{:else if isOidcConfigured() && !$currentUser && !viewDemo}
  <div class="login-page">
    <div class="login-theme-corner">
      <ThemeToggle />
    </div>
    <div class="login-card">
      <div class="login-brand">
        <h1 class="login-title">HomeBase</h1>
        <p class="login-sub">Track your home. Plan ahead. Stay on top of it all.</p>
      </div>

      <ul class="feature-list">
        <li>
          <span class="feat-icon">&#9881;</span>
          <span>Track lifespans for appliances, systems, and structure</span>
        </li>
        <li>
          <span class="feat-icon">&#128197;</span>
          <span>Plan replacements before things reach end-of-life</span>
        </li>
        <li>
          <span class="feat-icon">&#128176;</span>
          <span>Budget for future costs in one place</span>
        </li>
      </ul>

      <button class="login-btn" onclick={login}>Sign In</button>
      <button class="demo-btn" onclick={() => viewDemo = true}>View Demo</button>
    </div>
  </div>

{:else}
  <div class="app">
    <Nav />
    <main class="main-content">
      {@render children()}
    </main>
  </div>
{/if}

<style>
  :global(:root) {
    /* Fonts */
    --font-display: 'Instrument Serif', Georgia, serif;
    --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

    /* Light mode (default) */
    --bg: #FAF8F5;
    --surface: #FFFFFF;
    --surface-2: #F5F2ED;
    --surface-input: #FAF8F5;
    --border: #E8E2D9;
    --border-dim: #F0EDE8;
    --text-1: #2D2A26;
    --text-2: #6B6560;
    --text-3: #9C9590;
    --primary: #5A7C65;
    --primary-hover: #4A6B55;
    --primary-subtle: rgba(90,124,101,0.08);
    --primary-border: rgba(90,124,101,0.25);

    /* Category */
    --cat-appliances: #C4915C;
    --cat-structure: #A67B5B;
    --cat-systems: #5A8C84;
    --cat-projects: #8B7396;

    /* Status */
    --status-good: #5A7C65;
    --status-warning: #C4915C;
    --status-critical: #C4735C;
    --status-overdue: #B85C5C;

    /* Semantic */
    --semantic-success: #5A7C65;
    --semantic-info: #5A8C84;
    --semantic-warning: #C4915C;
    --semantic-error: #B85C5C;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(45,42,38,0.06);
    --shadow-md: 0 4px 12px rgba(45,42,38,0.08);
    --shadow-lg: 0 16px 40px rgba(45,42,38,0.12);

    /* Radius */
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-full: 9999px;
  }

  :global([data-theme="dark"]) {
    --bg: #1C1A17;
    --surface: #2A2722;
    --surface-2: #34312C;
    --surface-input: #2A2722;
    --border: #3D3A36;
    --border-dim: #2A2722;
    --text-1: #F0EDE8;
    --text-2: #9C9590;
    --text-3: #6B6560;
    --primary: #7DA08A;
    --primary-hover: #8DB09A;
    --primary-subtle: rgba(125,160,138,0.12);
    --primary-border: rgba(125,160,138,0.3);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
    --shadow-lg: 0 16px 40px rgba(0,0,0,0.5);
  }

  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text-1);
    min-height: 100vh;
    transition: background 0.25s ease-in-out, color 0.25s ease-in-out;
  }

  :global(button) { cursor: pointer; font-family: inherit; }
  :global(input, select, textarea) { font-family: inherit; }

  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      transition-duration: 0ms !important;
    }
  }

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
  .login-theme-corner { position: absolute; top: 1.25rem; right: 1.25rem; }
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
  .login-brand { text-align: center; }
  .login-title {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 400;
    color: var(--text-1);
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
  .feat-icon { font-size: 1rem; flex-shrink: 0; margin-top: 0.05rem; }
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
  .demo-btn {
    background: none;
    color: var(--text-3);
    border: none;
    font-size: 0.825rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    padding: 0;
  }
  .demo-btn:hover { color: var(--text-2); }

  /* App shell */
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.75rem 1.5rem 3rem;
    width: 100%;
    flex: 1;
  }

  @media (max-width: 600px) {
    .main-content { padding: 1rem 1rem 2rem; }
  }
</style>
