<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { itemStore } from '$lib/stores/items.js';
  import ItemForm from '$lib/components/ItemForm.svelte';

  let items = $derived($itemStore);
  let item = $derived(items.find(i => i.id === $page.params.id));

  function handleSave(data) {
    if (!item) return;
    itemStore.edit(item.id, data);
    goto(`/items/${item.id}`);
  }

  function handleCancel() {
    history.back();
  }
</script>

<svelte:head>
  <title>Edit {item ? (item.name || item.type) : 'Item'} — HomeBase</title>
</svelte:head>

{#if !item}
  <div class="not-found">
    <h2>Item not found</h2>
    <p>This item may have been removed.</p>
    <a href="/items" class="btn-back">Back to Items</a>
  </div>
{:else}
  <div class="form-page">
    <a href="/items/{item.id}" class="back-link">← Back to {item.name || item.type}</a>
    <div class="form-card">
      <h2 class="form-heading">Edit {item.name || item.type}</h2>
      <ItemForm {item} onsave={handleSave} oncancel={handleCancel} />
    </div>
  </div>
{/if}

<style>
  .not-found {
    text-align: center;
    padding: 4rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  .not-found h2 { font-size: 1.1rem; color: var(--text-1); }
  .not-found p { color: var(--text-2); font-size: 0.9rem; }
  .btn-back {
    background: var(--primary);
    color: #fff;
    padding: 0.5rem 1.25rem;
    border-radius: 7px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
  }

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
</style>
