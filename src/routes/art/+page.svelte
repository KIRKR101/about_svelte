<script lang="ts">
	import Lightbox from '$lib/components/Lightbox.svelte';
	import ArtInfobox from '$lib/components/ArtInfobox.svelte';
	import ArtBibliographySection from '$lib/components/ArtBibliography.svelte';
	import ArtExternalLinks from '$lib/components/ArtExternalLinks.svelte';
	import ArtFootnotePanel from '$lib/components/ArtFootnotePanel.svelte';
	import { getMetaValue, getIiifSrcset } from '$lib/utils';
	import { computeVisualOrder } from '$lib/masonry';
	import { createRafObserver } from '$lib/raf-observer';
	import { tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { SvelteMap } from 'svelte/reactivity';

	interface ArtEntry {
		id: string;
		title: string;
		thumbnail: string;
		image: string;
		description: string;
		aspectRatio: string;
		data: [string, string][];
	}

	interface PageData {
		entries: ArtEntry[];
		bibliography: {
			title: string;
			author: string;
			year: string;
			journal?: string;
			url?: string;
			description?: string;
		}[];
	}

	let { data }: { data: PageData } = $props();

	let lightboxActive = $state(false);
	let currentArtIndex = $state(0);
	let activeTab = $state('gallery');
	let footnoteVisible = $state(false);
	let berchemFootnoteVisible = $state(false);
	let gridContainer = $state<HTMLElement | null>(null);

	const artEntries: [string, ArtEntry][] = data.entries.map((entry) => [entry.id, entry]);

	let shuffledEntries = $state<[string, ArtEntry][]>([...artEntries]);

	const cardEls = new SvelteMap<string, HTMLElement>();

	let visualOrder = $state<string[]>(artEntries.map(([id]) => id));

	let entriesWithMeta = $derived(
		shuffledEntries.map(([id, artwork]) => ({
			id,
			artwork,
			artist: getMetaValue(artwork.data, 'artist'),
			year: getMetaValue(artwork.data, 'year'),
			thumbnailSrcset: getIiifSrcset(artwork.thumbnail)
		}))
	);

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
		if (cardEls.size === shuffledEntries.length) {
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
		shuffledEntries = [...artEntries].sort(() => Math.random() - 0.5);
		tick().then(updateVisualOrder);
	});

	$effect(() => {
		return () => {
			rafObserver.destroy();
		};
	});

	const openLightbox = (artId: string) => {
		const index = visualOrder.indexOf(artId);
		currentArtIndex = index >= 0 ? index : 0;
		lightboxActive = true;
	};

	const closeLightbox = () => (lightboxActive = false);
	const goToNext = () => (currentArtIndex = (currentArtIndex + 1) % visualOrder.length);
	const goToPrevious = () =>
		(currentArtIndex = (currentArtIndex - 1 + visualOrder.length) % visualOrder.length);

	function handleKeydown(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openLightbox(id);
		}
	}

	let currentArtData = $derived.by<ArtEntry | undefined>(() => {
		const id = visualOrder[currentArtIndex];
		if (!id) return undefined;
		return data.entries.find((entry) => entry.id === id);
	});

	let nextArtImageUrl = $derived.by<string | undefined>(() => {
		const nextId = visualOrder[(currentArtIndex + 1) % visualOrder.length];
		if (!nextId) return undefined;
		return data.entries.find((entry) => entry.id === nextId)?.image;
	});

	let prevArtImageUrl = $derived.by<string | undefined>(() => {
		const prevId = visualOrder[(currentArtIndex - 1 + visualOrder.length) % visualOrder.length];
		if (!prevId) return undefined;
		return data.entries.find((entry) => entry.id === prevId)?.image;
	});
</script>

<svelte:head>
	<title>Art | kirkr.xyz</title>
	<meta name="description" content="Artworks I like, and research on Pieter de Hooch." />
	<link rel="preconnect" href="https://iiif.micr.io" crossorigin="anonymous" />
	<link rel="preconnect" href="https://upload.wikimedia.org" crossorigin="anonymous" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-mono md:py-16">
	<main class="w-full max-w-7xl">
		<div class="py-7">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Art</span><span class="opacity-20">.</span>
			</h1>
			<div class="mt-2 font-sans text-[11px] tracking-[0.1em] text-muted uppercase">
				a collection of artworks, and research on Pieter de Hooch
			</div>
		</div>

		<!-- Navigation Tabs -->
		<nav
			class="mb-16 flex gap-12 border-b border-white/10 font-sans text-[11px] tracking-[0.1em] uppercase"
		>
			<button
				onclick={() => (activeTab = 'gallery')}
				class="cursor-pointer pb-4 transition-all duration-100 {activeTab === 'gallery'
					? 'border-b border-white text-white'
					: 'text-white/30 hover:text-white'}"
			>
				Collection
			</button>
			<button
				onclick={() => (activeTab = 'research')}
				class="cursor-pointer pb-4 transition-all duration-100 {activeTab === 'research'
					? 'border-b border-white text-white'
					: 'text-white/30 hover:text-white'}"
			>
				De Hooch Research
			</button>
		</nav>

		{#if activeTab === 'gallery'}
			<div in:fade={{ duration: 300 }}>
				<div bind:this={gridContainer} class="mb-12 columns-1 gap-12 sm:columns-2 lg:columns-3">
					{#each entriesWithMeta as entry (entry.id)}
						<button
							use:cardAction={entry.id}
							class="group mb-12 flex w-full break-inside-avoid flex-col text-left focus:outline-none"
							onclick={() => openLightbox(entry.id)}
							onkeydown={(e) => handleKeydown(e, entry.id)}
						>
							<div
								class="mb-6 w-full overflow-hidden border border-bd bg-neutral-900 shadow-2xl"
								style:aspect-ratio={entry.artwork.aspectRatio || 'auto'}
							>
								<img
									src={entry.artwork.thumbnail}
									srcset={entry.thumbnailSrcset || undefined}
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									alt={entry.artwork.title}
									class="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-102 group-hover:cursor-zoom-in group-hover:brightness-105"
									loading="lazy"
									decoding="async"
								/>
							</div>

							<span
								class="font-serif text-xl leading-tight text-white/90 transition-colors group-hover:text-white"
							>
								{entry.artwork.title}
							</span>

							<div class="mt-2 flex items-center gap-2">
								<span class="font-sans text-[12px] tracking-wide text-white/55">
									{entry.artist}
								</span>
								{#if entry.year}
									<span class="text-[10px] text-white/20">·</span>
									<span class="font-mono text-[11px] tracking-wider text-white/35">
										{entry.year}
									</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<div in:fade={{ duration: 300 }} class="hidden lg:block">
				<div class="grid grid-cols-1 gap-16 lg:grid-cols-12">
					<div class="lg:col-span-7">
						<div class="mb-20">
							{@render researchEssay()}
						</div>
						<ArtBibliographySection bibliography={data.bibliography} />
					</div>
					<aside class="space-y-8 lg:col-span-5">
						<ArtInfobox
							onToggleDeathFootnote={() => (footnoteVisible = !footnoteVisible)}
							onToggleBerchemFootnote={() => (berchemFootnoteVisible = !berchemFootnoteVisible)}
						/>
						<ArtFootnotePanel
							title="Note — date of death"
							visible={footnoteVisible}
							onClose={() => (footnoteVisible = false)}
						>
							{@render deathFootnote()}
						</ArtFootnotePanel>
						<ArtFootnotePanel
							title="Note — training"
							visible={berchemFootnoteVisible}
							onClose={() => (berchemFootnoteVisible = false)}
						>
							{@render berchemFootnote()}
						</ArtFootnotePanel>
						<ArtExternalLinks />
					</aside>
				</div>
			</div>
			<div in:fade={{ duration: 300 }} class="block lg:hidden">
				<div class="space-y-8">
					<ArtInfobox
						onToggleDeathFootnote={() => (footnoteVisible = !footnoteVisible)}
						onToggleBerchemFootnote={() => (berchemFootnoteVisible = !berchemFootnoteVisible)}
					/>
					<div class="mb-8 border-b border-white/10 pb-4">
						<p
							class="font-serif text-[22px] leading-snug tracking-wide text-white/80 italic md:text-[26px]"
						>
							Pieter de Hooch & the seventeenth-century Dutch interior
						</p>
					</div>
					<div class="mb-20">
						{@render researchEssay()}
					</div>
					<ArtBibliographySection bibliography={data.bibliography} />
					<ArtExternalLinks />
					<ArtFootnotePanel
						title="Note — date of death"
						visible={footnoteVisible}
						onClose={() => (footnoteVisible = false)}
					>
						{@render deathFootnote()}
					</ArtFootnotePanel>
					<ArtFootnotePanel
						title="Note — training"
						visible={berchemFootnoteVisible}
						onClose={() => (berchemFootnoteVisible = false)}
					>
						{@render berchemFootnote()}
					</ArtFootnotePanel>
				</div>
			</div>
		{/if}
	</main>
</div>

{#snippet researchEssay()}
	<section class="cv-auto">
		<div class="space-y-6 font-sans text-[16px] leading-relaxed text-white/65">
			<p>
				Pieter de Hooch is one of the more understated figures of the Dutch Golden Age, and one I've
				spent a good deal of time with — including writing his Wikipedia page. His work centres on
				the domestic interior: tiled floors, orderly courtyards, women going about household tasks.
				What makes it worth sustained attention is how consistently he thinks through space rather
				than just depicting it.
			</p>
			<p>
				The device he returns to most often is the <em class="italic">doorkijkje</em> — a view through
				an open door or passageway into another room or the street beyond. It keeps his interiors from
				feeling sealed off, connecting the private household to the wider world outside in a way that
				feels considered rather than incidental.
			</p>
			<p>
				Compared to Vermeer, whose paintings tend toward mystery, de Hooch is straightforward. Light
				in his work isn't theatrical — it falls on ordinary things and makes them present. Even in
				his later Amsterdam period, when his patrons wanted something grander, he kept a certain
				quietness about everyday subjects that runs through the whole of his career.
			</p>
		</div>
	</section>
{/snippet}

{#snippet deathFootnote()}
	<p>
		The date is uncertain. Jansen (2019, pp. 30–31) notes that in 1679 de Hooch and his wife were
		forced to admit their son Pieter to the Dolhuis. De Hooch is not mentioned in any source after
		that year, nor are his wife, his children, or his brothers-in-law Hendrick van der Burch and
		Barend Gast.
	</p>
	<p>
		The son died in 1684, a date often wrongly given for de Hooch himself, and was buried at the
		Dolhuis's expense — suggesting the parents were either unable to pay, had left the city, or had
		died in the meantime. There is a tenuous possibility de Hooch moved elsewhere, perhaps to
		Middelburg, where his father spent his old age.
	</p>
	<p>
		The supposed "failure" or decline of De Hooch's art was often blamed on the artist's
		deteriorating mental health since he was thought to have died in an asylum in 1684. The fact
		that the mental health angle is incorrect complicates the picture, and it is now more understood
		that the artist's decline was actually a shift toward refined, classicizing elements that paved
		the way for 18th century Dutch painting.
	</p>
{/snippet}

{#snippet berchemFootnote()}
	<p>
		Attributed to Nicolaes Berchem by Houbraken (1753), though the claim sits on shaky ground.
		Houbraken is a notoriously unreliable source, and the attribution finds no support in the work
		itself — Berchem's Italianate landscapes share no visible affinity with de Hooch's domestic
		interiors.
	</p>
{/snippet}

{#if lightboxActive && currentArtData}
	{@const artItem = currentArtData!}
	<Lightbox
		item={{
			...artItem,
			description: artItem.description,
			data: artItem.data as [string, string][]
		}}
		currentIndex={currentArtIndex}
		totalItems={visualOrder.length}
		nextUrl={nextArtImageUrl}
		prevUrl={prevArtImageUrl}
		onClose={closeLightbox}
		onNext={goToNext}
		onPrev={goToPrevious}
	/>
{/if}
