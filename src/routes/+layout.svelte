<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { browser } from '$app/environment';

	const FONTS_URL =
		'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&family=Geist:wght@300;400;500;600&display=swap';

	function loadFonts() {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = FONTS_URL;
		document.head.appendChild(link);
	}

	onMount(() => {
		if (browser) {
			const userTheme = localStorage.getItem('theme') || 'dark';
			theme.set(userTheme);
			document.documentElement.classList.toggle('dark', userTheme === 'dark');

			loadFonts();
		}
	});
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<meta name="description" content="Kirkr.xyz - A personal website showcasing lots of stuff." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />

	<noscript>
		<link rel="stylesheet" href={FONTS_URL} />
	</noscript>
</svelte:head>

<div class="antialiased min-h-screen relative bg-[#0a0a0b] text-white">
	<Navbar />
	<main class="pt-20">
		<slot />
	</main>
</div>