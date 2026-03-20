<script lang="ts">
  import { photographyData } from '$lib/photography-data';
  import Lightbox from '$lib/components/Lightbox.svelte';

  let lightboxActive = $state(false);
  let currentImageIndex = $state(0);

  const allImages = Object.entries(photographyData).flatMap(([city, images]) => 
    images.map(img => ({ ...img, city }))
  );

  const openLightbox = (imageId: string) => {
    const index = allImages.findIndex((img) => img.id === imageId);
    currentImageIndex = index;
    lightboxActive = true;
  };

  const closeLightbox = () => {
    lightboxActive = false;
  };

  const goToNext = () => {
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
  };

  const goToPrevious = () => {
    currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
  };

  function handleKeydown(e: KeyboardEvent, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(id);
    }
  }
</script>

<svelte:head>
    <title>Photography | kirkr.xyz</title>
    <meta name="description" content="A collection of photography from various cities." />
</svelte:head>

<div class="min-h-screen flex flex-col items-center px-6 py-6 md:py-16 font-mono">
    <main class="w-full max-w-[600px] anim-row anim-row-1">
        
        <div class="py-7">
            <h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
                <span class="opacity-90">Photography</span><span class="opacity-20"><em class="not-italic italic">.</em></span>
            </h1>
            <div class="font-sans text-[11px] tracking-[0.1em] uppercase text-dim mt-2">selected photos from travels</div>
        </div>

        <div class="h-px bg-bd mb-8"></div>

        {#each Object.entries(photographyData) as [city, images]}
            <section class="mb-12 last:mb-0">
                <div class="py-2 mb-4">
                    <h2 class="font-serif text-[24px] text-white/80 mb-1 leading-none">{city}</h2>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
                    {#each images as image}
                        <div 
                            class="aspect-square overflow-hidden rounded-sm border border-bd cursor-pointer group focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-75"
                            onclick={() => openLightbox(image.id)}
                            onkeydown={(e) => handleKeydown(e, image.id)}
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
  <Lightbox 
    item={allImages[currentImageIndex]}
    currentIndex={currentImageIndex}
    totalItems={allImages.length}
    onClose={closeLightbox}
    onNext={goToNext}
    onPrev={goToPrevious}
  />
{/if}
