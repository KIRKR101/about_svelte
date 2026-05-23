<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { theme } from '$lib/stores/theme';
	import { browser } from '$app/environment';

	let { children } = $props();

	$effect(() => {
		if (browser) {
			const userTheme = localStorage.getItem('theme') || 'dark';
			theme.set(userTheme);
		}
	});
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<meta name="description" content="Kirkr.xyz - A personal website showcasing lots of stuff." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />
</svelte:head>

<div class="h-screen flex flex-col overflow-hidden bg-[#0a0a0b] text-white antialiased">
	<Navbar />
	<main class="flex-1 min-h-0 overflow-y-auto">
		{@render children()}
	</main>
</div>
