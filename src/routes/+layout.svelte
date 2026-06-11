<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<meta
		name="description"
		content="Writing on art history, computer engineering, and other interests."
	/>
	<meta property="og:title" content="kirkr.xyz" />
	<meta
		property="og:description"
		content="Writing on art history, computer engineering, and other interests."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://kirkr.xyz" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="kirkr.xyz" />
	<meta
		name="twitter:description"
		content="Writing on art history, computer engineering, and other interests."
	/>
</svelte:head>

<a
	href="#main-content"
	class="fixed top-2 left-2 z-[100] -translate-y-20 rounded bg-white px-4 py-2 font-sans text-[14px] text-black no-underline transition-transform duration-200 focus:translate-y-0"
>
	Skip to content
</a>

<div class="flex h-dvh flex-col overflow-hidden bg-[#0a0a0b] text-white antialiased">
	<Navbar />
	<main id="main-content" class="min-h-0 flex-1 overflow-y-auto overscroll-y-auto">
		{@render children()}
	</main>
</div>
