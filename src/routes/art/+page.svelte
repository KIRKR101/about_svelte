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

  $: currentArtData = artEntries[currentArtIndex]?.[1];
</script>

<svelte:head>
    <title>Art | kirkr.xyz</title>
    <meta name="description" content="A curated selection of artworks." />
</svelte:head>

<div class="min-h-screen flex flex-col items-center px-6 py-12">
    <main class="w-full max-w-[600px] anim-row anim-row-1">
        
        <div class="py-7">
            <h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white/90">
                Art<em class="not-italic italic text-white/20">.</em>
            </h1>
            <div class="lbl mt-2">a collection of artworks</div>
        </div>

        <div class="rule mb-8"></div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
            {#each artEntries as [id, artwork]}
                <div 
                    class="flex flex-col gap-2 group cursor-pointer"
                    on:click={() => openLightbox(id)}
                    role="button"
                    tabindex="0"
                    aria-label={`View ${artwork.title}`}
                >
                    <img 
                        src={artwork.thumbnail} 
                        alt={artwork.title} 
                        class="w-full aspect-square object-cover rounded-sm border border-bd group-hover:opacity-90 transition-opacity"
                    />
                    <div class="font-serif text-[16px] text-muted truncate">{artwork.title}</div>
                </div>
            {/each}
        </div>
    </main>
</div>

{#if lightboxActive && currentArtData}
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

    {#if artEntries.length > 1}
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

    <div class="flex flex-col items-center justify-center w-full h-full overflow-y-auto">
      <div class="flex items-center justify-center w-full max-w-[90vw] max-h-[75vh]">
        <img
          src={currentArtData.image}
          alt={currentArtData.title}
          class={`max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-sm border border-bd transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          on:load={() => (imageLoaded = true)}
        />
      </div>
      <div class="mt-4 text-center px-4 pb-4">
          <div class="text-[14px] text-white/80">{currentArtData.title}</div>
          <div class="lbl text-[10px] mt-1">
              {currentArtIndex + 1} / {artEntries.length}
          </div>
          {#if currentArtData.description}
            <p class="font-sans text-[12px] text-muted mt-3 max-w-lg mx-auto">{currentArtData.description}</p>
          {/if}
          {#if currentArtData.data}
            <div class="flex flex-wrap justify-center gap-3 mt-3">
              {#each currentArtData.data as [key, value]}
                <span class="text-[10px] text-white/40">{key}: <span class="text-white/60">{value}</span></span>
              {/each}
            </div>
          {/if}
      </div>
    </div>
  </div>
{/if}