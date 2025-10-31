<script lang="ts">
  import { artData } from '$lib/art-data';
  import { onMount, onDestroy } from 'svelte';

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
  };

  const closeLightbox = () => {
    lightboxActive = false;
    imageLoaded = false;
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
    window.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  $: {
    if (typeof document !== 'undefined') {
      if (lightboxActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  $: currentArtData = artEntries[currentArtIndex][1];
</script>

<svelte:head>
  <title>Art | kirkr.xyz</title>
  <meta name="description" content="A curated selection of artworks." />
</svelte:head>

<div class="min-h-screen">
  <div class="p-4 md:p-8">
    <div class="w-full max-w-6xl mx-auto">
      <header class="flex items-center justify-between p-0 mb-8 md:mb-12 mt-8 sm:mt-0">
        <div class="text-center grow">
          <h1 class="text-xl sm:text-2xl mb-2 font-normal">Art</h1>
          <p class="text-sm sm:text-base text-muted-foreground">
            a curated selection of artworks
          </p>
        </div>
      </header>

      <section class="w-full">
        <div class="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
          {#each artEntries as [artId, art]}
            <div
              class="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 mb-4 sm:mb-6 py-0 break-inside-avoid rounded-lg"
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
                  class="relative overflow-hidden bg-muted"
                  style={`aspect-ratio: ${art.aspectRatio}`}
                >
                  <img
                    src={art.thumbnail}
                    alt={`${art.title} by ${art.data.find((item) => item[0] === 'artist')?.[1]}`}
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
      </section>
    </div>
  </div>
</div>

  <!-- Lightbox -->
  {#if lightboxActive}
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8"
      on:click={(e) => {
        if (e.target === e.currentTarget) closeLightbox();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      <!-- Close Button -->
      <button
        class="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all z-10 group"
        on:click={closeLightbox}
        aria-label="Close lightbox"
      >
        X
      </button>

      <!-- Navigation Buttons -->
      {#if artEntries.length > 1}
        <button
          class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
          on:click={goToPrevious}
          disabled={isAnimating}
          aria-label="Previous artwork"
        >
          { '<' }
        </button>
        <button
          class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
          on:click={goToNext}
          disabled={isAnimating}
          aria-label="Next artwork"
        >
          { '>' }
        </button>
      {/if}

      <!-- Counter -->
      <div class="absolute top-4 left-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm z-10">
        {currentArtIndex + 1} / {artEntries.length}
      </div>

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
              class="text-2xl sm:text-3xl font-light mb-2 text-foreground"
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
