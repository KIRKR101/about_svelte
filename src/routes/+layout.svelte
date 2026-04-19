<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { browser } from '$app/environment';

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
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />
</svelte:head>

<div class="relative min-h-screen bg-[#0a0a0b] text-white antialiased">
	<Navbar />
	<main class="pt-20">
		<slot />
	</main>
</div>
