<script lang="ts">
   import { onMount, onDestroy } from 'svelte';
   import { recentPosts } from '$lib/posts-data';

  interface TrackData {
    status: string;
    title: string;
    artist: string;
    albumArtUrl: string;
    trackUrl: string;
  }

  let trackData: TrackData | null = null;
  let intervalId: ReturnType<typeof setInterval>;

  async function fetchTrack() {
      try {
          const response = await fetch('https://lastfm.kirkr.xyz/api/lastfm-track');

          if (!response.ok) {
              throw new Error(`API responded with ${response.status}`);
          }

          trackData = await response.json();
      } catch (error) {
          console.error('Error fetching Last.fm track:', error);
      }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onMount(() => {
      fetchTrack();
      intervalId = setInterval(fetchTrack, 60000);
  });

  onDestroy(() => {
      if (intervalId) {
          clearInterval(intervalId);
      }
  });
</script>

<div class="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4 md:p-8">
    <div class="flex flex-col lg:flex-row gap-8 lg:gap-16 lg:px-8 xl:px-0 max-w-[90vw] lg:max-w-340 lg:w-full items-center">
        <!-- Intro Section -->
        <section class="flex-1 flex flex-col justify-center w-full">
            <div class="mb-2">
                <h1 class="text-3xl font-normal">Kirkr.xyz</h1>
            </div>
            <p class="mb-2 text-base">0.01x dev</p>

            <div class="flex flex-row flex-wrap gap-3 mt-7 mb-6">
                <a
                    href="https://github.com/Kirkr101"
                    title="GitHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-muted-foreground no-underline inline-flex items-center gap-2 text-base hover:text-foreground transition-colors"
                >
                    <svg
                        viewBox="0 0 16 16"
                        class="w-[18px] h-[18px] fill-current"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                        ></path>
                    </svg>
                    <span>Kirkr101</span>
                </a>
            </div>
        </section>

        <div class="flex flex-col gap-8">
            <!-- Last.fm Container -->
            <div class="lg:max-w-xl w-full bg-card p-4 rounded-lg border border-border">
                <div class="flex justify-between items-center text-sm text-muted-foreground uppercase tracking-wider font-bold mb-3 flex-wrap gap-2">
                    <span>{trackData?.status || 'Currently playing'}</span>
                    <a
                        href="https://www.last.fm/user/Kirkr101"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-sm font-normal text-muted-foreground no-underline hover:text-foreground hover:underline transition-colors"
                    >
                        last.fm
                    </a>
                </div>

                <div class="flex items-center gap-4 w-full">
                    {#if trackData}
                        <img
                            src={trackData.albumArtUrl}
                            alt={`Album art for ${trackData.title}`}
                            class="w-16 h-16 rounded-lg shrink-0 object-cover"
                        />

                        <div class="flex flex-col min-w-0 flex-1">
                            <h4 class="m-0 text-lg font-normal text-foreground min-w-0">
                                <a
                                    href={trackData.trackUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-foreground no-underline hover:underline"
                                >
                                    {trackData.title}
                                </a>
                            </h4>
                            <p class="m-0 text-base text-muted-foreground whitespace-normal wrap-break-word min-w-0">
                                {trackData.artist}
                            </p>
                        </div>
                    {:else}
                        <div class="w-16 h-16 rounded-lg bg-muted animate-pulse shrink-0"></div>

                        <div class="flex flex-col min-w-0 flex-1 gap-2">
                            <div class="h-5 bg-muted animate-pulse rounded"></div>
                            <div class="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Recent Posts Section -->
            <section class="shrink-0 w-full lg:max-w-xl">
                {#if recentPosts && recentPosts.length > 0}
                    <div class="max-w-full w-full p-3 sm:p-5 rounded-lg bg-card border border-border">
                        <div class="flex justify-between items-center text-sm text-muted-foreground uppercase tracking-wider font-bold mb-3 flex-wrap gap-2 pb-1 border-b border-border">
                            <span>Recent posts</span>
                            <a
                                href="/posts"
                                class="text-sm font-normal text-muted-foreground no-underline hover:text-foreground transition-colors hover:underline"
                            >
                                all posts
                            </a>
                        </div>

                        <div class="flex flex-col gap-6 w-full">
                            {#each recentPosts as post}
                                <div
                                    class="flex flex-col gap-1"
                                >
                                    <h3 class="m-0 text-base font-normal text-foreground">
                                        <a
                                            href={`/post/${post.file}`}
                                            class="text-foreground no-underline hover:text-foreground transition-colors hover:underline"
                                        >
                                            {post.title}
                                        </a>
                                    </h3>

                                    <div class="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span>
                                            {formatDate(post.date)}
                                        </span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </section>
        </div>
    </div>
</div>
