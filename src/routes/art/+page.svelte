<script lang="ts">
  import { artData } from '$lib/art-data';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Lightbox from '$lib/components/Lightbox.svelte';

  let lightboxActive = $state(false);
  let currentArtIndex = $state(0);

  const artEntries = Object.entries(artData);

  const openLightbox = (artId: string) => {
    const index = artEntries.findIndex(([id]) => id === artId);
    currentArtIndex = index;
    lightboxActive = true;
  };

  const closeLightbox = () => {
    lightboxActive = false;
  };

  const goToNext = () => {
    currentArtIndex = (currentArtIndex + 1) % artEntries.length;
  };

  const goToPrevious = () => {
    currentArtIndex = (currentArtIndex - 1 + artEntries.length) % artEntries.length;
  };

  function handleKeydown(e: KeyboardEvent, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(id);
    }
  }

  let currentArtData = $derived(artEntries[currentArtIndex]?.[1]);
</script>

<svelte:head>
    <title>Art | kirkr.xyz</title>
    <meta name="description" content="A curated selection of artworks." />
</svelte:head>

<div class="min-h-screen flex flex-col items-center px-6 py-6 md:py-16 font-mono">
    <main class="w-full max-w-[600px] anim-row anim-row-1">
        
        <div class="py-7">
            <h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
                <span class="opacity-90">Art</span><span class="opacity-20"><em class="not-italic italic">.</em></span>
            </h1>
            <div class="font-mono text-[11px] tracking-[0.1em] uppercase text-dim mt-2">a collection of artworks</div>
        </div>

        <div class="h-px bg-bd mb-8"></div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
            {#each artEntries as [id, artwork]}
                <div 
                    class="flex flex-col gap-2 group cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/20 rounded-sm p-1 -m-1 transition-all duration-75"
                    onclick={() => openLightbox(id)}
                    onkeydown={(e) => handleKeydown(e, id)}
                    role="button"
                    tabindex="0"
                    aria-label={`View ${artwork.title}`}
                >
                    <img 
                        src={artwork.thumbnail} 
                        alt={artwork.title} 
                        class="w-full aspect-square object-cover rounded-sm border border-bd group-hover:opacity-90 transition-opacity duration-75"
                    />
                    <div class="font-serif text-[16px] text-muted truncate">{artwork.title}</div>
                </div>
            {/each}
        </div>
    </main>
</div>

{#if lightboxActive && currentArtData}
  <Lightbox 
    item={{
        ...currentArtData,
        description: currentArtData.description,
        data: currentArtData.data as [string, string][]
    }}
    currentIndex={currentArtIndex}
    totalItems={artEntries.length}
    onClose={closeLightbox}
    onNext={goToNext}
    onPrev={goToPrevious}
  />
{/if}