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
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="font-suisse-intl-mono font-suisse-intl antialiased min-h-screen bg-[#FAF9F6] dark:bg-[#121214] relative">
	<Navbar />
	<main class="pt-20">
		<!-- BACKGROUND GRID -->
		<div class="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] dark:opacity-[0.08]"
		     style="background-image: linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px); background-size: 40px 40px;">
		</div>
		<div class="absolute inset-0 w-full h-full pointer-events-none opacity-0 dark:opacity-[0.04]"
		     style="background-image: linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px); background-size: 40px 40px;">
		</div>
		<slot />
	</main>
</div>
