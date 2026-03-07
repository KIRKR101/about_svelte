<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { fade } from 'svelte/transition';

  interface LightboxProps {
    item: {
      url?: string;
      image?: string;
      title?: string;
      city?: string;
      description?: string;
      exif?: [string, string][];
      data?: [string, string][];
    };
    currentIndex: number;
    totalItems: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
  }

  let { 
    item, 
    currentIndex, 
    totalItems, 
    onClose, 
    onNext, 
    onPrev 
  }: LightboxProps = $props();

  let imageLoaded = $state(false);
  let isAnimating = $state(false);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight' && totalItems > 1) {
      handleNext();
    }
    if (e.key === 'ArrowLeft' && totalItems > 1) {
      handlePrev();
    }
  }

  function handleNext() {
    if (isAnimating) return;
    isAnimating = true;
    imageLoaded = false;
    onNext();
    setTimeout(() => isAnimating = false, 300);
  }

  function handlePrev() {
    if (isAnimating) return;
    isAnimating = true;
    imageLoaded = false;
    onPrev();
    setTimeout(() => isAnimating = false, 300);
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Auto-focus the dialog for a11y
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog instanceof HTMLElement) dialog.focus();
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }
  });

  // Track item changes to reset loader
  $effect(() => {
    if (item) {
      // Small delay to prevent flash if cached
      imageLoaded = false;
    }
  });

  const imageUrl = $derived(item.url || item.image);
  const metadata = $derived(item.exif || item.data);
  const title = $derived(item.title || item.city);
</script>

<div
  class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none outline-none"
  onmousedown={(e) => e.target === e.currentTarget && onClose()}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
  transition:fade={{ duration: 75 }}
>
  <!-- Close Button -->
  <button
    class="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-75 z-50 text-white"
    onclick={onClose}
    aria-label="Close lightbox"
  >
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  </button>

  <!-- Navigation -->
  {#if totalItems > 1}
    <button
      class="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-75 z-50 text-white disabled:opacity-30"
      onclick={handlePrev}
      disabled={isAnimating}
      aria-label="Previous image"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
    <button
      class="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-75 z-50 text-white disabled:opacity-30"
      onclick={handleNext}
      disabled={isAnimating}
      aria-label="Next image"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  {/if}

  <div class="flex flex-col items-center w-full h-full max-w-[1400px] mx-auto overflow-hidden">
    <!-- Image Section (Centered in available space) -->
    <div class="flex-1 flex items-center justify-center w-full pt-6 px-2 pb-2 sm:pt-8 sm:px-6 sm:pb-4 md:pt-12 md:px-10 md:pb-6 min-h-0 pointer-events-auto"
         onmousedown={(e) => e.target === e.currentTarget && onClose()}
         role="presentation">
      <div class="relative flex items-center justify-center w-full h-full">
        {#if !imageLoaded}
          <div class="absolute font-mono text-[10px] uppercase tracking-widest text-white/20 animate-pulse">
            Loading...
          </div>
        {/if}
        <img
          src={imageUrl}
          alt={title}
          class="max-w-full max-h-full w-auto h-auto object-contain rounded-sm border border-white/5 shadow-2xl transition-opacity duration-150 {imageLoaded ? 'opacity-100' : 'opacity-0'}"
          onload={() => (imageLoaded = true)}
        />
      </div>
    </div>

    <!-- Info Section (Below image, never overlapping) -->
    <div class="w-full max-w-[900px] mx-auto px-6 pb-10 md:pb-16 text-center shrink-0 pointer-events-auto">
      <div class="font-serif text-[22px] md:text-[26px] text-white/90 leading-none tracking-tight">
        {title}
      </div>
      
      <div class="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mt-3">
        {currentIndex + 1} / {totalItems}
      </div>

      {#if item.description}
        <p class="font-sans text-[13px] text-white/50 mt-5 max-w-[650px] mx-auto leading-relaxed">
          {item.description}
        </p>
      {/if}

      {#if metadata}
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6">
          {#each metadata as [key, value]}
            <div class="font-mono text-[10px] lowercase text-white/20 whitespace-nowrap">
              {key}: <span class="text-white/40">{value}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
