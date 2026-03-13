<script>
  import { onMount } from 'svelte';
  import { themeStore } from '$lib/stores/theme.js';

  onMount(() => {
    themeStore.init();
  });

  $: if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = $themeStore;
  }
</script>

<slot />

<style>
  :global(:root) {
    /* Dark theme (default) */
    --bg:            #0f172a;
    --surface:       #1e293b;
    --surface-2:     #263348;
    --surface-input: #1a2844;
    --border:        #334155;
    --border-dim:    #1e293b;
    --text-1:        #f1f5f9;
    --text-2:        #94a3b8;
    --text-3:        #64748b;
    --primary:       #818cf8;
    --primary-hover: #a5b4fc;
    --primary-subtle:rgba(129,140,248,0.12);
    --primary-border:rgba(129,140,248,0.3);
    --header-bg:     linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%);
    --shadow-sm:     0 1px 3px rgba(0,0,0,0.4);
    --shadow-md:     0 4px 14px rgba(0,0,0,0.5);
    --shadow-lg:     0 24px 48px rgba(0,0,0,0.6);
  }

  :global([data-theme="light"]) {
    --bg:            #f1f5f9;
    --surface:       #ffffff;
    --surface-2:     #f8fafc;
    --surface-input: #fafafa;
    --border:        #e2e8f0;
    --border-dim:    #f1f5f9;
    --text-1:        #0f172a;
    --text-2:        #64748b;
    --text-3:        #94a3b8;
    --primary:       #6366f1;
    --primary-hover: #4f46e5;
    --primary-subtle:rgba(99,102,241,0.08);
    --primary-border:rgba(99,102,241,0.25);
    --header-bg:     linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    --shadow-sm:     0 1px 3px rgba(0,0,0,0.07);
    --shadow-md:     0 4px 12px rgba(0,0,0,0.1);
    --shadow-lg:     0 24px 48px rgba(0,0,0,0.2);
  }

  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    background: var(--bg);
    color: var(--text-1);
    min-height: 100vh;
    transition: background 0.2s, color 0.2s;
  }

  :global(button) { cursor: pointer; font-family: inherit; }
  :global(input, select, textarea) { font-family: inherit; }
</style>
