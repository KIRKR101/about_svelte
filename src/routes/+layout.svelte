<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<meta name="description" content="Writing on art history, computer engineering, and other interests." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />
</svelte:head>

<div class="flex h-dvh flex-col overflow-hidden bg-[#0a0a0b] text-white antialiased">
	<Navbar />
	<main class="min-h-0 flex-1 overflow-y-auto overscroll-y-auto">
		{@render children()}
	</main>
</div>
