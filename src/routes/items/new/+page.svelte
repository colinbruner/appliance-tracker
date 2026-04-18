<script>
  import { goto } from '$app/navigation';
  import { itemStore } from '$lib/stores/items.js';
  import ItemForm from '$lib/components/ItemForm.svelte';

  function handleSave(data) {
    itemStore.add(data);
    goto('/items');
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
  <div class="form-card">
    <h2 class="form-heading">Add New Item</h2>
    <ItemForm onsave={handleSave} oncancel={handleCancel} />
  </div>
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
</style>
