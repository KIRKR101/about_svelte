<script lang="ts">
	import PostContent from '$lib/components/PostContent.svelte';

	interface PostMeta {
		title: string;
		longTitle?: string;
		snippet: string;
	}

	interface PageData {
		meta: PostMeta;
		content: string;
	}

	let { data }: { data: PageData } = $props();

	function parseFrontmatter(content: string): {
		frontmatter: Record<string, string>;
		body: string;
	} {
		const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
		if (frontmatterMatch && frontmatterMatch[1]) {
			const frontmatterStr = frontmatterMatch[1];
			const body = content.substring(frontmatterMatch[0].length).trimStart();

			const frontmatter: Record<string, string> = {};
			frontmatterStr.split('\n').forEach((line) => {
				const [key, ...valueParts] = line.split(':');
				if (key && valueParts.length > 0) {
					frontmatter[key.trim()] = valueParts
						.join(':')
						.trim()
						.replace(/^["']|["']$/g, '');
				}
			});

			return { frontmatter, body };
		}

		return { frontmatter: {}, body: content };
	}

	const { meta, content } = data;
	const { body } = parseFrontmatter(content);
</script>

<svelte:head>
	<title>{meta?.title || 'Blog Post'} | kirkr.xyz</title>
	<meta
		name="description"
		content={meta?.snippet || 'Read blog posts and articles on various topics.'}
	/>
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
				{meta?.longTitle || meta?.title || 'Blog Post'}
			</h1>
			<div class="mt-3 font-mono text-[11px] tracking-[0.1em] text-dim uppercase">kirkr.xyz</div>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		<article class="prose">
			<PostContent content={body} />
		</article>
	</main>
</div>
