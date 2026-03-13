import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const KEY = 'at-theme';

function createTheme() {
  const initial = browser ? (localStorage.getItem(KEY) ?? 'dark') : 'dark';
  const { subscribe, update } = writable(initial);

  return {
    subscribe,
    toggle() {
      update(current => {
        const next = current === 'dark' ? 'light' : 'dark';
        if (browser) {
          localStorage.setItem(KEY, next);
          document.documentElement.dataset.theme = next;
        }
        return next;
      });
    },
    init() {
      if (browser) {
        const saved = localStorage.getItem(KEY) ?? 'dark';
        document.documentElement.dataset.theme = saved;
      }
    }
  };
}

export const themeStore = createTheme();
