<script>
  import { onMount } from 'svelte';
  import { themeStore } from '$lib/stores/theme.js';

  let { children } = $props();

  onMount(() => {
    themeStore.init();
  });

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = $themeStore;
    }
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
</svelte:head>

{@render children()}

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
</style>
