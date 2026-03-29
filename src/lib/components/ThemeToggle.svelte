<script>
  import { themeStore } from '$lib/stores/theme.js';
</script>

<button class="toggle" onclick={themeStore.toggle} title="Toggle theme">
  {#if $themeStore === 'dark'}
    <span class="icon">&#9728;</span> Light
  {:else}
    <span class="icon">&#9790;</span> Dark
  {/if}
</button>

<style>
  .toggle {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.9);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 0.4rem 0.875rem;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
    transition: background 0.15s;
  }
  .toggle:hover { background: rgba(255,255,255,0.2); }
  .icon { font-size: 0.9rem; }
</style>
