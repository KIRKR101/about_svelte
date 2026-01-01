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

<div class="flex flex-col items-center p-4 sm:p-8 overflow-y-auto">
  <div class="w-full max-w-[95%] sm:max-w-[850px] p-2 sm:p-4">
    <nav class="mb-6 sm:mb-10">
      <a href="/posts" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <svg class="w-4 h-4 fill-current mr-1" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        All Posts
      </a>
    </nav>

    <header>
      <h1 class="text-xl sm:text-2xl font-normal text-foreground mb-4 leading-tight">
        {meta?.longTitle || meta?.title || 'Blog Post'}
      </h1>
    </header>

    <hr class="border-border mb-6 sm:mb-10" />

    <PostContent content={body} />

    <hr class="border-border mb-4" />
    <footer class="text-right mr-0 sm:mr-8 text-muted-foreground text-sm">
      By Kirk.
    </footer>
  </div>
</div>
