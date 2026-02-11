<script lang="ts">
  import { artData } from '$lib/art-data';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  let lightboxActive = false;
  let currentArtIndex = 0;
  let imageLoaded = false;
  let isAnimating = false;

  const artEntries = Object.entries(artData);

  const openLightbox = (artId: string) => {
    const index = artEntries.findIndex(([id]) => id === artId);
    currentArtIndex = index;
    lightboxActive = true;
    imageLoaded = false;
    if (browser) {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    lightboxActive = false;
    imageLoaded = false;
    if (browser) {
      document.body.style.overflow = '';
    }
  };

  const goToNext = () => {
    if (isAnimating) return;
    isAnimating = true;
    imageLoaded = false;
    currentArtIndex = (currentArtIndex + 1) % artEntries.length;
    setTimeout(() => (isAnimating = false), 300);
  };

  const goToPrevious = () => {
    if (isAnimating) return;
    isAnimating = true;
    imageLoaded = false;
    currentArtIndex = (currentArtIndex - 1 + artEntries.length) % artEntries.length;
    setTimeout(() => (isAnimating = false), 300);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!lightboxActive) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    }
  };

  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleKeyDown);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKeyDown);
    }
  });

  $: currentArtData = artEntries[currentArtIndex][1];
</script>

<svelte:head>
    <title>Art | kirkr.xyz</title>
    <meta name="description" content="A curated selection of artworks." />
</svelte:head>

<!-- PAGE CONTAINER -->
<div class="min-h-full relative text-[#1A1A1A] dark:text-[#E0E0E0] p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center font-sans selection:bg-[#FF4D00] selection:text-white overflow-x-hidden">

    <!-- CSS GRAIN OVERLAY -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-50 mix-blend-multiply dark:mix-blend-overlay bg-noise"></div>

    <main class="w-full max-w-6xl relative z-10">
        <!-- HEADER CARD -->
        <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 mb-6 p-8 flex flex-col justify-center text-center min-h-[120px]">
            <h1 class="font-display font-extrabold text-5xl md:text-6xl leading-[0.8] tracking-tight text-[#1A1A1A] dark:text-[#EEEEEE] mb-3">
                Art<span class="text-[#FF4D00]">.</span>
            </h1>
            <p class="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-2">
                a curated selection of artworks
            </p>
        </div>

        <!-- ART GRID -->
        <div class="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
          {#each artEntries as [artId, art]}
            <div
              class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 transition-transform duration-300 ease-out hover:-translate-y-1 hover:-translate-x-[1px] hover:shadow-[6px_6px_0px_0px_#1A1A1A] dark:hover:shadow-[6px_6px_0px_0px_#55555A] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_#1A1A1A] cursor-pointer group cursor-pointer overflow-hidden mb-4 sm:mb-6 py-0 break-inside-avoid"
              on:click={() => openLightbox(artId)}
              on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(artId);
                }
              }}
              role="button"
              tabindex="0"
              aria-label={`View ${art.title} by ${art.data.find((item) => item[0] === 'artist')?.[1]}`}
            >
              <div class="p-0">
                <div
                  class="relative overflow-hidden bg-[#FAF9F6] dark:bg-[#1E1E22]"
                  style={`aspect-ratio: ${art.aspectRatio}`}
                >
                  <img
                    src={art.thumbnail}
                    alt={`${art.title} by ${art.data.find((item) => item[0] === 'artist')?.[1]}`}
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 class="text-lg font-medium text-white mb-1">
                      {art.title}
                    </h3>
                    <p class="text-sm text-white/90">
                      {art.data.find((item) => item[0] === 'artist')?.[1]}
                    </p>
                    <p class="text-xs text-white/70 mt-1">
                      {art.data.find((item) => item[0] === 'year')?.[1]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
    </main>
</div>

<!-- Lightbox -->
  {#if lightboxActive}
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8"
      on:click={(e) => {
        if (e.target === e.currentTarget) closeLightbox();
      }}
      on:keydown={(e) => {
        if (e.key === 'Escape') closeLightbox();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      tabindex="-1"
    >
      <!-- Close Button -->
      <button
        class="absolute top-4 right-4 z-20 group focus:outline-none"
        on:click={closeLightbox}
        aria-label="Close lightbox"
      >
        <div class="bg-black/40 dark:bg-white/10 backdrop-blur-sm hover:bg-black/60 dark:hover:bg-white/20 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
          <svg class="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </button>

      <!-- Counter -->
      <div class="absolute top-4 left-4 z-20">
        <div class="bg-black/40 dark:bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
          <span class="font-mono text-xs text-white/80">{currentArtIndex + 1}</span>
          <span class="text-white/40 mx-1">/</span>
          <span class="font-mono text-xs text-white/60">{artEntries.length}</span>
        </div>
      </div>

      <!-- Navigation Buttons -->
      {#if artEntries.length > 1}
        <button
          class="absolute left-4 top-1/2 -translate-y-1/2 z-20 group focus:outline-none"
          on:click={goToPrevious}
          disabled={isAnimating}
          aria-label="Previous artwork"
        >
          <div class="bg-black/40 dark:bg-white/10 backdrop-blur-sm hover:bg-black/60 dark:hover:bg-white/20 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
            <svg class="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </div>
        </button>
        <button
          class="absolute right-4 top-1/2 -translate-y-1/2 z-20 group focus:outline-none"
          on:click={goToNext}
          disabled={isAnimating}
          aria-label="Next artwork"
        >
          <div class="bg-black/40 dark:bg-white/10 backdrop-blur-sm hover:bg-black/60 dark:hover:bg-white/20 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
            <svg class="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </button>
      {/if}

      {#if currentArtData}
        <div class="bg-card border border-border/50 rounded-xl max-w-6xl lg:max-w-7xl w-full max-h-[90vh] overflow-auto flex flex-col lg:flex-row gap-6 md:gap-8 p-6 md:p-8 shadow-2xl">
          <div class="flex-1 flex items-center justify-center lg:max-w-[55%]">
            <div class="relative w-full">
              {#if !imageLoaded}
                <div class="absolute inset-0 flex items-center justify-center bg-muted rounded-lg animate-pulse">
                  <div class="text-muted-foreground">Loading...</div>
                </div>
              {/if}
              <img
                src={currentArtData.image}
                alt={`${currentArtData.title} by ${currentArtData.data.find((item) => item[0] === 'artist')?.[1]}`}
                class={`w-full h-auto rounded-lg object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                on:load={() => (imageLoaded = true)}
              />
            </div>
          </div>

          <div class="flex-1 lg:max-w-[45%] flex flex-col">
            <h2
              id="lightbox-title"
              class="text-2xl sm:text-3xl font-display font-bold mb-2 text-[#1A1A1A] dark:text-[#EEEEEE]"
            >
              {currentArtData.title}
            </h2>

            <p class="text-lg text-muted-foreground mb-6">
              {currentArtData.data.find((item) => item[0] === 'artist')?.[1]},
              {currentArtData.data.find((item) => item[0] === 'year')?.[1]}
            </p>

            <p class="text-sm sm:text-base text-foreground/80 leading-relaxed mb-8">
              {currentArtData.description}
            </p>

            <div class="mt-auto">
              <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Details
              </h3>
              <div class="space-y-3">
                {#each currentArtData.data as [key, value]}
                  <div
                    class="flex justify-between items-baseline pb-3 border-b border-border/50 last:border-0"
                  >
                    <span class="text-sm font-medium text-foreground capitalize">
                      {key}
                    </span>
                    <span class="text-sm text-muted-foreground text-right">
                      {value}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
