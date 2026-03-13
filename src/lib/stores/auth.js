import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const currentUser = writable(null);
export const authLoading = writable(true);
export const authError = writable(null);

let _manager = null;

export function isOidcConfigured() {
  return !!(import.meta.env.VITE_OIDC_AUTHORITY && import.meta.env.VITE_OIDC_CLIENT_ID);
}

export async function getManager() {
  if (_manager) return _manager;
  if (!browser) return null;
  const { UserManager, WebStorageStateStore } = await import('oidc-client-ts');
  _manager = new UserManager({
    authority: import.meta.env.VITE_OIDC_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: `${window.location.origin}/callback`,
    post_logout_redirect_uri: `${window.location.origin}/`,
    response_type: 'code',
    scope: 'openid profile email',
    userStore: new WebStorageStateStore({ store: window.localStorage }),
  });
  _manager.events.addUserLoaded(u => currentUser.set(u));
  _manager.events.addUserUnloaded(() => currentUser.set(null));
  return _manager;
}

export async function initAuth() {
  if (!browser) { authLoading.set(false); return; }
  if (!isOidcConfigured()) { authLoading.set(false); return; }
  try {
    const mgr = await getManager();
    const user = await mgr.getUser();
    currentUser.set(user && !user.expired ? user : null);
  } catch (e) {
    authError.set(e.message);
  } finally {
    authLoading.set(false);
  }
}

export async function login() {
  const mgr = await getManager();
  if (mgr) await mgr.signinRedirect();
}

export async function logout() {
  const mgr = await getManager();
  if (mgr) await mgr.signoutRedirect();
  else currentUser.set(null);
}

export async function handleCallback() {
  const mgr = await getManager();
  if (!mgr) throw new Error('OIDC not configured');
  const user = await mgr.signinRedirectCallback();
  currentUser.set(user);
  return user;
}
