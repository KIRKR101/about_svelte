<script lang="ts">
	let { children, title, longTitle, date, snippet } = $props();

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{title || 'Blog Post'} | kirkr.xyz</title>
	<meta name="description" content={snippet || 'Read blog posts and articles.'} />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-sans md:py-16">
	<main class="anim-row anim-row-1 w-full max-w-[600px]">
		<div class="py-4">
			<a
				href="/posts"
				class="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase no-underline transition-colors duration-75 hover:text-white/75"
			>
				← all posts
			</a>
		</div>

		<div class="py-6">
			<h1 class="font-serif text-[42px] leading-tight tracking-[-1px] text-white/90 md:text-[48px]">
				{longTitle || title || 'Blog Post'}
			</h1>
			<div class="mt-3 flex items-center justify-between font-mono text-[11px] tracking-[0.1em] text-dim uppercase">
				<span>kirkr.xyz</span>
				<span>{formatDate(date)}</span>
			</div>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		<article class="prose prose-invert prose-sm sm:prose-base max-w-none font-sans text-[#c0c0c0]">
			{@render children()}
		</article>
	</main>
</div>
