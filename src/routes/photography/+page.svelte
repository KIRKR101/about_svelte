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

<div class="min-h-screen">
  <div class="p-4 md:p-8">
    <div class="w-full max-w-6xl mx-auto">
      <header class="flex items-center justify-between p-0 mb-8 md:mb-12 mt-8 sm:mt-0">
        <div class="text-center grow">
          <h1 class="text-xl sm:text-2xl mb-2 font-normal">Photography</h1>
          <p class="text-sm sm:text-base text-muted-foreground">
            selected photos from travels
          </p>
        </div>
      </header>

      {#each Object.entries(photographyData) as [city, images]}
        <section class="w-full mb-16 last:mb-8">
          <div class="flex items-center gap-4 mb-8">
            <h2 class="text-2xl font-light tracking-tight">{city}</h2>
            <div class="h-px bg-border grow"></div>
          </div>
          
          <div class="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
            {#each images as image}
              <div
                class="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 mb-4 sm:mb-6 py-0 break-inside-avoid rounded-lg"
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
                    class="relative overflow-hidden bg-muted"
                    style={`aspect-ratio: ${image.aspectRatio}`}
                  >
                    <img
                      src={image.url}
                      alt={`Photo from ${city}`}
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
      <span class="text-xl">×</span>
    </button>

    <!-- Navigation Buttons -->
    {#if allImages.length > 1}
      <button
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
        on:click={goToPrevious}
        disabled={isAnimating}
        aria-label="Previous image"
      >
        &larr;
      </button>
      <button
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
        on:click={goToNext}
        disabled={isAnimating}
        aria-label="Next image"
      >
        &rarr;
      </button>
    {/if}

    <!-- Counter -->
    <div class="absolute top-4 left-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm z-10">
      {currentImageIndex + 1} / {allImages.length}
    </div>

    {#if currentImageData}
      <div class="bg-card border border-border/50 rounded-xl max-w-6xl lg:max-w-7xl w-full max-h-[90vh] overflow-auto flex flex-col lg:flex-row gap-6 md:gap-8 p-6 md:p-8 shadow-2xl">
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
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
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
                  <tbody class="divide-y divide-border/50">
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
