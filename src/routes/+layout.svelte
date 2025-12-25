<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { browser } from '$app/environment';

	// Initialize theme on mount
	onMount(() => {
		if (browser) {
			const userTheme = localStorage.getItem('theme') || 'dark';
			theme.set(userTheme);
			document.documentElement.classList.toggle('dark', userTheme === 'dark');
		}
	});
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<meta name="description" content="Kirkr.xyz - A personal website showcasing lots of stuff." />
	<meta name="robots" content="index, follow" />
	<meta property="og:title" content="kirkr.xyz" />
	<meta property="og:description" content="Kirkr.xyz - A personal website showcasing lots of stuff." />
	<meta property="og:url" content="https://kirkr.xyz" />
	<meta property="og:site_name" content="Kirkr.xyz" />
	<meta property="og:type" content="website" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />
	<link
		rel="preload"
		href="/SuisseIntlMono-Regular.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href="/SuisseIntl-Regular.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

<div class="font-suisse-intl-mono font-suisse-intl antialiased">
	<Navbar />
	<main class="pt-16 min-h-screen">
		<slot />
	</main>
</div>
