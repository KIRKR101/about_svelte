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
    const now = new Date();
    const diffInDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }
</script>

<svelte:head>
  <title>Blog | kirkr.xyz</title>
  <meta name="description" content="Blog posts and articles on various topics by me." />
  <meta name="robots" content="index, follow" />
</svelte:head>

<div class="flex flex-col items-center p-4 md:p-8">
    <header class="flex items-center justify-center p-0 mb-8 md:mb-12 mt-8 sm:mt-0">
      <div class="text-center">
        <h1 class="text-xl sm:text-2xl mb-2 font-normal">Blog Posts</h1>
        <p class="text-sm sm:text-base text-muted-foreground">writings and notes by me</p>
      </div>
    </header>

  <main class="w-full max-w-2xl">
    {#if data.posts.length === 0}
        <div class="border-dashed border rounded-lg">
            <div class="flex items-center justify-center py-12">
                <div class="flex flex-col items-center gap-3 text-center">
                    <div>
                        <p class="font-medium text-foreground">
                            No posts yet
                        </p>
                        <p class="mt-1 text-sm text-muted-foreground">
                            Check back soon
                        </p>
                    </div>
                </div>
            </div>
        </div>
    {:else}
      <div class="space-y-0 divide-y divide-border">
          {#each data.posts as post}
              <a
                  href={`/post/${post.file}`}
                  class="group block py-4 transition-colors hover:bg-accent/50 -mx-4 px-4 rounded-lg"
              >
                  <article class="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr] md:gap-6">
                      <time
                          datetime={post.date}
                          class="flex items-center gap-2 text-sm text-muted-foreground"
                          title={formatDate(post.date)}
                      >
                          <span class="md:hidden">
                              {getRelativeTime(post.date)}
                          </span>
                          <span class="hidden md:inline">
                              {formatDate(post.date)}
                          </span>
                      </time>

                      <div class="min-w-0 space-y-1.5">
                          <h3 class="font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                              {post.title}
                          </h3>
                          {#if post.snippet}
                              <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
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
