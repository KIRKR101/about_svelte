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

<!-- PAGE CONTAINER -->
<div class="min-h-screen relative text-[#1A1A1A] dark:text-[#E0E0E0] p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center font-sans selection:bg-[#FF4D00] selection:text-white overflow-x-hidden">

    <!-- CSS GRAIN OVERLAY -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-50 mix-blend-multiply dark:mix-blend-overlay bg-noise min-h-screen"></div>

    <main class="w-full max-w-4xl relative z-10">
        <!-- POST CONTENT CARD -->
        <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 p-8">
            <!-- Navigation -->
            <nav class="mb-8">
                <a href="/posts" class="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-[#FF4D00] transition-colors">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    All Posts
                </a>
            </nav>

            <!-- Post Header -->
            <header class="mb-6">
                <h1 class="font-display font-bold text-3xl md:text-4xl text-[#1A1A1A] dark:text-[#EEEEEE] leading-tight mb-5">
                    {meta?.longTitle || meta?.title || 'Blog Post'}
                </h1>
                <div class="h-px bg-[#1A1A1A] dark:bg-[#444448] w-full"></div>
            </header>

            <!-- Post Content -->
            <article class="prose prose-lg dark:prose-invert max-w-none">
                <PostContent content={body} />
            </article>

            <!-- Footer -->
            <footer class="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700">
                <div class="text-right">
                    <p class="font-serif italic text-zinc-600 dark:text-zinc-300 text-sm">
                        By Kirk.
                    </p>
                </div>
            </footer>
        </div>
    </main>
</div>

<style>
    .font-display { font-family: 'Syne', sans-serif; }
    .font-serif { font-family: 'Instrument Serif', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    .bg-noise {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
    }

    .prose {
        color: #1A1A1A;
    }

    .dark .prose {
        color: #E0E0E0;
    }

    .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
        font-family: 'Syne', sans-serif;
        font-weight: 600;
    }

    .prose p, .prose li {
        font-family: 'Instrument Serif', serif;
        line-height: 1.7;
    }

    .prose code {
        font-family: 'JetBrains Mono', monospace;
    }
</style>
