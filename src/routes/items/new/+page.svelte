<script>
  import { goto } from '$app/navigation';
  import { itemStore } from '$lib/stores/items.js';
  import { CATEGORIES } from '$lib/data/itemTypes.js';
  import ItemForm from '$lib/components/ItemForm.svelte';

  let lastSaved = $state(null);
  let formKey = $state(0);
  let prefill = $state(null);

  function handleSave(data) {
    itemStore.add(data);
    lastSaved = { name: data.name || data.type, category: data.category, type: data.type };
  }

  function addAnother() {
    prefill = { category: lastSaved.category, type: lastSaved.type };
    lastSaved = null;
    formKey++;
  }

  function handleCancel() {
    history.back();
  }
</script>

<svelte:head>
  <title>Add Item — HomeBase</title>
</svelte:head>

<div class="form-page">
  <a href="/items" class="back-link">← Items</a>

  {#if lastSaved}
    <div class="saved-banner">
      <div class="saved-icon">✓</div>
      <p class="saved-text">
        <strong>{lastSaved.name}</strong> saved to {CATEGORIES[lastSaved.category]?.label ?? lastSaved.category}.
      </p>
      <div class="saved-actions">
        <button class="btn-another" onclick={addAnother}>Add Another</button>
        <a href="/items" class="btn-done">Done</a>
      </div>
    </div>
  {:else}
    <div class="form-card">
      <h2 class="form-heading">Add New Item</h2>
      {#key formKey}
        <ItemForm item={prefill} onsave={handleSave} oncancel={handleCancel} />
      {/key}
    </div>
  {/if}
</div>

<style>
  .form-page {
    max-width: 640px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .back-link {
    color: var(--text-3);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .back-link:hover { color: var(--primary); }
  .form-card {
    background: var(--surface);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-dim);
  }
  .form-heading {
    font-family: var(--font-display);
    font-size: 1.375rem;
    font-weight: 400;
    color: var(--text-1);
    margin-bottom: 1.25rem;
  }

  /* Saved banner */
  .saved-banner {
    background: var(--surface);
    border-radius: var(--radius-xl);
    padding: 2rem 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--primary-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
  }
  .saved-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary-subtle);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
  }
  .saved-text {
    font-size: 0.9rem;
    color: var(--text-2);
  }
  .saved-text strong {
    color: var(--text-1);
  }
  .saved-actions {
    display: flex;
    gap: 0.75rem;
  }
  .btn-another {
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 0.575rem 1.375rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background 0.15s;
  }
  .btn-another:hover { background: var(--primary-hover); }
  .btn-done {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-2);
    padding: 0.575rem 1.375rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 550;
    text-decoration: none;
    transition: background 0.12s;
  }
  .btn-done:hover { background: var(--surface-2); }
</style>
