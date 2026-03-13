<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { handleCallback } from '$lib/stores/auth.js';

  let error = null;

  onMount(async () => {
    try {
      await handleCallback();
      goto('/');
    } catch (e) {
      error = e.message;
    }
  });
</script>

<div class="page">
  {#if error}
    <div class="card">
      <h2>Authentication Error</h2>
      <p>{error}</p>
      <a href="/" class="btn">Go Home</a>
    </div>
  {:else}
    <div class="card">
      <div class="spinner"></div>
      <p>Completing sign in...</p>
    </div>
  {/if}
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
  }
  .card {
    background: var(--surface);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    box-shadow: var(--shadow-md);
  }
  h2 { color: var(--text-1); font-size: 1.1rem; }
  p { color: var(--text-2); font-size: 0.9rem; }
  .btn {
    background: var(--primary);
    color: #fff;
    padding: 0.5rem 1.25rem;
    border-radius: 7px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
  }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
