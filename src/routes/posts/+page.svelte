<script lang="ts">
	interface Post {
		file: string;
		title: string;
		date: string;
		snippet: string;
	}

	interface PageData {
		posts: Post[];
	}

	let { data }: { data: PageData } = $props();

	function formatShortDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', {
			month: 'short',
			day: 'numeric'
		});
	}

	let groupedPosts = $derived.by(() => {
		return data.posts.reduce(
			(groups, post) => {
				const year = new Date(post.date).getFullYear().toString();
				const existingGroup = groups.find((g) => g.year === year);

				if (existingGroup) {
					return groups.map((g) => (g.year === year ? { ...g, posts: [...g.posts, post] } : g));
				} else {
					return [...groups, { year, posts: [post] }];
				}
			},
			[] as { year: string; posts: Post[] }[]
		);
	});
</script>

<svelte:head>
	<title>Posts | kirkr.xyz</title>
	<meta name="description" content="Blog posts and articles on various topics by me." />
	<meta name="robots" content="index, follow" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-mono md:py-16">
	<main class="anim-row anim-row-1 w-full max-w-[600px]">
		<div class="py-7">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Log entries</span><span class="opacity-20"
					><em class="italic not-italic">.</em></span
				>
			</h1>
			<div class="mt-2 font-sans text-[11px] tracking-[0.1em] text-muted uppercase">
				writings and notes by me
			</div>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		{#if data.posts.length === 0}
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
									class="group flex w-full items-baseline justify-between border-b border-bd/30 py-4 no-underline last:border-0"
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
