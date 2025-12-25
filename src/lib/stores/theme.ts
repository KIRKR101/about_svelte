import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const userTheme = browser && localStorage.getItem('theme');

export const theme = writable(userTheme || 'dark');

theme.subscribe((value) => {
  if (browser) {
    localStorage.setItem('theme', value);
    document.documentElement.classList.toggle('dark', value === 'dark');
  }
});
