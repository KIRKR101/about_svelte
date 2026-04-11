import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Initializes theme from localStorage if available, otherwise defaults to dark.
const userTheme = browser && localStorage.getItem('theme');

export const theme = writable(userTheme || 'dark');

// Persists theme changes to localStorage and updates the DOM class for Tailwind.
theme.subscribe((value) => {
	if (browser) {
		localStorage.setItem('theme', value);
		document.documentElement.classList.toggle('dark', value === 'dark');
	}
});
