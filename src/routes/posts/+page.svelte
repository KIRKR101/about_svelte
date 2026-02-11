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

  export let data: PageData;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
  }

  function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const diffInMs = date.getTime() - new Date().getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(diffInDays) < 7) return rtf.format(diffInDays, "day");
    if (Math.abs(diffInDays) < 30) return rtf.format(Math.round(diffInDays / 7), "week");
    if (Math.abs(diffInDays) < 365) return rtf.format(Math.round(diffInDays / 30), "month");
    return rtf.format(Math.round(diffInDays / 365), "year");
  }
</script>

<svelte:head>
    <title>Posts | kirkr.xyz</title>
    <meta name="description" content="Blog posts and articles on various topics by me." />
    <meta name="robots" content="index, follow" />
</svelte:head>

<!-- PAGE CONTAINER -->
<div class="min-h-full relative text-[#1A1A1A] dark:text-[#E0E0E0] p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center font-sans selection:bg-[#FF4D00] selection:text-white overflow-x-hidden">

    <!-- CSS GRAIN OVERLAY -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-50 mix-blend-multiply dark:mix-blend-overlay bg-noise"></div>

    <main class="w-full max-w-4xl relative z-10">
        <!-- HEADER CARD -->
        <div class="w-full bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 mb-6 p-8 flex flex-col justify-center text-center min-h-[120px]">
            <h1 class="font-display font-extrabold text-5xl md:text-6xl leading-[0.8] tracking-tight text-[#1A1A1A] dark:text-[#EEEEEE] mb-3">
                Posts<span class="text-[#FF4D00]">.</span>
            </h1>
            <p class="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-2">
                writings and notes by me
            </p>
        </div>

        <!-- POSTS CONTENT -->
        {#if data.posts.length === 0}
            <div class="w-full bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] p-12 text-center">
                <div class="font-mono text-sm uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
                    No posts yet
                </div>
                <div class="font-display text-2xl text-[#1A1A1A] dark:text-[#E0E0E0]">
                    Check back soon
                </div>
            </div>
        {:else}
            <div class="space-y-4">
                {#each data.posts as post}
                    <a
                        href={`/post/${post.file}`}
                        class="w-full bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 transition-transform duration-300 ease-out hover:-translate-x-[1px] hover:shadow-[6px_6px_0px_0px_#1A1A1A] dark:hover:shadow-[6px_6px_0px_0px_#55555A] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_#1A1A1A] block p-6 group"
                    >
                        <article class="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr] md:gap-6">
                            <div class="flex items-center">
                                <time
                                    datetime={post.date}
                                    class="font-mono text-sm uppercase tracking-widest text-zinc-500 dark:text-zinc-400"
                                    title={formatDate(post.date)}
                                >
                                    <span class="md:hidden">
                                        {getRelativeTime(post.date)}
                                    </span>
                                    <span class="hidden md:inline">
                                        {formatDate(post.date)}
                                    </span>
                                </time>
                            </div>

                            <div class="min-w-0 space-y-2">
                                <h3 class="font-display font-bold text-xl text-[#1A1A1A] dark:text-[#EEEEEE] group-hover:text-[#FF4D00] transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                {#if post.snippet}
                                    <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                                        {post.snippet}
                                    </p>
                                {/if}
                            </div>
                        </article>
                    </a>
                {/each}
            </div>
        {/if}
    </main>
</div>
