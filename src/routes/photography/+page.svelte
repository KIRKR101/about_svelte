<script lang="ts">
  import { photographyData } from '$lib/photography-data';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  let lightboxActive = false;
  let currentImageIndex = 0;
  let imageLoaded = false;
  let isAnimating = false;

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

<div class="min-h-screen flex flex-col items-center px-6 py-12">
    <main class="w-full max-w-[600px] anim-row anim-row-1">
        
        <div class="py-7">
            <h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white/90">
                Photography<em class="not-italic italic text-white/20">.</em>
            </h1>
            <div class="lbl mt-2">selected photos from travels</div>
        </div>

        <div class="rule mb-8"></div>

        {#each Object.entries(photographyData) as [city, images]}
            <section class="mb-12">
                <div class="py-2 mb-4">
                    <h2 class="font-serif text-[24px] text-white/80 mb-1">{city}</h2>
                    <div class="lbl text-[10px]">collection</div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
                    {#each images as image}
                        <div 
                            class="aspect-square overflow-hidden rounded-sm border border-bd cursor-pointer group"
                            on:click={() => openLightbox(image.id)}
                            role="button"
                            tabindex="0"
                            aria-label={`View photo from ${city}`}
                        >
                            <img 
                                src={image.url} 
                                alt={`Photo from ${city}`} 
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    {/each}
                </div>
            </section>
        {/each}
    </main>
</div>

{#if lightboxActive}
  <div
    class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    on:click={(e) => e.target === e.currentTarget && closeLightbox()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="lightbox-title"
  >
    <button
      class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 border border-bd hover:bg-white/20 transition-colors"
      on:click={closeLightbox}
      aria-label="Close lightbox"
    >
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    {#if allImages.length > 1}
      <button
        class="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 border border-bd hover:bg-white/20 transition-colors"
        on:click={goToPrevious}
        disabled={isAnimating}
        aria-label="Previous image"
      >
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button
        class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 border border-bd hover:bg-white/20 transition-colors"
        on:click={goToNext}
        disabled={isAnimating}
        aria-label="Next image"
      >
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    {/if}

    {#if currentImageData}
      <div class="flex flex-col items-center justify-center w-full h-full overflow-y-auto">
        <div class="flex items-center justify-center w-full max-w-[90vw] max-h-[75vh]">
          <img
            src={currentImageData.url}
            alt={`Photo from ${currentImageData.city}`}
            class={`max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-sm border border-bd transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            on:load={() => (imageLoaded = true)}
          />
        </div>
        <div class="mt-4 text-center px-4 pb-4">
            <div class="text-[14px] text-muted">{currentImageData.city}</div>
            <div class="lbl text-[10px] mt-1">
                {currentImageIndex + 1} / {allImages.length}
            </div>
            {#if currentImageData.exif}
              <div class="flex flex-wrap justify-center gap-3 mt-3">
                {#each currentImageData.exif as [key, value]}
                  <span class="text-[10px] text-white/40">{key}: <span class="text-white/60">{value}</span></span>
                {/each}
              </div>
            {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}