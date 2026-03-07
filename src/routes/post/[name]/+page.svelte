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

  export let data: PageData;

  function parseFrontmatter(content: string): { frontmatter: any, body: string } {
    const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
    if (frontmatterMatch) {
      const frontmatterStr = frontmatterMatch[1];
      const body = content.substring(frontmatterMatch[0].length).trimStart();

      // Simple frontmatter parsing
      const frontmatter: any = {};
      frontmatterStr.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
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
    <meta name="description" content={meta?.snippet || 'Read blog posts and articles on various topics.'} />
</svelte:head>

<div class="min-h-screen flex flex-col items-center px-6 py-6 md:py-16 font-sans">
    <main class="w-full max-w-[600px] anim-row anim-row-1">
        
        <div class="py-4">
            <a href="/posts" class="font-mono text-[11px] tracking-[0.2em] uppercase text-white/40 hover:text-white/75 transition-colors duration-75 no-underline">
                ← all posts
            </a>
        </div>

        <div class="py-6">
            <h1 class="font-serif text-[42px] md:text-[48px] leading-tight tracking-[-1px] text-white/90">
                {meta?.longTitle || meta?.title || 'Blog Post'}
            </h1>
            <div class="font-mono text-[11px] tracking-[0.1em] uppercase text-dim mt-3">kirkr.xyz</div>
        </div>

        <div class="h-px bg-bd mb-8"></div>

        <article class="prose">
            <PostContent content={body} />
        </article>
    </main>
</div>