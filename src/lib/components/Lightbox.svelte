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

	let { item, currentIndex, totalItems, onClose, onNext, onPrev }: LightboxProps = $props();

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
		setTimeout(() => (isAnimating = false), 250);
	}

	function handlePrev() {
		if (isAnimating || isClosing) return;
		isAnimating = true;
		imageLoaded = false;
		onPrev();
		setTimeout(() => (isAnimating = false), 250);
	}

	onMount(() => {
		if (browser) {
			isMounted = true;
			window.addEventListener('keydown', handleKeyDown);

			// Account for scrollbar width when the body overflow is hidden,
			// preventing layout shift by applying padding to the body.
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			if (scrollbarWidth > 0) {
				document.body.style.paddingRight = `${scrollbarWidth}px`;
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
	class="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0b]/95 transition-opacity duration-300 ease-in-out outline-none select-none {isMounted &&
	!isClosing
		? 'opacity-100'
		: 'opacity-0'}"
	onmousedown={(e) => {
		if (!(e.target as Element).closest('img, button, .text-container')) {
			handleClose();
		}
	}}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_60%)]"
	></div>

	<button
		class="absolute top-8 right-8 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-200 hover:bg-white/10"
		onclick={handleClose}
		aria-label="Close lightbox"
	>
		<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
			<path d="M18 6L6 18M6 6l12 12" />
		</svg>
	</button>

	{#if totalItems > 1}
		<button
			class="absolute top-1/2 left-10 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-20"
			onclick={handlePrev}
			disabled={isAnimating || isClosing}
			aria-label="Previous image"
		>
			<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</button>

		<button
			class="absolute top-1/2 right-10 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-20"
			onclick={handleNext}
			disabled={isAnimating || isClosing}
			aria-label="Next image"
		>
			<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 18l6-6-6-6" />
			</svg>
		</button>
	{/if}

	<div
		class="mx-auto flex h-full w-full max-w-[1500px] flex-col items-center gap-8 px-6 py-10 md:px-12"
	>
		<div class="flex min-h-0 w-full flex-1 items-center justify-center">
			<div class="relative flex h-full w-full items-center justify-center">
				{#if !imageLoaded}
					<div
						class="absolute animate-pulse font-mono text-[10px] tracking-widest text-white/20 uppercase"
					>
						Loading
					</div>
				{/if}
				<img
					src={imageUrl}
					alt={title}
					class="h-auto max-h-full w-auto max-w-full object-contain transition-all duration-300 {imageLoaded
						? 'scale-100 opacity-100'
						: 'scale-[0.98] opacity-0'}"
					onload={() => (imageLoaded = true)}
				/>
			</div>
		</div>

		<div class="text-container w-full max-w-[780px] shrink-0 text-center">
			<div class="font-serif text-[24px] leading-tight tracking-tight text-white/95 md:text-[30px]">
				{title}
			</div>

			<div class="mt-3 font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
				{currentIndex + 1} / {totalItems}
			</div>

			{#if item.description}
				<p class="mt-6 font-sans text-[14px] leading-relaxed text-white/60">
					{item.description}
				</p>
			{/if}

			{#if metadata}
				<div class="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-3">
					{#each metadata as [key, value] (key)}
						<div class="font-mono text-[11px] whitespace-nowrap text-white/25">
							{key}: <span class="text-white/50">{value}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
