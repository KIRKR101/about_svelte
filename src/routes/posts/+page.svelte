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

<div class="min-h-screen flex flex-col items-center px-6 py-6 md:py-16 font-mono">
    <main class="w-full max-w-[600px] anim-row anim-row-1">
        
        <div class="py-7">
            <h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
                <span class="opacity-90">Log entries</span><span class="opacity-20"><em class="not-italic italic">.</em></span>
            </h1>
            <div class="font-mono text-[11px] tracking-[0.1em] uppercase text-dim mt-2">writings and notes by me</div>
        </div>

        <div class="h-px bg-bd mb-8"></div>

        {#if data.posts.length === 0}
            <div class="py-12 text-center">
                <div class="font-mono text-[11px] tracking-[0.1em] uppercase text-dim">No entries found</div>
            </div>
        {:else}
            <div class="flex flex-col">
                {#each data.posts as post}
                    <a href={`/post/${post.file}`} class="flex items-baseline gap-4 py-4 border-b border-sep group no-underline">
                        <span class="font-serif text-[18px] text-white/45 group-hover:text-white/85 transition-colors duration-75 flex-1 leading-tight">
                            {post.title}
                        </span>
                        <span class="font-mono lowercase text-[10px] text-dim whitespace-nowrap tracking-[0.04em]">
                            <span class="md:hidden">{getRelativeTime(post.date)}</span>
                            <span class="hidden md:inline">{formatDate(post.date)}</span>
                        </span>
                    </a>
                {/each}
            </div>
        {/if}
    </main>
</div>
