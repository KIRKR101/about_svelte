<script lang="ts">
  import { photographyData } from '$lib/photography-data';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  let lightboxActive = false;
  let currentImageIndex = 0;
  let imageLoaded = false;
  let isAnimating = false;

  // Flatten the data for lightbox navigation
  const allImages = Object.entries(photographyData).flatMap(([city, images]) => 
    images.map(img => ({ ...img, city }))
  );

  const openLightbox = (imageId: string) => {
    const index = allImages.findIndex((img) => img.id === imageId);
    currentImageIndex = index;
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
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
    setTimeout(() => (isAnimating = false), 300);
  };

  const goToPrevious = () => {
    if (isAnimating) return;
    isAnimating = true;
    imageLoaded = false;
    currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
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

  $: currentImageData = allImages[currentImageIndex];
</script>

<svelte:head>
    <title>Photography | kirkr.xyz</title>
    <meta name="description" content="A collection of photography from various cities." />
</svelte:head>

<!-- PAGE CONTAINER -->
<div class="min-h-full relative text-[#1A1A1A] dark:text-[#E0E0E0] p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center font-sans selection:bg-[#FF4D00] selection:text-white overflow-x-hidden">

    <!-- CSS GRAIN OVERLAY -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-50 mix-blend-multiply dark:mix-blend-overlay bg-noise"></div>

    <main class="w-full max-w-6xl relative z-10">
        <!-- HEADER CARD -->
        <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 mb-6 px-4 py-8 md:p-8 flex flex-col justify-center text-center min-h-[120px]">
            <h1 class="font-display font-extrabold text-4xl md:text-6xl leading-[0.9] md:leading-[0.8] tracking-tight text-[#1A1A1A] dark:text-[#EEEEEE] mb-3">
                Photo<span class="block sm:inline">graphy<span class="text-[#FF4D00]">.</span></span>
            </h1>
            <p class="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-2">
                selected photos from travels
            </p>
        </div>

        <!-- PHOTOGRAPHY SECTIONS -->
        {#each Object.entries(photographyData) as [city, images]}
            <section class="w-full mb-16 last:mb-8">
                <!-- CITY HEADER CARD -->
                <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 mb-6 p-6 flex items-center gap-4">
                    <h2 class="font-display font-bold text-2xl text-[#1A1A1A] dark:text-[#EEEEEE] tracking-tight">{city}</h2>
                    <div class="h-px bg-[#1A1A1A] dark:bg-[#444448] grow"></div>
                </div>

                <!-- PHOTO GRID -->
                <div class="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
                    {#each images as image}
                        <div
                          class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 transition-transform duration-300 ease-out hover:-translate-y-1 hover:-translate-x-[1px] hover:shadow-[6px_6px_0px_0px_#1A1A1A] dark:hover:shadow-[6px_6px_0px_0px_#55555A] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_#1A1A1A] cursor-pointer group overflow-hidden mb-4 sm:mb-6 py-0 break-inside-avoid"
                          on:click={() => openLightbox(image.id)}
                          on:keydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openLightbox(image.id);
                            }
                          }}
                          role="button"
                          tabindex="0"
                          aria-label={`View photo from ${city}`}
                        >
                          <div class="p-0">
                            <div
                              class="relative overflow-hidden bg-[#FAF9F6] dark:bg-[#1E1E22]"
                              style={`aspect-ratio: ${image.aspectRatio}`}
                            >
                              <img
                                src={image.url}
                                alt={`Photo from ${city}`}
                                class="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              </div>
                            </div>
                          </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/each}
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
        <span class="font-mono text-xs text-white/80">{currentImageIndex + 1}</span>
        <span class="text-white/40 mx-1">/</span>
        <span class="font-mono text-xs text-white/60">{allImages.length}</span>
      </div>
    </div>

    <!-- Navigation Buttons -->
    {#if allImages.length > 1}
      <button
        class="absolute left-4 top-1/2 -translate-y-1/2 z-20 group focus:outline-none"
        on:click={goToPrevious}
        disabled={isAnimating}
        aria-label="Previous image"
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
        aria-label="Next image"
      >
        <div class="bg-black/40 dark:bg-white/10 backdrop-blur-sm hover:bg-black/60 dark:hover:bg-white/20 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
          <svg class="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </button>
    {/if}

    {#if currentImageData}
      <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] rounded-xl max-w-6xl lg:max-w-7xl w-full max-h-[90vh] overflow-auto flex flex-col lg:flex-row gap-6 md:gap-8 p-6 md:p-8">
        <div class="flex-1 flex items-center justify-center lg:max-w-[60%]">
          <div class="relative w-full">
            {#if !imageLoaded}
              <div class="absolute inset-0 flex items-center justify-center bg-muted rounded-lg animate-pulse">
                <div class="text-muted-foreground">Loading...</div>
              </div>
            {/if}
            <img
              src={currentImageData.url}
              alt={`Photo from ${currentImageData.city}`}
              class={`w-full h-auto rounded-lg object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              on:load={() => (imageLoaded = true)}
            />
          </div>
        </div>

        <div class="flex-1 lg:max-w-[40%] flex flex-col">
          <h2
            id="lightbox-title"
            class="text-2xl sm:text-3xl font-light mb-1 text-foreground"
          >
            {currentImageData.city}
          </h2>

          <div class="mt-4">
            <h3 class="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">
              EXIF Metadata
            </h3>
            
            {#if currentImageData.exif && currentImageData.exif.length > 0}
              <div class="border border-border/50 rounded-lg overflow-hidden">
                <table class="w-full text-sm text-left border-collapse">
                  <thead class="bg-muted/50">
                    <tr>
                      <th class="px-4 py-2 font-medium text-foreground border-b border-border/50">Property</th>
                      <th class="px-4 py-2 font-medium text-foreground border-b border-border/50">Value</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border/50 font-mono">
                    {#each currentImageData.exif as [key, value]}
                      <tr class="hover:bg-muted/30 transition-colors">
                        <td class="px-4 py-2 text-foreground font-medium">{key}</td>
                        <td class="px-4 py-2 text-muted-foreground">{value}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <div class="p-6 border border-dashed border-border rounded-lg text-center">
                <p class="text-sm text-muted-foreground italic">No EXIF metadata available for this image.</p>
              </div>
            {/if}
          </div>
          
          <div class="mt-auto pt-8">
            <p class="text-xs text-muted-foreground">
              All images are captured by me.
            </p>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
