<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  onMount(async () => {
    if (!browser) return;
    const { UserManager } = await import('oidc-client-ts');
    try {
      await new UserManager({ response_mode: 'query' }).signinSilentCallback();
    } catch (e) {
      console.error('Silent renew callback error:', e);
    }
  });
</script>
