<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import { recentPosts } from '$lib/posts-data';

  // Data structures for music service APIs
  // --- Interfaces ---
  
  interface SpotifyImage {
      height: number;
      width: number;
      url: string;
  }

  interface SpotifyTrackData {
    isPlaying: boolean;
    title: string;
    artist: string;
    album: string;
    images: SpotifyImage[]; 
    progress: number;
    duration: number;
    uri: string;
  }

  interface LastFmTrackData {
    status: string;
    title: string;
    artist: string;
    images: Record<string, string>;
    trackUrl: string;
  }

  // Reactive state for music data, intervals, and UI
  // --- State ---
  let spotifyData: SpotifyTrackData | null = null;
  let lastFmData: LastFmTrackData | null = null;
  let useLastFm = false;
  let intervalId: ReturnType<typeof setInterval>;
  let progressIntervalId: ReturnType<typeof setInterval>;
  let localProgress = 0;
  let lastFetchTime = 0;
  let currentTime = new Date();
  let darkMode = false;

  // Tailwind CSS classes for consistent card styling and interactions
  // --- Styling Constants ---
  
  const cardBase = `
    bg-[#FAF9F6] dark:bg-[#1E1E22] 
    border-[1.5px] border-[#1A1A1A] dark:border-[#444448] 
    shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] 
    relative z-10 transition-transform duration-300 ease-out
  `;
  
  const interactiveEffect = `
    hover:-translate-y-1 hover:-translate-x-[1px] 
    hover:shadow-[6px_6px_0px_0px_#1A1A1A] dark:hover:shadow-[6px_6px_0px_0px_#55555A]
    active:translate-y-[2px] active:translate-x-[2px] 
    active:shadow-[2px_2px_0px_0px_#1A1A1A] 
    cursor-pointer
  `;

  // Core business logic for fetching and managing music data
  // --- Logic ---

  // Fetches current Spotify track with Last.fm fallback for reliability
  async function fetchSpotifyTrack() {
      try {
          const response = await fetch('https://spotify.kirkr.xyz/api/now-playing');
          if (!response.ok) throw new Error(`Spotify API responded with ${response.status}`);
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
          console.error('Falling back to Last.fm:', error);
          useLastFm = true;
          fetchLastFmTrack();
      }
  }

  async function fetchLastFmTrack() {
      try {
          const response = await fetch('https://lastfm.kirkr.xyz/api/lastfm-track');
          if (!response.ok) throw new Error(`Last.fm API responded with ${response.status}`);
          lastFmData = await response.json();
      } catch (error) {
          console.error('Error fetching Last.fm track:', error);
      }
  }

  // Updates progress bar locally to avoid excessive API calls during playback
  function setupProgressUpdate() {
      if (progressIntervalId) clearInterval(progressIntervalId);
      if (spotifyData?.isPlaying) {
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

  // Utilities for responsive image loading with fallbacks for different music APIs
  // --- Image Handling Logic ---

  /**
   * Generates a standard srcset string from Spotify's array of images.
   * e.g. "url1 640w, url2 300w, url3 64w"
   */
  function generateSpotifySrcset(images: SpotifyImage[]): string {
      if (!images || images.length === 0) return '';
      return images
          .map(img => `${img.url} ${img.width}w`)
          .join(', ');
  }

  /**
   * Generates a srcset string from Last.fm's named size object.
   * We assign approximate widths based on Last.fm standard return sizes:
   * small: 34px, medium: 64px, large: 174px, extralarge: 300px
   */
  function generateLastFmSrcset(images: Record<string, string>): string {
      if (!images) return '';
      const mapping: Record<string, string> = {
          'small': '34w',
          'medium': '64w',
          'large': '174w',
          'extralarge': '300w',
          // mega/original sometimes exist, usually around 500-600px
          'mega': '500w' 
      };

      return Object.entries(images)
          .filter(([size, url]) => url && mapping[size]) // Filter out empty URLs or unknown sizes
          .map(([size, url]) => `${url} ${mapping[size]}`)
          .join(', ');
  }

  /**
   * Fallback for src attribute (legacy browsers or if srcset fails).
   * returns the largest available image.
   */
  function getSpotifyFallback(images: SpotifyImage[]): string {
      if (!images || images.length === 0) return '';
      // Spotify usually sorts largest first, but we sort to be safe
      return [...images].sort((a, b) => b.width - a.width)[0].url;
  }

  function getLastFmFallback(images: Record<string, string>): string {
      if (!images) return '';
      // Return largest to smallest preference
      return images.extralarge || images.large || images.medium || images.small || '';
  }

  // Helper functions for displaying time, dates, and accessibility labels
  // --- Formatters ---

  function formatTime(ms: number) {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function formatAriaLabel(progress: number, duration: number) {
      const progressSeconds = Math.floor(progress / 1000);
      const durationSeconds = Math.floor(duration / 1000);
      return `Song progress: ${Math.floor(progressSeconds / 60)}m ${progressSeconds % 60}s of ${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-GB', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  // Component initialisation, theme setup, and cleanup
  // --- Lifecycle ---

  onMount(() => {
      fetchSpotifyTrack();
      intervalId = setInterval(fetchSpotifyTrack, 60000);
      const clockInterval = setInterval(() => currentTime = new Date(), 1000);

      if (localStorage.getItem('theme') === 'dark' || 
         (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          darkMode = true;
          document.documentElement.classList.add('dark');
      } else {
          darkMode = false;
          document.documentElement.classList.remove('dark');
      }

      return () => {
          clearInterval(clockInterval);
          if (intervalId) clearInterval(intervalId);
          if (progressIntervalId) clearInterval(progressIntervalId);
      };
  });

  $: progressPercentage = spotifyData ? (localProgress / spotifyData.duration) * 100 : 0;
</script>

<!-- PAGE CONTAINER -->
<div class="min-h-full relative text-[#1A1A1A] dark:text-[#E0E0E0] p-4 md:p-8 lg:p-12 flex items-center justify-center font-sans selection:bg-[#FF4D00] selection:text-white overflow-x-hidden transition-colors duration-500">
    
    <!-- CSS GRAIN OVERLAY -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-50 mix-blend-multiply dark:mix-blend-overlay bg-noise"></div>
    
    <main class="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-6 relative z-10">

        <!-- IDENTITY CARD -->
        <div class="lg:col-span-5 {cardBase} p-8 flex flex-col justify-between min-h-[240px] overflow-hidden group">
            <div class="relative z-10">
                <h1 class="font-display font-extrabold text-7xl md:text-8xl leading-[0.8] tracking-tighter text-[#1A1A1A] dark:text-[#EEEEEE]">
                    kirkr<span class="text-[#FF4D00]">.</span><br/>
                    <span class="text-zinc-400 dark:text-[#444448] italic font-serif tracking-normal">xyz</span>
                </h1>
            </div>
            
            <div class="relative z-10 mt-auto pt-6 border-t border-[#1A1A1A]/10 dark:border-white/10 flex justify-between items-end">
                <div class="text-[10px] font-mono px-2 py-0.5 rounded text-[#FF4D00] dark:text-[#FF4D00]">
                    0.01x DEV
                </div>
            </div>
        </div>

        <!-- GITHUB -->
        <div class="lg:col-span-3 {cardBase} {interactiveEffect} flex flex-col relative overflow-hidden group">
            <a href="https://github.com/Kirkr101" target="_blank" class="w-full h-full flex flex-col items-center justify-center p-6 relative">
                 <div class="z-10 flex flex-col items-center text-center gap-3">
                     <svg viewBox="0 0 16 16" class="w-12 h-12 fill-[#1A1A1A] dark:fill-white group-hover:fill-[#FF4D00] transition-colors duration-300 ease-out">
                        <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                     </svg>
                     <div>
                        <h3 class="font-display font-bold text-xl text-[#1A1A1A] dark:text-white uppercase tracking-tight">Github</h3>
                        <div class="flex items-center justify-center gap-1 mt-1">
                            <span class="font-mono text-[10px] text-[#1A1A1A]/50 dark:text-[#E0E0E0]/40 uppercase tracking-widest group-hover:text-[#FF4D00] transition-colors">kirkr101</span>
                            <span class="text-sm leading-none text-[#1A1A1A]/50 dark:text-[#E0E0E0]/40 group-hover:text-[#FF4D00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 relative top-[-1px]">↗</span>
                        </div>
                     </div>
                 </div>
            </a>
        </div>

        <!-- CLOCK -->
        <div class="lg:col-span-4 {cardBase} p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
             <div class="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF4D00] mb-2 font-bold">Local Time: GMT</div>
             <div class="relative">
                <div class="font-display font-bold text-6xl text-[#1A1A1A] dark:text-white tabular-nums tracking-tight leading-none">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
             </div>
             <div class="mt-2 px-3 py-1">
                <span class="font-serif italic text-md text-[#1A1A1A]/60 dark:text-[#E0E0E0]/60">
                    {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
             </div>
        </div>

        <!-- MUSIC PLAYER -->
        <div class="lg:col-span-5 row-span-2 {cardBase} p-6 flex flex-col min-h-[460px]">
            {#if !useLastFm && spotifyData}
                <!-- Spotify Display -->
                <div class="flex justify-between items-center text-sm text-[#1A1A1A]/50 dark:text-[#E0E0E0]/40 uppercase tracking-wider font-bold mb-3 flex-wrap gap-2">
                    <span>{spotifyData.isPlaying ? 'Currently playing' : 'Last played'}</span>
                    <a
                        href="https://open.spotify.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on Spotify"
                        class="text-sm font-normal text-[#1A1A1A]/50 dark:text-[#E0E0E0]/40 no-underline hover:text-[#FF4D00] hover:underline transition-colors inline-flex items-center gap-1.5"
                    >
                        <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        <span>spotify</span>
                    </a>
                </div>

                <div class="flex-1 flex flex-col items-center justify-center gap-6 my-2">
                    <div class="relative w-full aspect-square max-w-[240px]">
                         <!-- Image Loading -->
                         <img 
                            srcset={generateSpotifySrcset(spotifyData.images)}
                            sizes="(max-width: 768px) 100vw, 240px"
                            src={getSpotifyFallback(spotifyData.images)}
                            alt={`Album art for ${spotifyData.title}`} 
                            class="relative w-full h-full object-cover shadow-lg border border-black/10 dark:border-white/10"
                        />
                    </div>
                </div>

                <div class="shrink-0 mt-auto bg-white/25 dark:bg-white/2 p-4 rounded border border-[#1A1A1A]/10 dark:border-[#444448]">
                    <div class="flex flex-col min-w-0 flex-1 mb-4">
                        <h2 class="m-0 font-display font-bold text-xl text-[#1A1A1A] dark:text-white truncate">
                            <a
                                href={spotifyData.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-[#1A1A1A] dark:text-white no-underline hover:underline"
                            >
                                {spotifyData.title}
                            </a>
                        </h2>
                        <p class="m-0 font-mono text-xs text-[#1A1A1A]/50 dark:text-[#E0E0E0]/40 truncate">
                            {spotifyData.artist}
                        </p>
                    </div>

                    <!-- Progress Bar -->
                    {#if spotifyData.isPlaying}
                        <div class="flex flex-col gap-1.5">
                            <div class="w-full h-1 bg-[#1A1A1A]/10 dark:bg-[#444448] rounded-full overflow-hidden">
                                <div
                                    class="h-full bg-[#FF4D00] transition-all duration-100 ease-linear"
                                    style="width: {Math.min(progressPercentage, 100)}%"
                                    aria-label={formatAriaLabel(localProgress, spotifyData.duration)}
                                    role="progressbar"
                                    aria-valuenow={progressPercentage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                            <div class="flex justify-between font-mono text-[9px] font-bold text-[#1A1A1A]/40 dark:text-[#E0E0E0]/30">
                                <span>{formatTime(localProgress)}</span>
                                <span>{formatTime(spotifyData.duration)}</span>
                            </div>
                        </div>
                    {/if}
                </div>
            {:else if useLastFm && lastFmData}
                <!-- Last.fm Display -->
                <div class="flex justify-between items-center text-sm text-[#1A1A1A]/50 dark:text-[#E0E0E0]/40 uppercase tracking-wider font-bold mb-3 flex-wrap gap-2">
                    <span>{lastFmData.status || 'Currently playing'}</span>
                    <a
                        href="https://www.last.fm/user/Kirkr101"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on Last.fm"
                        class="text-sm font-normal text-[#1A1A1A]/50 dark:text-[#E0E0E0]/40 no-underline hover:text-[#FF4D00] hover:underline transition-colors inline-flex items-center gap-1.5"
                    >
                        <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.584 17.209l-.88-2.392s-1.43 1.595-3.573 1.595c-1.897 0-3.244-1.65-3.244-4.289 0-3.381 1.704-4.591 3.382-4.591 2.419 0 3.188 1.567 3.849 3.574l.88 2.75c.879 2.667 2.528 4.811 7.284 4.811 3.409 0 5.719-1.044 5.719-3.793 0-2.227-1.265-3.381-3.629-3.932l-1.76-.385c-1.209-.275-1.566-.77-1.566-1.594 0-.935.742-1.485 1.952-1.485 1.319 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.491-4.729-3.491-2.474 0-4.893.935-4.893 3.931 0 1.87.907 3.052 3.188 3.602l1.869.439c1.402.33 1.869.907 1.869 1.705 0 1.017-.989 1.43-2.858 1.43-2.776 0-3.932-1.457-4.591-3.464l-.907-2.749c-1.155-3.574-2.997-4.894-6.653-4.894-4.041-.001-6.186 2.556-6.186 6.899 0 4.179 2.145 6.433 5.993 6.433 3.107.001 4.591-1.457 4.591-1.457z"/>
                        </svg>
                        <span>last.fm</span>
                    </a>
                </div>

                <div class="flex-1 flex flex-col items-center justify-center gap-6 my-2">
                    <div class="relative w-full aspect-square max-w-[240px]">
                         <!-- Image loading -->
                         <img 
                            srcset={generateLastFmSrcset(lastFmData.images)}
                            sizes="(max-width: 768px) 100vw, 240px"
                            src={getLastFmFallback(lastFmData.images)}
                            alt={`Album art for ${lastFmData.title}`} 
                            class="relative w-full h-full object-cover shadow-lg border border-black/10 dark:border-white/10"
                        />
                    </div>
                </div>

                <div class="shrink-0 mt-auto bg-white/25 dark:bg-white/2 p-4 rounded border border-[#1A1A1A]/10 dark:border-[#444448]">
                    <div class="flex flex-col min-w-0 flex-1">
                        <h2 class="m-0 font-display font-bold text-xl text-[#1A1A1A] dark:text-white truncate">
                            <a
                                href={lastFmData.trackUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-[#1A1A1A] dark:text-white no-underline hover:underline"
                            >
                                {lastFmData.title}
                            </a>
                        </h2>
                        <p class="m-0 font-mono text-xs text-[#1A1A1A]/50 dark:text-[#E0E0E0]/40 truncate">
                            {lastFmData.artist}
                        </p>
                    </div>
                </div>
            {:else}
                <!-- LOADING -->
                <div class="flex-1 flex flex-col items-center justify-center opacity-50 gap-3">
                    <div class="w-8 h-8 border-4 border-[#FF4D00] border-t-transparent rounded-full animate-spin"></div>
                    <span class="font-mono text-xs uppercase">Initialising Audio...</span>
                </div>
            {/if}
        </div>

        <!-- JOURNAL -->
        <div class="lg:col-span-7 row-span-2 {cardBase} flex flex-col min-h-[460px] overflow-hidden">
            <div class="p-6 border-b border-[#1A1A1A] dark:border-[#444448] flex justify-between items-center bg-[#FAF9F6] dark:bg-[#1E1E22]">
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-[#FF4D00]"></div>
                    <h2 class="font-display font-bold text-2xl text-[#1A1A1A] dark:text-[#E0E0E0] tracking-tight">Log Entries</h2>
                </div>
                <a href="/posts" class="group flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-widest text-[#1A1A1A]/50 dark:text-[#E0E0E0]/40 hover:text-[#FF4D00] dark:hover:text-[#FF4D00] transition-colors duration-200">
                    <span>Archives</span>
                    <span class="text-lg leading-none transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                        <svg width="18" height="18" viewBox="0 0 18 18" class="block">
                            <path d="M3 15 L15 3 M7 3 H15 V11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" />
                        </svg>
                    </span>
                </a>
            </div>
            
            <div class="flex-1 flex flex-col overflow-hidden bg-[#FAF9F6] dark:bg-[#1E1E22]">
                <div class="overflow-y-auto custom-scrollbar p-2">
                    {#if recentPosts && recentPosts.length > 0}
                        <div class="flex flex-col gap-1">
                        {#each recentPosts as post, i}
                            <div transition:slide={{ duration: 100 }}>
                                <a href={`/post/${post.file}`} class="block p-4 rounded transition-colors duration-100 group">
                                    <div class="flex flex-col md:flex-row md:items-baseline group">
                                        <h3 class="font-display font-bold text-lg md:text-base text-[#1A1A1A] dark:text-[#E0E0E0] group-hover:text-[#FF4D00] group-hover:underline leading-tight shrink-0 md:max-w-[75%]">
                                            {post.title}
                                        </h3>
                                        <div class="hidden md:block flex-1 mx-4 border-b-2 border-dotted border-[#1A1A1A]/20 dark:border-[#444448] translate-y-[-4px]"></div>
                                        <span class="font-mono text-[10px] text-[#1A1A1A]/40 dark:text-[#E0E0E0]/30 whitespace-nowrap shrink-0 group-hover:text-[#1A1A1A] dark:group-hover:text-white uppercase tracking-widest mt-1 md:mt-0">
                                            {formatDate(post.date)}
                                        </span>
                                    </div>
                                </a>
                            </div>
                        {/each}
                        </div>
                    {:else}
                        <div class="flex flex-col items-center justify-center h-full text-[#1A1A1A]/20 dark:text-[#444448] gap-2">
                            <span class="font-display text-4xl opacity-20">?</span>
                            <span class="font-mono text-xs uppercase tracking-widest">[Database Empty]</span>
                        </div>
                    {/if}
                </div>
            </div>
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

    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(26, 26, 26, 0.1);
        border-radius: 20px;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #444448;
    }
</style>
