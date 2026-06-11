<script lang="ts">
	import { photographyData } from '$lib/photography-list';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { computeVisualOrder } from '$lib/masonry';
	import { createRafObserver } from '$lib/raf-observer';
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let lightboxActive = $state(false);
	let currentImageIndex = $state(0);
	let gridContainer = $state<HTMLElement | null>(null);

	const allImages = Object.entries(photographyData).flatMap(([city, images]) =>
		images.map((img) => ({ ...img, city }))
	);

	const cardEls = new SvelteMap<string, HTMLElement>();
	let visualOrder = $state<string[]>(allImages.map((img) => img.id));

	let exifMap = $state<Record<string, [string, string][]> | null>(null);
	let exifLoadPromise: Promise<Record<string, [string, string][]>> | null = null;

	async function ensureExif() {
		if (exifMap) return exifMap;
		if (!exifLoadPromise) {
			exifLoadPromise = import('$lib/photography-exif').then((m) => {
				exifMap = m.photographyExif;
				return exifMap;
			});
		}
		return exifLoadPromise;
	}

	function updateVisualOrder() {
		if (cardEls.size === 0) return;

		const positions = [];
		for (const [id, el] of cardEls) {
			const rect = el.getBoundingClientRect();
			positions.push({ id, left: rect.left, top: rect.top });
		}

		visualOrder = computeVisualOrder(positions);
	}

	const rafObserver = createRafObserver(updateVisualOrder);

	function registerCard(id: string, el: HTMLElement) {
		cardEls.set(id, el);
		if (cardEls.size === allImages.length) {
			tick().then(updateVisualOrder);

			if (gridContainer) {
				rafObserver.observe(gridContainer);
			}
		}
	}

	function cardAction(el: HTMLElement, id: string) {
		registerCard(id, el);
		return {
			destroy() {
				cardEls.delete(id);
			}
		};
	}

	$effect(() => {
		tick().then(updateVisualOrder);
	});

	$effect(() => {
		return () => {
			rafObserver.destroy();
		};
	});

	const openLightbox = async (imageId: string) => {
		await ensureExif();
		const index = visualOrder.indexOf(imageId);
		currentImageIndex = index >= 0 ? index : 0;
		lightboxActive = true;
	};

	const closeLightbox = () => {
		lightboxActive = false;
	};

	const goToNext = () => {
		currentImageIndex = (currentImageIndex + 1) % visualOrder.length;
	};

	const goToPrevious = () => {
		currentImageIndex = (currentImageIndex - 1 + visualOrder.length) % visualOrder.length;
	};

	function handleKeydown(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openLightbox(id);
		}
	}

	let currentItem = $derived.by(() => {
		const id = visualOrder[currentImageIndex];
		if (!id) return undefined;
		const item = allImages.find((img) => img.id === id);
		if (!item) return undefined;
		return {
			...item,
			...(exifMap ? { exif: exifMap[id] } : {})
		};
	});

	let nextImageUrl = $derived.by<string | undefined>(() => {
		const id = visualOrder[(currentImageIndex + 1) % visualOrder.length];
		if (!id) return undefined;
		return allImages.find((img) => img.id === id)?.url;
	});

	let prevImageUrl = $derived.by<string | undefined>(() => {
		const id = visualOrder[(currentImageIndex - 1 + visualOrder.length) % visualOrder.length];
		if (!id) return undefined;
		return allImages.find((img) => img.id === id)?.url;
	});
</script>

<svelte:head>
	<title>Photography | kirkr.xyz</title>
	<meta name="description" content="A collection of photography from various cities." />
	<link rel="preconnect" href="https://res.cloudinary.com" crossorigin="anonymous" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-mono md:py-16">
	<main class="w-full max-w-5xl">
		<div class="py-7">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Photography</span><span class="opacity-20">.</span>
			</h1>
			<div class="mt-2 font-sans text-[11px] tracking-[0.1em] text-muted uppercase">
				selected photos from travels
			</div>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		<div bind:this={gridContainer}>
			{#each Object.entries(photographyData) as [city, images] (city)}
				<section class="cv-auto mb-16 last:mb-0">
					<div class="mb-6 py-2">
						<h2 class="mb-1 font-serif text-[32px] leading-none text-white/80">{city}</h2>
					</div>

					<div class="columns-1 gap-4 sm:columns-2">
						{#each images as image (image.id)}
							<div
								class="group mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-sm border border-bd transition-all duration-75 focus:ring-1 focus:ring-white/20 focus:outline-none"
								use:cardAction={image.id}
								onclick={() => openLightbox(image.id)}
								onkeydown={(e) => handleKeydown(e, image.id)}
								role="button"
								tabindex="0"
								aria-label={`View photo from ${city}`}
							>
								<img
									src={image.url}
									srcset={image.srcset}
									sizes="(max-width: 640px) 100vw, 50vw"
									alt={`Photo from ${city}`}
									style="aspect-ratio: {image.aspectRatio}"
									class="h-auto w-full object-cover transition-all duration-700 ease-out group-hover:scale-102 group-hover:cursor-zoom-in group-hover:brightness-105"
									loading="lazy"
									decoding="async"
									onload={() => updateVisualOrder()}
								/>
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</main>
</div>

{#if lightboxActive && currentItem}
	<Lightbox
		item={currentItem}
		currentIndex={currentImageIndex}
		totalItems={allImages.length}
		nextUrl={nextImageUrl}
		prevUrl={prevImageUrl}
		onClose={closeLightbox}
		onNext={goToNext}
		onPrev={goToPrevious}
	/>
{/if}
