<script>
  import { page } from '$app/stores';
  import ThemeToggle from './ThemeToggle.svelte';
  import AuthButton from './AuthButton.svelte';

  let pathname = $derived($page.url.pathname);
</script>

<header class="nav-header">
  <div class="nav-inner">
    <a href="/" class="brand">HomeBase</a>

    <nav class="nav-links" aria-label="Main navigation">
      <a href="/" class="nav-link" class:active={pathname === '/'}>Dashboard</a>
      <a href="/items" class="nav-link" class:active={pathname.startsWith('/items')}>Items</a>
    </nav>

    <div class="nav-actions">
      <a href="/items/new" class="btn-add">+ Add Item</a>
      <ThemeToggle />
      <AuthButton />
    </div>
  </div>
</header>

<style>
  .nav-header {
    background: var(--primary);
    color: #FAF8F5;
    padding: 0.875rem 0;
    box-shadow: var(--shadow-md);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .brand {
    font-family: var(--font-display);
    font-size: 1.375rem;
    font-weight: 400;
    color: #FAF8F5;
    text-decoration: none;
    letter-spacing: -0.01em;
    flex-shrink: 0;
  }

  .nav-links {
    display: flex;
    gap: 0.25rem;
    margin-right: auto;
  }

  .nav-link {
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.4rem 0.75rem;
    border-radius: var(--radius-md);
    transition: color 0.12s, background 0.12s;
  }
  .nav-link:hover { color: #fff; background: rgba(255,255,255,0.1); }
  .nav-link.active { color: #fff; background: rgba(255,255,255,0.18); }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .btn-add {
    background: rgba(255,255,255,0.15);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,0.4);
    padding: 0.45rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.825rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .btn-add:hover { background: rgba(255,255,255,0.25); }

  @media (max-width: 600px) {
    .nav-inner {
      flex-wrap: wrap;
      gap: 0.625rem;
    }
    .nav-links { order: 3; width: 100%; }
    .btn-add { display: none; }
  }
</style>
