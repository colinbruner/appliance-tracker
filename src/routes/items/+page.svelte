<script>
  import { itemStore } from '$lib/stores/items.js';
  import { getItemStatus } from '$lib/utils/itemUtils.js';
  import { CATEGORIES } from '$lib/data/itemTypes.js';
  import ItemCard from '$lib/components/ItemCard.svelte';

  let selectedCategory = $state('all');
  let items = $derived($itemStore);

  let filteredItems = $derived(
    selectedCategory === 'all'
      ? items
      : items.filter(i => i.category === selectedCategory)
  );

  const STATUS_PRIORITY = { overdue: 0, critical: 1, warning: 2, active: 3, good: 4, completed: 5 };

  let sortedItems = $derived(
    [...filteredItems].sort((a, b) => {
      const sa = getItemStatus(a).status;
      const sb = getItemStatus(b).status;
      return (STATUS_PRIORITY[sa] ?? 99) - (STATUS_PRIORITY[sb] ?? 99);
    })
  );

  function countForCategory(catId) {
    return items.filter(i => i.category === catId).length;
  }

  function handleDelete(id) {
    itemStore.remove(id);
  }
</script>

<svelte:head>
  <title>Items — HomeBase</title>
</svelte:head>

<div class="items-page">
  <div class="page-header">
    <h1 class="page-title">Items</h1>
    <a href="/items/new" class="btn-add">+ Add Item</a>
  </div>

  <!-- Category filter -->
  <div class="filter-chips">
    <button
      class="chip"
      class:active={selectedCategory === 'all'}
      onclick={() => selectedCategory = 'all'}
    >
      All ({items.length})
    </button>
    {#each Object.entries(CATEGORIES) as [id, meta]}
      {@const count = countForCategory(id)}
      <button
        class="chip"
        class:active={selectedCategory === id}
        style="--chip-color: {meta.color};"
        onclick={() => selectedCategory = id}
      >
        <span class="chip-dot" style="background: {meta.color};"></span>
        {meta.label} ({count})
      </button>
    {/each}
  </div>

  <!-- Items grid -->
  {#if sortedItems.length === 0}
    <div class="empty-state">
      {#if selectedCategory !== 'all'}
        <p>No {CATEGORIES[selectedCategory]?.label.toLowerCase()} items yet.</p>
        <a href="/items/new" class="btn-primary">Add one</a>
      {:else}
        <p>No items tracked yet.</p>
        <a href="/items/new" class="btn-primary">Add your first item</a>
      {/if}
    </div>
  {:else}
    <div class="cards-grid">
      {#each sortedItems as item (item.id)}
        <ItemCard {item} ondelete={handleDelete} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .items-page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .page-title {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 400;
    color: var(--text-1);
  }

  .btn-add {
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 0.55rem 1.125rem;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s;
  }
  .btn-add:hover { background: var(--primary-hover); }

  /* Filter chips */
  .filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .chip {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.875rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-2);
    background: none;
    transition: all 0.12s;
  }
  .chip:hover { border-color: var(--text-3); }
  .chip.active {
    color: var(--chip-color, var(--primary));
    border-color: var(--chip-color, var(--primary));
    background: color-mix(in srgb, var(--chip-color, var(--primary)) 8%, transparent);
  }
  .chip-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  /* Cards grid */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 4rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .empty-state p { color: var(--text-2); font-size: 0.9rem; }
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

  @media (max-width: 600px) {
    .cards-grid { grid-template-columns: 1fr; }
    .filter-chips { gap: 0.375rem; }
    .chip { font-size: 0.75rem; padding: 0.35rem 0.625rem; }
  }
</style>
