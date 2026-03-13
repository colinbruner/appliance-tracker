<script>
  import { currentUser, authLoading, login, logout, isOidcConfigured } from '$lib/stores/auth.js';

  let dropdownOpen = false;

  function getInitials(user) {
    const name = user.profile?.name || user.profile?.email || '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function handleClickOutside(e) {
    if (dropdownOpen) dropdownOpen = false;
  }
</script>

<svelte:window on:click={handleClickOutside} />

{#if $authLoading}
  <div class="loading-dot"></div>
{:else if !isOidcConfigured()}
  <span class="demo-badge">Demo Mode</span>
{:else if $currentUser}
  <div class="user-wrap">
    <button class="avatar-btn" on:click|stopPropagation={() => dropdownOpen = !dropdownOpen}>
      {#if $currentUser.profile?.picture}
        <img class="avatar" src={$currentUser.profile.picture} alt="avatar" />
      {:else}
        <span class="avatar-initials">{getInitials($currentUser)}</span>
      {/if}
      <span class="name">{$currentUser.profile?.given_name || $currentUser.profile?.name?.split(' ')[0] || 'User'}</span>
      <span class="chevron" class:open={dropdownOpen}>&#8964;</span>
    </button>

    {#if dropdownOpen}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div class="dropdown" on:click|stopPropagation>
        <div class="dropdown-user">
          <p class="dropdown-name">{$currentUser.profile?.name || 'User'}</p>
          {#if $currentUser.profile?.email}
            <p class="dropdown-email">{$currentUser.profile.email}</p>
          {/if}
        </div>
        <hr class="dropdown-divider" />
        <button class="dropdown-item danger" on:click={() => { dropdownOpen = false; logout(); }}>
          Sign Out
        </button>
      </div>
    {/if}
  </div>
{:else}
  <button class="sign-in-btn" on:click={login}>Sign In</button>
{/if}

<style>
  /* loading dot */
  .loading-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    animation: pulse 1s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }

  .demo-badge {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255,255,255,0.6);
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 0.3rem 0.75rem;
    border-radius: 100px;
  }

  /* user avatar button */
  .user-wrap { position: relative; }
  .avatar-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.95);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 0.35rem 0.75rem 0.35rem 0.5rem;
    border-radius: 100px;
    font-size: 0.825rem;
    font-weight: 600;
    transition: background 0.15s;
  }
  .avatar-btn:hover { background: rgba(255,255,255,0.2); }

  .avatar {
    width: 26px; height: 26px;
    border-radius: 50%;
    object-fit: cover;
  }
  .avatar-initials {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: rgba(255,255,255,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
  }
  .name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chevron { font-size: 0.6rem; opacity: 0.7; transition: transform 0.15s; }
  .chevron.open { transform: rotate(180deg); }

  /* dropdown */
  .dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    min-width: 200px;
    overflow: hidden;
    z-index: 200;
  }
  .dropdown-user { padding: 0.875rem 1rem; }
  .dropdown-name { font-size: 0.875rem; font-weight: 650; color: var(--text-1); }
  .dropdown-email { font-size: 0.75rem; color: var(--text-2); margin-top: 0.15rem; }
  .dropdown-divider { border: none; border-top: 1px solid var(--border); }
  .dropdown-item {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: var(--text-1);
    transition: background 0.12s;
  }
  .dropdown-item:hover { background: var(--surface-2); }
  .dropdown-item.danger { color: #ef4444; }
  .dropdown-item.danger:hover { background: rgba(239,68,68,0.08); }

  .sign-in-btn {
    background: rgba(255,255,255,0.15);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,0.4);
    padding: 0.45rem 1.125rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background 0.15s;
  }
  .sign-in-btn:hover { background: rgba(255,255,255,0.25); }
</style>
