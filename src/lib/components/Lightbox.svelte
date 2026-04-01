<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

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
  let isClosing = $state(false);
  let isMounted = $state(false);

  function handleClose() {
    if (isClosing) return;
    isClosing = true;
    imageLoaded = false;
    setTimeout(() => {
      onClose();
    }, 300);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleClose();
    if (e.key === 'ArrowRight' && totalItems > 1) handleNext();
    if (e.key === 'ArrowLeft' && totalItems > 1) handlePrev();
  }

  function handleNext() {
    if (isAnimating || isClosing) return;
    isAnimating = true;
    imageLoaded = false;
    onNext();
    setTimeout(() => isAnimating = false, 250);
  }

  function handlePrev() {
    if (isAnimating || isClosing) return;
    isAnimating = true;
    imageLoaded = false;
    onPrev();
    setTimeout(() => isAnimating = false, 250);
  }

  onMount(() => {
    if (browser) {
      isMounted = true;
      window.addEventListener('keydown', handleKeyDown);
      
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        // Expose the variable for the fixed Navbar
        document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`); 
      }
      document.body.style.overflow = 'hidden';
      
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog instanceof HTMLElement) dialog.focus();
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKeyDown);
      
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      // Clean up the variable
      document.documentElement.style.removeProperty('--scrollbar-width');
    }
  });

  $effect(() => {
    if (item) imageLoaded = false;
  });

  const imageUrl = $derived(item.url || item.image);
  const metadata = $derived(item.exif || item.data);
  const title = $derived(item.title || item.city);
</script>

<div
  class="fixed inset-0 bg-[#0b0b0b]/95 flex items-center justify-center z-50 select-none outline-none transition-opacity duration-300 ease-in-out {isMounted && !isClosing ? 'opacity-100' : 'opacity-0'}"
  onmousedown={(e) => {
    if (!(e.target as Element).closest('img, button, .text-container')) {
      handleClose();
    }
  }}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
>
  <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_60%)]"></div>

  <button
    class="absolute top-8 right-8 w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 z-50 text-white"
    onclick={handleClose}
    aria-label="Close lightbox"
  >
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  </button>

  {#if totalItems > 1}
    <button
      class="absolute left-10 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 z-50 text-white disabled:opacity-20"
      onclick={handlePrev}
      disabled={isAnimating || isClosing}
      aria-label="Previous image"
    >
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    <button
      class="absolute right-10 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 z-50 text-white disabled:opacity-20"
      onclick={handleNext}
      disabled={isAnimating || isClosing}
      aria-label="Next image"
    >
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  {/if}

  <div class="flex flex-col items-center w-full h-full max-w-[1500px] mx-auto px-6 md:px-12 py-10 gap-8">
    <div class="flex-1 flex items-center justify-center w-full min-h-0">
      <div class="relative flex items-center justify-center w-full h-full">
        {#if !imageLoaded}
          <div class="absolute font-mono text-[10px] uppercase tracking-widest text-white/20 animate-pulse">
            Loading
          </div>
        {/if}
        <img
          src={imageUrl}
          alt={title}
          class="max-w-full max-h-full w-auto h-auto object-contain transition-all duration-300 {imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}"
          onload={() => (imageLoaded = true)}
        />
      </div>
    </div>

    <div class="text-container shrink-0 w-full max-w-[780px] text-center">
      <div class="font-serif text-[24px] md:text-[30px] text-white/95 leading-tight tracking-tight">
        {title}
      </div>

      <div class="font-mono text-[10px] tracking-[0.18em] uppercase text-white/40 mt-3">
        {currentIndex + 1} / {totalItems}
      </div>

      {#if item.description}
        <p class="font-sans text-[14px] text-white/60 mt-6 leading-relaxed">
          {item.description}
        </p>
      {/if}

      {#if metadata}
        <div class="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-7">
          {#each metadata as [key, value]}
            <div class="font-mono text-[11px] text-white/25 whitespace-nowrap">
              {key}: <span class="text-white/50">{value}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>