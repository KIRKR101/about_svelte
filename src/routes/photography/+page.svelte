<script lang="ts">
	import { photographyData } from '$lib/photography-data';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let lightboxActive = $state(false);
	let currentImageIndex = $state(0);

	const allImages = Object.entries(photographyData).flatMap(([city, images]) =>
		images.map((img) => ({ ...img, city }))
	);

	const cardEls = new SvelteMap<string, HTMLElement>();
	let visualOrder = $state<string[]>(allImages.map((img) => img.id));

	function computeVisualOrder() {
		if (cardEls.size === 0) return;

		const positions: { id: string; left: number; top: number }[] = [];
		for (const [id, el] of cardEls) {
			const rect = el.getBoundingClientRect();
			positions.push({ id, left: rect.left, top: rect.top });
		}

		const lefts = [...new Set(positions.map((p) => Math.round(p.left)))].sort((a, b) => a - b);
		if (lefts.length === 0) return;

		const COLUMN_TOLERANCE = 10;
		const columns: { id: string; top: number }[][] = lefts.map(() => []);

		for (const pos of positions) {
			let colIdx = lefts.findIndex((l) => Math.abs(l - Math.round(pos.left)) <= COLUMN_TOLERANCE);
			if (colIdx === -1) colIdx = 0;

			const targetCol = columns[colIdx];
			if (targetCol) {
				targetCol.push({ id: pos.id, top: pos.top });
			}
		}

		for (const col of columns) col.sort((a, b) => a.top - b.top);

		const result: string[] = [];
		const maxLen = Math.max(0, ...columns.map((c) => c.length));

		for (let row = 0; row < maxLen; row++) {
			for (const col of columns) {
				const item = col[row];
				if (item) {
					result.push(item.id);
				}
			}
		}
		visualOrder = result;
	}

	let resizeObserver: ResizeObserver | null = null;

	function registerCard(id: string, el: HTMLElement) {
		cardEls.set(id, el);
		if (cardEls.size === allImages.length) {
			tick().then(computeVisualOrder);

			if (!resizeObserver) {
				resizeObserver = new ResizeObserver(() => computeVisualOrder());
				resizeObserver.observe(document.body);
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
		tick().then(computeVisualOrder);
	});

	$effect(() => {
		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	});

	const openLightbox = (imageId: string) => {
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
		return id ? allImages.find((img) => img.id === id) : undefined;
	});
</script>

<svelte:head>
	<title>Photography | kirkr.xyz</title>
	<meta name="description" content="A collection of photography from various cities." />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-mono md:py-16">
	<main class="anim-row anim-row-1 w-full max-w-5xl">
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
			<section class="mb-16 last:mb-0">
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
								alt={`Photo from ${city}`}
								class="h-auto w-full object-cover transition-all duration-700 ease-out group-hover:scale-102 group-hover:cursor-zoom-in group-hover:brightness-105"
								loading="lazy"
							/>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</main>
</div>

{#if lightboxActive && currentItem}
	<Lightbox
		item={currentItem}
		currentIndex={currentImageIndex}
		totalItems={allImages.length}
		onClose={closeLightbox}
		onNext={goToNext}
		onPrev={goToPrevious}
	/>
{/if}
