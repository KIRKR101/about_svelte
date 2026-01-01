<script lang="ts">
   import { onMount, onDestroy } from 'svelte';
   import { recentPosts } from '$lib/posts-data';

  interface SpotifyTrackData {
    isPlaying: boolean;
    title: string;
    artist: string;
    album: string;
    albumArt: string;
    progress: number;
    duration: number;
    uri: string;
  }

  interface LastFmTrackData {
    status: string;
    title: string;
    artist: string;
    albumArtUrl: string;
    trackUrl: string;
  }

  let spotifyData: SpotifyTrackData | null = null;
  let lastFmData: LastFmTrackData | null = null;
  let useLastFm = false;
  let intervalId: ReturnType<typeof setInterval>;
  let progressIntervalId: ReturnType<typeof setInterval>;
  let localProgress = 0;
  let lastFetchTime = 0;

  async function fetchSpotifyTrack() {
      try {
          const response = await fetch('https://spotify.kirkr.xyz/api/now-playing');

          if (!response.ok) {
              throw new Error(`Spotify API responded with ${response.status}`);
          }

          const data = await response.json();
          
          if (data.isPlaying !== undefined) {
              spotifyData = data;
              localProgress = data.progress || 0;
              lastFetchTime = Date.now();
              useLastFm = false;
              
              setupProgressUpdate();
              return;
          }
          
          throw new Error('Invalid Spotify response');
      } catch (error) {
          console.error('Error fetching Spotify track, falling back to Last.fm:', error);
          useLastFm = true;
          fetchLastFmTrack();
      }
  }

  async function fetchLastFmTrack() {
      try {
          const response = await fetch('https://lastfm.kirkr.xyz/api/lastfm-track');

          if (!response.ok) {
              throw new Error(`Last.fm API responded with ${response.status}`);
          }

          lastFmData = await response.json();
      } catch (error) {
          console.error('Error fetching Last.fm track:', error);
      }
  }

  function setupProgressUpdate() {
      if (progressIntervalId) {
          clearInterval(progressIntervalId);
      }

      if (spotifyData?.isPlaying) {
          // Update progress every 100ms for smooth animation
          progressIntervalId = setInterval(() => {
              const elapsed = Date.now() - lastFetchTime;
              const newProgress = (spotifyData?.progress || 0) + elapsed;
              
              if (newProgress >= (spotifyData?.duration || 0)) {
                  fetchSpotifyTrack();
              } else {
                  localProgress = newProgress;
              }
          }, 100);
      }
  }

  function formatTime(ms: number) {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function formatAriaLabel(progress: number, duration: number) {
      const progressSeconds = Math.floor(progress / 1000);
      const durationSeconds = Math.floor(duration / 1000);
      const progressMinutes = Math.floor(progressSeconds / 60);
      const progressSecs = progressSeconds % 60;
      const durationMinutes = Math.floor(durationSeconds / 60);
      const durationSecs = durationSeconds % 60;
      return `Song progress: ${progressMinutes} minutes ${progressSecs} seconds of ${durationMinutes} minutes`;
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
      fetchSpotifyTrack();
      intervalId = setInterval(fetchSpotifyTrack, 60000);
  });

  onDestroy(() => {
      if (intervalId) {
          clearInterval(intervalId);
      }
      if (progressIntervalId) {
          clearInterval(progressIntervalId);
      }
  });

  $: progressPercentage = spotifyData ? (localProgress / spotifyData.duration) * 100 : 0;
</script>

<div class="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4 md:p-8">
    <div class="flex flex-col lg:flex-row gap-8 lg:gap-16 lg:px-8 max-w-[90vw] lg:max-w-340 lg:w-full items-center">
        <!-- Intro Section -->
        <section class="flex-1 flex flex-col justify-center w-full">
            <div class="mb-2">
                <h1 class="text-4xl font-normal tracking-tight">Kirkr.xyz</h1>
            </div>
            <p class="mb-2 text-base text-muted-foreground">0.01x dev</p>

            <div class="flex flex-row flex-wrap gap-3 mt-7 mb-6">
                <a
                    href="https://github.com/Kirkr101"
                    title="GitHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-muted-foreground hover:underline inline-flex items-center gap-2 text-base hover:text-foreground transition-colors duration-100 ease-out"
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
            <!-- Music Container (Spotify or Last.fm) -->
            <div class="lg:max-w-xl w-full bg-card p-4 rounded-md border border-border">
                {#if !useLastFm && spotifyData}
                    <!-- Spotify Display -->
                    <div class="flex justify-between items-center text-sm text-muted-foreground uppercase tracking-wider font-bold mb-3 flex-wrap gap-2">
                        <span>{spotifyData.isPlaying ? 'Currently playing' : 'Last played'}</span>
                        <a
                            href="https://open.spotify.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on Spotify"
                            class="text-sm font-normal text-muted-foreground no-underline hover:text-foreground hover:underline transition-colors inline-flex items-center gap-1.5"
                        >
                            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            <span>spotify</span>
                        </a>
                    </div>

                    <div class="flex items-center gap-4 w-full {spotifyData.isPlaying ? 'mb-4' : ''}">
                        <img
                            src={spotifyData.albumArt}
                            alt={`Album art for ${spotifyData.title}`}
                            class="w-18 h-18 rounded-sm shrink-0 object-cover"
                        />

                        <div class="flex flex-col min-w-0 flex-1">
                            <h4 class="m-0 text-lg font-normal text-foreground min-w-0">
                                <a
                                    href={spotifyData.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-foreground no-underline hover:underline"
                                >
                                    {spotifyData.title}
                                </a>
                            </h4>
                            <p class="m-0 text-base text-muted-foreground whitespace-normal wrap-break-word min-w-0">
                                {spotifyData.artist}
                            </p>
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    {#if spotifyData.isPlaying}
                        <div class="flex flex-col gap-1.5">
                            <div class="w-full h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                    class="h-full bg-foreground transition-all duration-100 ease-linear"
                                    style="width: {Math.min(progressPercentage, 100)}%"
                                    aria-label={formatAriaLabel(localProgress, spotifyData.duration)}
                                    role="progressbar"
                                    aria-valuenow={progressPercentage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                            <div class="flex justify-between text-xs text-muted-foreground">
                                <span>{formatTime(localProgress)}</span>
                                <span>{formatTime(spotifyData.duration)}</span>
                            </div>
                        </div>
                    {/if}
                {:else if useLastFm && lastFmData}
                    <!-- Last.fm Display -->
                    <div class="flex justify-between items-center text-sm text-muted-foreground uppercase tracking-wider font-bold mb-3 flex-wrap gap-2">
                        <span>{lastFmData.status || 'Currently playing'}</span>
                        <a
                            href="https://www.last.fm/user/Kirkr101"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on Last.fm"
                            class="text-sm font-normal text-muted-foreground no-underline hover:text-foreground hover:underline transition-colors inline-flex items-center gap-1.5"
                        >
                            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.584 17.209l-.88-2.392s-1.43 1.595-3.573 1.595c-1.897 0-3.244-1.65-3.244-4.289 0-3.381 1.704-4.591 3.382-4.591 2.419 0 3.188 1.567 3.849 3.574l.88 2.75c.879 2.667 2.528 4.811 7.284 4.811 3.409 0 5.719-1.044 5.719-3.793 0-2.227-1.265-3.381-3.629-3.932l-1.76-.385c-1.209-.275-1.566-.77-1.566-1.594 0-.935.742-1.485 1.952-1.485 1.319 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.491-4.729-3.491-2.474 0-4.893.935-4.893 3.931 0 1.87.907 3.052 3.188 3.602l1.869.439c1.402.33 1.869.907 1.869 1.705 0 1.017-.989 1.43-2.858 1.43-2.776 0-3.932-1.457-4.591-3.464l-.907-2.749c-1.155-3.574-2.997-4.894-6.653-4.894-4.041-.001-6.186 2.556-6.186 6.899 0 4.179 2.145 6.433 5.993 6.433 3.107.001 4.591-1.457 4.591-1.457z"/>
                            </svg>
                            <span>last.fm</span>
                        </a>
                    </div>

                    <div class="flex items-center gap-4 w-full">
                        <img
                            src={lastFmData.albumArtUrl}
                            alt={`Album art for ${lastFmData.title}`}
                            class="w-18 h-18 rounded-sm shrink-0 object-cover"
                        />

                        <div class="flex flex-col min-w-0 flex-1">
                            <h4 class="m-0 text-lg font-normal text-foreground min-w-0">
                                <a
                                    href={lastFmData.trackUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-foreground no-underline hover:underline"
                                >
                                    {lastFmData.title}
                                </a>
                            </h4>
                            <p class="m-0 text-base text-muted-foreground whitespace-normal wrap-break-word min-w-0">
                                {lastFmData.artist}
                            </p>
                        </div>
                    </div>
                {:else}
                    <!-- Loading State -->
                    <div class="flex justify-between items-center text-sm text-muted-foreground uppercase tracking-wider font-bold mb-3 flex-wrap gap-2">
                        <span>Currently playing</span>
                    </div>

                    <div class="flex items-center gap-4 w-full">
                        <div class="w-16 h-16 rounded-md bg-muted animate-pulse shrink-0"></div>

                        <div class="flex flex-col min-w-0 flex-1 gap-2">
                            <div class="h-5 bg-muted animate-pulse rounded"></div>
                            <div class="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Recent Posts Section -->
            <section class="shrink-0 w-full lg:max-w-xl">
                {#if recentPosts && recentPosts.length > 0}
                    <div class="max-w-full w-full p-3 sm:p-5 rounded-md bg-card border border-border">
                        <div class="flex justify-between items-center text-sm text-muted-foreground uppercase tracking-wider font-bold mb-3 flex-wrap gap-2 pb-1 border-b border-border">
                            <span>Recent posts</span>
                            <a
                                href="/posts"
                                class="text-sm font-normal text-muted-foreground no-underline hover:text-foreground transition-colors hover:underline inline-flex items-center gap-1.5"
                                title="View all posts"
                            >
                                <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current">
                                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                                </svg>
                                <span>all posts</span>
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