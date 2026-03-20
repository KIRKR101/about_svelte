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

  function formatShortDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
    });
  }

  // Reactively group posts by year whenever data.posts changes
  $: groupedPosts = data.posts.reduce((groups, post) => {
    const year = new Date(post.date).getFullYear().toString();
    const existingGroup = groups.find(g => g.year === year);
    
    if (existingGroup) {
      existingGroup.posts.push(post);
    } else {
      groups.push({ year, posts: [post] });
    }
    
    return groups;
  }, [] as { year: string; posts: Post[] }[]);
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
            <div class="font-sans text-[11px] tracking-[0.1em] uppercase text-dim mt-2">writings and notes by me</div>
        </div>

        <div class="h-px bg-bd mb-8"></div>

        {#if data.posts.length === 0}
            <div class="py-12 text-center">
                <div class="font-mono text-[11px] tracking-[0.1em] uppercase text-dim">No entries found</div>
            </div>
        {:else}
            <div class="flex flex-col gap-10">
                {#each groupedPosts as group}
                    <div class="flex flex-col">
                        <!-- Year Header -->
                        <h2 class="font-mono text-[14px] text-white/78 mb-3">{group.year}</h2>
                        
                        <!-- Posts for this year -->
                        <div class="flex flex-col">
                            {#each group.posts as post}
                                <a href={`/post/${post.file}`} class="flex items-baseline gap-5 py-[11px] border-b border-sep no-underline last:border-0 group">
                                    <span class="font-sans text-[14px] leading-[1.35] text-entry flex-1 transition-colors duration-75 group-hover:text-entry-h">{post.title}</span>
                                    <span class="font-sans text-[11px] tracking-[0.04em] text-dim whitespace-nowrap">{formatShortDate(post.date)}</span>
                                </a>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </main>
</div>