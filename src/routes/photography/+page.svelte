<script lang="ts">
	import { photographyData } from '$lib/photography-data';
	import Lightbox from '$lib/components/Lightbox.svelte';

	let lightboxActive = $state(false);
	let currentImageIndex = $state(0);

	const allImages = Object.entries(photographyData).flatMap(([city, images]) =>
		images.map((img) => ({ ...img, city }))
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

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-mono md:py-16">
	<main class="anim-row anim-row-1 w-full max-w-[600px]">
		<div class="py-7">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Photography</span><span class="opacity-20"
					><em class="italic not-italic">.</em></span
				>
			</h1>
			<div class="mt-2 font-sans text-[11px] tracking-[0.1em] text-dim uppercase">
				selected photos from travels
			</div>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		{#each Object.entries(photographyData) as [city, images] (city)}
			<section class="mb-12 last:mb-0">
				<div class="mb-4 py-2">
					<h2 class="mb-1 font-serif text-[24px] leading-none text-white/80">{city}</h2>
				</div>

				<div class="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
					{#each images as image (image.id)}
						<div
							class="group aspect-square cursor-pointer overflow-hidden rounded-sm border border-bd transition-all duration-75 focus:ring-1 focus:ring-white/20 focus:outline-none"
							onclick={() => openLightbox(image.id)}
							onkeydown={(e) => handleKeydown(e, image.id)}
							role="button"
							tabindex="0"
							aria-label={`View photo from ${city}`}
						>
							<img
								src={image.url}
								alt={`Photo from ${city}`}
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
