<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { recentPosts } from '$lib/posts-data';

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

  // --- State ---
  let spotifyData: SpotifyTrackData | null = null;
  let lastFmData: LastFmTrackData | null = null;
  let useLastFm = false;
  let intervalId: ReturnType<typeof setInterval>;
  let progressIntervalId: ReturnType<typeof setInterval>;
  let localProgress = 0;
  let lastFetchTime = 0;
  let currentTime = new Date();

  // --- Logic ---
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

  function getSpotifyFallback(images: SpotifyImage[]): string {
    if (!images || images.length === 0) return '';
    return [...images].sort((a, b) => b.width - a.width)[0].url;
  }

  function generateSpotifySrcset(images: SpotifyImage[]): string {
    if (!images || images.length === 0) return '';
    return images
      .map(img => `${img.url} ${img.width}w`)
      .join(', ');
  }

  function generateLastFmSrcset(images: Record<string, string>): string {
    if (!images) return '';
    const mapping: Record<string, string> = {
      'small': '34w',
      'medium': '64w',
      'large': '174w',
      'extralarge': '300w',
      'mega': '500w'
    };
    return Object.entries(images)
      .filter(([size, url]) => url && mapping[size])
      .map(([size, url]) => `${url} ${mapping[size]}`)
      .join(', ');
  }

  function formatAriaLabel(progress: number, duration: number) {
    const progressPercent = duration > 0 ? Math.round((progress / duration) * 100) : 0;
    return `${progressPercent}% played`;
  }

  function getLastFmFallback(images: Record<string, string>): string {
    if (!images) return '';
    return images.extralarge || images.large || images.medium || images.small || '';
  }

  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  }

  onMount(() => {
    fetchSpotifyTrack();
    intervalId = setInterval(fetchSpotifyTrack, 60000);
    const clockInterval = setInterval(() => currentTime = new Date(), 1000);

    return () => {
      clearInterval(clockInterval);
      if (intervalId) clearInterval(intervalId);
      if (progressIntervalId) clearInterval(progressIntervalId);
    };
  });

  $: progressPercentage = spotifyData ? (localProgress / spotifyData.duration) * 100 : 0;
  $: displayTime = currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  $: displayDay = currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Geist+Mono:wght@300;400;500&family=Geist:wght@300;400;500;600&display=swap" rel="stylesheet"/>
</svelte:head>

<style>
  :global(body) {
    background-color: #0a0a0b;
    color: white;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @keyframes fu {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  
  .anim-row   { animation: fu 0.3s ease both; }
  .anim-row-1 { animation-delay: 0.00s; }
  .anim-row-2 { animation-delay: 0.04s; }
  .anim-row-3 { animation-delay: 0.08s; }
  .anim-row-4 { animation-delay: 0.11s; }
  .anim-row-5 { animation-delay: 0.14s; }

  :root {
    --bd:      rgba(255,255,255,0.08);
    --dim:     rgba(255,255,255,0.32);
    --muted:   rgba(255,255,255,0.45);
    --entry:   rgba(255,255,255,0.45);
    --entry-h: rgba(255,255,255,0.85);
    --prog:    rgba(255,255,255,0.45);
    --rail:    rgba(255,255,255,0.07);
    --art-bg:  #1a1a1c;
    --sep:     rgba(255,255,255,0.055);
  }

  .rule { height: 1px; background: var(--bd); }
  .split-divider { border-right: 1px solid var(--bd); }

  .lbl {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dim);
  }

  .prog-rail { height: 1px; background: var(--rail); position: relative; margin-top: 14px; }
  .prog-fill { position: absolute; inset-y: 0; left: 0; height: 100%; background: var(--prog); transition: width 0.1s linear; }
  .prog-head {
    position: absolute;
    top: -3.5px;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: white;
    transform: translateX(-4px);
  }

  .entry {
    display: flex;
    align-items: baseline;
    gap: 14px;
    padding: 11px 0;
    border-bottom: 1px solid var(--sep);
    text-decoration: none;
  }
  .entry:last-child { border-bottom: none; }
  .entry-title {
    font-family: 'Instrument Serif', serif;
    font-size: 18px;
    line-height: 1.35;
    color: var(--entry);
    flex: 1;
    transition: color 0.07s;
  }
  .entry:hover .entry-title { color: var(--entry-h); }
  .entry-date {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--dim);
    white-space: nowrap;
  }

  .gh-link {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: inherit;
    transition: opacity 0.07s;
  }
  .gh-link:hover { opacity: 0.7; }
  .gh-link svg { fill: var(--muted); }

  .arc-link {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dim);
    text-decoration: none;
    transition: color 0.07s;
  }
  .arc-link:hover { color: rgba(255,255,255,0.55); }

  .font-serif { font-family: 'Instrument Serif', Georgia, serif; }
  .font-mono { font-family: 'Geist Mono', monospace; }
</style>

<div class="min-h-screen flex items-start justify-center px-6 py-16 font-mono">
  <div class="w-full max-w-[600px]">

    <!-- ── IDENTITY ─────────────────────────────────────────── -->
    <div class="anim-row anim-row-1 py-7">
      <div class="font-serif text-[58px] leading-[0.92] tracking-[-1.5px]" style="color:rgba(255,255,255,0.90)">
        kirkr<em class="not-italic italic" style="color:rgba(255,255,255,0.18)">.</em><span style="color:rgba(255,255,255,0.18)">xyz</span>
      </div>
      <div class="lbl mt-3.5">
      </div>
    </div>

    <!-- ── RULE ──────────────────────────────────────────────── -->
    <div class="anim-row anim-row-2 rule"></div>

    <!-- ── CLOCK + GITHUB ────────────────────────────────────── -->
    <div class="anim-row anim-row-3 py-7 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0">

      <!-- Clock -->
      <div class="pr-0 md:pr-6 md:split-divider pb-6 md:pb-0 border-b md:border-b-0 border-[var(--bd)]">
        <div class="lbl mb-3.5">Local time · GMT</div>
        <div class="font-serif text-[32px] md:text-[40px] leading-none tracking-[-1.5px]"
             style="color:rgba(255,255,255,0.85)">{displayTime}</div>
        <div class="font-serif italic text-xs mt-1.5"
             style="color:rgba(255,255,255,0.45)">{displayDay}</div>
      </div>

      <!-- GitHub -->
      <div class="pl-0 md:pl-6 flex flex-col justify-center">
        <div class="lbl mb-3.5">Open source</div>
        <a href="https://github.com/Kirkr101" target="_blank" class="gh-link">
          <svg viewBox="0 0 16 16" class="w-5 h-5 md:w-6 md:h-6 shrink-0">
            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span class="font-serif text-[24px] md:text-[28px] leading-none tracking-[-0.5px]" style="color:rgba(255,255,255,0.70)">Kirkr101</span>
        </a>
        <div class="lbl mt-2 ml-[30px] md:ml-[36px]">github.com ↗</div>
      </div>

    </div>

    <!-- ── RULE ──────────────────────────────────────────────── -->
    <div class="anim-row anim-row-3 rule"></div>

    <!-- ── MUSIC ─────────────────────────────────────────────── -->
    <div class="anim-row anim-row-4 py-7">

      <div class="flex justify-between items-center mb-4">
        <div class="lbl">Now playing · {useLastFm ? 'Last.fm' : 'Spotify'}</div>
      </div>

      {#if (!useLastFm && spotifyData) || (useLastFm && lastFmData)}
        <div class="flex gap-3 sm:gap-4 items-start">
          <div class="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-[3px] flex items-center justify-center overflow-hidden"
               style="background:var(--art-bg); border:1px solid var(--bd)">
            {#if !useLastFm && spotifyData}
              <img 
                srcset={generateSpotifySrcset(spotifyData.images)}
                sizes="(max-width: 768px) 80px, 96px"
                src={getSpotifyFallback(spotifyData.images)} 
                alt={spotifyData.title} 
                class="w-full h-full object-cover" 
              />
            {:else if useLastFm && lastFmData}
              <img 
                srcset={generateLastFmSrcset(lastFmData.images)}
                sizes="(max-width: 768px) 80px, 96px"
                src={getLastFmFallback(lastFmData.images)} 
                alt={lastFmData.title} 
                class="w-full h-full object-cover" 
              />
            {/if}
          </div>
          <div class="flex-1 min-w-0 pt-0.5">
            <div class="font-serif text-[16px] sm:text-[18px] leading-snug mb-1" style="color:rgba(255,255,255,0.78)">
              {#if !useLastFm && spotifyData}
                {spotifyData.title}
              {:else if useLastFm && lastFmData}
                <a href={lastFmData.trackUrl} target="_blank" rel="noopener noreferrer" class="text-white hover:text-white" style="text-decoration:none">
                  {lastFmData.title}
                </a>
              {/if}
            </div>
            <div class="text-[10px] sm:text-[11px] tracking-[0.04em]" style="color:var(--muted)">
              {#if !useLastFm && spotifyData}
                {spotifyData.artist} {spotifyData.album ? ` · ${spotifyData.album}` : ''}
              {:else if useLastFm && lastFmData}
                {lastFmData.artist}
              {/if}
            </div>
            
            {#if !useLastFm && spotifyData?.isPlaying}
              <div class="prog-rail">
                <div class="prog-fill" style="width: {progressPercentage}%"></div>
                <div class="prog-head" style="left: {progressPercentage}%"></div>
              </div>
              <div class="flex justify-between mt-1.5 text-[9px] sm:text-[10px]" style="color:var(--dim)">
                <span>{formatTime(localProgress)}</span><span>{formatTime(spotifyData.duration)}</span>
              </div>
            {:else}
               <div class="prog-rail"></div>
            {/if}
          </div>
        </div>
      {:else}
        <!-- Loading State -->
        <div class="flex gap-3 sm:gap-4 items-start">
          <div class="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-[3px] flex items-center justify-center overflow-hidden"
               style="background:var(--art-bg); border:1px solid var(--bd)">
            <svg viewBox="0 0 24 24" class="w-6 h-6 sm:w-7 sm:h-7" style="fill:rgba(255,255,255,0.12)">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0 pt-0.5">
            <div class="font-serif text-[16px] sm:text-[18px] leading-snug mb-1" style="color:rgba(255,255,255,0.78)">
              Initialising...
            </div>
            <div class="text-[10px] sm:text-[11px] tracking-[0.04em]" style="color:var(--muted)">
              ...
            </div>
            <div class="prog-rail"></div>
          </div>
        </div>
      {/if}

    </div>

    <!-- ── RULE ──────────────────────────────────────────────── -->
    <div class="anim-row anim-row-4 rule"></div>

    <!-- ── LOG ENTRIES ───────────────────────────────────────── -->
    <div class="anim-row anim-row-5 pt-7">

      <div class="flex justify-between items-center mb-1.5">
        <div class="lbl">Log entries</div>
        <a href="/posts" class="arc-link">All posts ↗</a>
      </div>

      {#each recentPosts.slice(0, 5) as post}
        <a href={`/post/${post.file}`} class="entry">
          <span class="entry-title">{post.title}</span>
          <span class="entry-date">{formatDate(post.date)}</span>
        </a>
      {/each}

    </div>

  </div>
</div>
