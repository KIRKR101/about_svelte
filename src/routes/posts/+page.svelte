<script lang="ts">
	import { formatShortDate } from '$lib/utils';

	interface Post {
		file: string;
		title: string;
		date: string;
		snippet: string;
	}

	interface PageData {
		allPosts: Post[];
	}

	let { data }: { data: PageData } = $props();

	let groupedPosts = $derived.by(() => {
		const groups: Record<string, Post[]> = {};
		for (const post of data.allPosts) {
			const year = new Date(post.date).getFullYear().toString();
			(groups[year] ??= []).push(post);
		}
		return Object.entries(groups)
			.map(([year, posts]) => ({ year, posts }))
			.sort((a, b) => b.year.localeCompare(a.year));
	});
</script>

<svelte:head>
	<title>Posts | kirkr.xyz</title>
	<meta name="description" content="Writings and articles on various topics." />
	<meta name="robots" content="index, follow" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-mono md:py-16">
	<main class="w-full max-w-[600px]">
		<div class="py-7">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Writings</span><span class="opacity-20">.</span>
			</h1>
			<div class="mt-2 font-sans text-[11px] tracking-[0.1em] text-muted uppercase">
				a collection of writings
			</div>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		{#if data.allPosts.length === 0}
			<div class="py-12 text-center">
				<div class="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">
					No entries found
				</div>
			</div>
		{:else}
			<div class="flex flex-col gap-10">
				{#each groupedPosts as group (group.year)}
					<div class="flex flex-col">
						<h2 class="mb-3 font-mono text-[14px] text-white/78">{group.year}</h2>

						<div class="flex flex-col">
							{#each group.posts as post (post.file)}
								<a
									href={`/post/${post.file}`}
									class="group flex w-full items-baseline justify-between border-b border-bd/30 py-3 no-underline last:border-0"
								>
									<span
										class="font-sans text-[14px] text-white/70 transition-colors duration-100 group-hover:text-white"
										>{post.title}</span
									>
									<span class="font-sans text-[11px] tracking-wider text-muted/60"
										>{formatShortDate(post.date)}</span
									>
								</a>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>
