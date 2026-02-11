<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { browser } from '$app/environment';
	import FontFaceObserver from 'fontfaceobserver';

	// Initialize theme on mount
	onMount(() => {
		if (browser) {
			const userTheme = localStorage.getItem('theme') || 'dark';
			theme.set(userTheme);
			document.documentElement.classList.toggle('dark', userTheme === 'dark');

			// Check if font is already loaded (cached)
			if (document.fonts && document.fonts.check('1em Syne')) {
				// Font is already available, no need to fade in
				document.documentElement.classList.add('syne-font-loaded');
			} else {
				// Font needs to load, apply loading state
				document.documentElement.classList.add('syne-font-loading');
				
				const font = new FontFaceObserver('Syne');
				font.load().then(() => {
					document.documentElement.classList.remove('syne-font-loading');
					document.documentElement.classList.add('syne-font-loaded');
				}).catch(() => {
					console.warn('Syne font failed to load');
					document.documentElement.classList.remove('syne-font-loading');
				});
			}
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
	
	<!-- Preconnect to Google Fonts CDN for faster access -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	
	<!-- Preload other critical fonts -->
	<link rel="preload" href="/SuisseIntlMono-Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous">
	<link rel="preload" href="/SuisseIntl-Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous">
	
	<!-- Load Google Fonts stylesheet -->
	<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<div class="font-sans antialiased h-screen overflow-hidden relative">
	<Navbar />
	<main class="pt-20 h-full overflow-y-auto relative">
		<slot />
	</main>
</div>
