<script lang="ts">
	import { artData } from '$lib/art-data';
	import { deHoochBibliography } from '$lib/bibliography';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { fade } from 'svelte/transition';
	import { tick, onMount, onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let lightboxActive = $state(false);
	let currentArtIndex = $state(0);
	let activeTab = $state('gallery'); // 'gallery' | 'research'
	let footnoteVisible = $state(false);
	let berchemFootnoteVisible = $state(false);

	const artEntries = Object.entries(artData);

	// Initialize deterministically to prevent SSR hydration mismatches
	let shuffledEntries = $state([...artEntries]);

	// Map from art id → its card DOM element
	const cardEls = new SvelteMap<string, HTMLElement>();

	// Visual order: array of art ids sorted by rendered position (left→right, top→bottom)
	let visualOrder = $state<string[]>(artEntries.map(([id]) => id));

	function computeVisualOrder() {
		if (cardEls.size === 0) return;

		const positions: { id: string; left: number; top: number }[] = [];
		for (const [id, el] of cardEls) {
			const rect = el.getBoundingClientRect();
			positions.push({ id, left: rect.left, top: rect.top });
		}

		// 1. Find distinct column x-positions by rounding and deduplicating left values.
		const lefts = [...new Set(positions.map((p) => Math.round(p.left)))].sort((a, b) => a - b);
		if (lefts.length === 0) return;

		// 2. Bucket each item into its column by nearest left value.
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

		// 3. Sort each column top-to-bottom.
		for (const col of columns) col.sort((a, b) => a.top - b.top);

		// 4. Interleave columns left-to-right row by row so navigation reads left→right.
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

	// Recompute after each render and on resize
	let resizeObserver: ResizeObserver | null = null;

	function registerCard(id: string, el: HTMLElement) {
		cardEls.set(id, el);
		// Once all cards are registered, compute order
		if (cardEls.size === shuffledEntries.length) {
			tick().then(computeVisualOrder);

			if (!resizeObserver) {
				resizeObserver = new ResizeObserver(() => computeVisualOrder());
				resizeObserver.observe(document.body);
			}
		}
	}

	// Named action so it can be used as use:cardAction={id}
	function cardAction(el: HTMLElement, id: string) {
		registerCard(id, el);
		return {
			destroy() {
				cardEls.delete(id);
			}
		};
	}

	onMount(async () => {
		shuffledEntries = [...artEntries].sort(() => Math.random() - 0.5);
		await tick();
		computeVisualOrder();
	});

	onDestroy(() => {
		if (resizeObserver) {
			resizeObserver.disconnect();
		}
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

	// Derive the current art data from the visual order
	let currentArtData = $derived.by(() => {
		const id = visualOrder[currentArtIndex];
		return id ? (artData as Record<string, (typeof artData)[keyof typeof artData]>)[id] : undefined;
	});

	// Sort bibliography: entries with descriptions first
	const sortedBibliography = [...deHoochBibliography].sort((a, b) => {
		const aHas = a.description ? 1 : 0;
		const bHas = b.description ? 1 : 0;
		return bHas - aHas;
	});

	const PORTRAIT_URL =
		'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Angebliche_zelfportret_van_de_schilder_Pieter_de_Hooch%2C_Rijksmuseum_SK-A-181.jpg/500px-Angebliche_zelfportret_van_de_schilder_Pieter_de_Hooch%2C_Rijksmuseum_SK-A-181.jpg';
	const SIGNATURE_URL =
		'https://upload.wikimedia.org/wikipedia/commons/3/31/Pieter_de_Hooch_Signature.svg';
</script>

<svelte:head>
	<title>Art | kirkr.xyz</title>
	<meta name="description" content="A curated selection of artworks." />
</svelte:head>

<div
	class="flex min-h-screen flex-col items-center bg-[#0a0a0a] px-6 py-12 text-[#e0e0e0] md:py-24"
>
	<main class="anim-row anim-row-1 w-full max-w-7xl">
		<div class="py-7">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Art</span><span class="opacity-20"
					><em class="italic not-italic">.</em></span
				>
			</h1>
			<div class="mt-2 font-sans text-[11px] tracking-[0.1em] text-dim uppercase">
				a collection of artworks that i like, as well as research on pieter de hooch
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
				<div class="mb-12 columns-1 gap-12 sm:columns-2 lg:columns-3">
					{#each shuffledEntries as [id, artwork] (id)}
						<button
							use:cardAction={id}
							class="group mb-12 flex w-full break-inside-avoid flex-col text-left focus:outline-none"
							onclick={() => openLightbox(id)}
							onkeydown={(e) => handleKeydown(e, id)}
						>
							<div
								class="mb-6 w-full overflow-hidden border border-white/5 bg-neutral-900 shadow-2xl"
								style:aspect-ratio={artwork.aspectRatio || 'auto'}
							>
								<img
									src={artwork.thumbnail}
									alt={artwork.title}
									class="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-102 group-hover:cursor-zoom-in group-hover:brightness-105"
								/>
							</div>

							<span
								class="font-serif text-xl leading-tight text-white/90 transition-colors group-hover:text-white"
							>
								{artwork.title}
							</span>

							<div class="mt-2 flex items-center gap-2">
								<span class="font-sans text-[12px] tracking-wide text-white/55">
									{artwork.data.find((d) => d[0] === 'artist')?.[1]}
								</span>
								{#if artwork.data.find((d) => d[0] === 'year')?.[1]}
									<span class="text-[10px] text-white/20">·</span>
									<span class="font-mono text-[11px] tracking-wider text-white/35">
										{artwork.data.find((d) => d[0] === 'year')?.[1]}
									</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<!-- Research Section -->
			<div in:fade={{ duration: 300 }} class="hidden lg:block">
				<div class="grid grid-cols-1 gap-16 lg:grid-cols-12">
					<!-- Main Content Column -->
					<div class="lg:col-span-7">
						<section class="mb-20">
							<div class="space-y-6 font-sans text-[16px] leading-relaxed text-white/65">
								<p>
									Pieter de Hooch is one of the more understated figures of the Dutch Golden Age,
									and one I've spent a good deal of time with — including writing his Wikipedia
									page. His work centres on the domestic interior: tiled floors, orderly courtyards,
									women going about household tasks. What makes it worth sustained attention is how
									consistently he thinks through space rather than just depicting it.
								</p>
								<p>
									The device he returns to most often is the <em class="italic">doorkijkje</em> — a view
									through an open door or passageway into another room or the street beyond. It keeps
									his interiors from feeling sealed off, connecting the private household to the wider
									world outside in a way that feels considered rather than incidental.
								</p>
								<p>
									Compared to Vermeer, whose paintings tend toward mystery, de Hooch is
									straightforward. Light in his work isn't theatrical — it falls on ordinary things
									and makes them present. Even in his later Amsterdam period, when his patrons
									wanted something grander, he kept a certain quietness about everyday subjects that
									runs through the whole of his career.
								</p>
							</div>
						</section>

						<!-- Bibliography Section -->
						<section>
							<div class="mb-3 border-b border-white/10 pb-4">
								<h3 class="font-mono text-[11px] tracking-[0.3em] text-white/30 uppercase">
									Research Bibliography
								</h3>
							</div>
							<p class="mb-10 font-sans text-[13px] leading-relaxed text-white/35">
								Sources range from short catalogue essays and journal articles to full-length
								monographs, covering both de Hooch directly and the broader Dutch art market of the
								seventeenth century.
							</p>
							<div class="space-y-10">
								{#each sortedBibliography as bib (bib.title)}
									<div class="group grid grid-cols-[3px_1fr] items-start gap-6">
										<div
											class="mt-1 h-full w-px self-stretch bg-white/8 transition-colors group-hover:bg-white/25"
										></div>
										<div>
											<h4 class="font-serif text-[18px] leading-snug text-white/90">
												{#if bib.url}
													<a
														href={bib.url}
														target="_blank"
														class="italic underline decoration-white/10 underline-offset-4 transition-colors duration-100 hover:text-white hover:decoration-white/40"
													>
														{bib.title}
													</a>
												{:else}
													<span class="italic">{bib.title}</span>
												{/if}
											</h4>
											<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
												<span class="font-mono text-[10px] tracking-widest text-white/40 uppercase"
													>{bib.year}</span
												>
												<span class="h-1 w-1 rounded-full bg-white/15"></span>
												<span class="font-sans text-[11px] tracking-widest text-white/30 uppercase"
													>{bib.author}</span
												>
											</div>
											{#if bib.description}
												<p class="mt-3 font-sans text-[13px] leading-relaxed text-white/45 italic">
													{bib.description}
												</p>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</section>
					</div>

					<!-- Sidebar -->
					<aside class="space-y-8 lg:col-span-5">
						<!-- Portrait & Infobox -->
						<div class="border border-white/8">
							<!-- Portrait image -->
							<div class="relative aspect-[3/4] overflow-hidden bg-neutral-900">
								<img
									src={PORTRAIT_URL}
									alt="Possible self-portrait of Pieter de Hooch"
									class="h-full w-full object-cover object-top opacity-85"
								/>
								<div
									class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3"
								>
									<p class="font-sans text-[10px] leading-snug text-white/50 italic">
										Possible self-portrait (1648–1649?)
									</p>
								</div>
							</div>

							<!-- Infobox rows -->
							<div class="divide-y divide-white/6">
								<!-- Name header -->
								<div class="px-5 py-4 text-center">
									<h2 class="font-serif text-[20px] leading-tight text-white/90">
										Pieter de Hooch
									</h2>
									<p class="mt-1 font-sans text-[11px] tracking-wide text-white/35">
										Pieter Hendricksz. de Hooch
									</p>
								</div>

								<div class="grid grid-cols-[auto_1fr] divide-y divide-white/6">
									<div class="contents">
										<span
											class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
											>Born</span
										>
										<div class="px-4 py-3">
											<span class="font-sans text-[12px] leading-relaxed text-white/60"
												>Baptised 20 December 1629</span
											>
											<span class="mt-0.5 block font-sans text-[11px] text-white/35"
												>Rotterdam, Dutch Republic</span
											>
										</div>
									</div>

									<div class="contents">
										<span
											class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
											>Died</span
										>
										<div class="flex items-start gap-2 px-4 py-3">
											<div>
												<button
													onclick={() => (footnoteVisible = !footnoteVisible)}
													class="inline-flex cursor-pointer items-center gap-1 font-sans text-[12px] text-white/60 underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
													aria-label="Toggle footnote about date of death"
												>
													In or after 1679?
												</button>
												<span class="mt-0.5 block font-sans text-[11px] text-white/35"
													>aged at least 49</span
												>
											</div>
										</div>
									</div>

									<div class="contents">
										<span
											class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
											>Training</span
										>
										<div class="px-4 py-3">
											<button
												onclick={() => (berchemFootnoteVisible = !berchemFootnoteVisible)}
												class="inline-flex cursor-pointer items-center gap-1 font-sans text-[12px] text-white/60 underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
												aria-label="Toggle footnote about Nicolaes Berchem"
											>
												Nicolaes Berchem?
											</button>
										</div>
									</div>

									<div class="contents">
										<span
											class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
											>Movement</span
										>
										<div class="flex flex-wrap gap-1.5 px-4 py-3">
											{#each ['Dutch Golden Age', 'Baroque', 'Delft School'] as movement (movement)}
												<span
													class="border border-white/10 px-2 py-0.5 font-sans text-[10px] tracking-wide text-white/40"
													>{movement}</span
												>
											{/each}
										</div>
									</div>

									<div class="contents">
										<span
											class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
											>Spouse</span
										>
										<div class="px-4 py-3">
											<span class="font-sans text-[12px] text-white/60">Jannetje van der Burch</span
											>
											<span class="mt-0.5 block font-sans text-[11px] text-white/35"
												>m. 1654 — d. 1667</span
											>
										</div>
									</div>

									<div class="contents">
										<span
											class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
											>Children</span
										>
										<div class="px-4 py-3">
											<span class="font-sans text-[12px] text-white/60"
												>7, incl. Pieter Pietersz. de Hooch</span
											>
										</div>
									</div>
								</div>
							</div>

							<!-- Signature -->
							<div class="flex flex-col items-center gap-2 px-5 py-4">
								<span class="font-mono text-[9px] tracking-[0.25em] text-white/20 uppercase"
									>Signature</span
								>
								<img
									src={SIGNATURE_URL}
									alt="Pieter de Hooch signature"
									class="h-8 opacity-40 invert"
								/>
							</div>
						</div>

						<!-- Footnote panel -->
						{#if footnoteVisible}
							<div
								in:fade={{ duration: 200 }}
								class="space-y-4 border border-white/10 bg-white/2.5 p-6"
							>
								<div class="mb-1 flex items-start justify-between gap-4">
									<span class="font-mono text-[10px] tracking-[0.25em] text-white/25 uppercase"
										>Note — date of death</span
									>
									<button
										onclick={() => (footnoteVisible = false)}
										class="mt-0.5 cursor-pointer text-xs leading-none text-white/20 transition-colors hover:text-white/60"
										>✕</button
									>
								</div>
								<div class="space-y-3 font-sans text-[13px] leading-relaxed text-white/50">
									<p>
										The date is uncertain. Jansen (2019, pp. 30–31) notes that in 1679 de Hooch and
										his wife were forced to admit their son Pieter to the Dolhuis. De Hooch is not
										mentioned in any source after that year, nor are his wife, his children, or his
										brothers-in-law Hendrick van der Burch and Barend Gast.
									</p>
									<p>
										The son died in 1684, a date often wrongly given for de Hooch himself, and was
										buried at the Dolhuis's expense — suggesting the parents were either unable to
										pay, had left the city, or had died in the meantime. There is a tenuous
										possibility de Hooch moved elsewhere, perhaps to Middelburg, where his father
										spent his old age.
									</p>
									<p>
										The supposed “failure” or decline of De Hooch’s art was often blamed on the
										artist’s deteriorating mental health since he was thought to have died in an
										asylum in 1684. The fact that the mental health angle is incorrect complicates
										the picture, and it is now more understood that the artist's decline was
										actually a shift toward refined, classicizing elements that paved the way for
										18th century Dutch painting.
									</p>
								</div>
							</div>
						{/if}

						<!-- Berchem Footnote panel -->
						{#if berchemFootnoteVisible}
							<div
								in:fade={{ duration: 200 }}
								class="space-y-4 border border-white/10 bg-white/2.5 p-6"
							>
								<div class="mb-1 flex items-start justify-between gap-4">
									<span class="font-mono text-[10px] tracking-[0.25em] text-white/25 uppercase"
										>Note — training</span
									>
									<button
										onclick={() => (berchemFootnoteVisible = false)}
										class="mt-0.5 cursor-pointer text-xs leading-none text-white/20 transition-colors hover:text-white/60"
										>✕</button
									>
								</div>
								<div class="space-y-3 font-sans text-[13px] leading-relaxed text-white/50">
									<p>
										Attributed to Nicolaes Berchem by Houbraken (1753), though the claim sits on
										shaky ground. Houbraken is a notoriously unreliable source, and the attribution
										finds no support in the work itself — Berchem's Italianate landscapes share no
										visible affinity with de Hooch's domestic interiors.
									</p>
								</div>
							</div>
						{/if}

						<!-- External Links -->
						<div>
							<h3
								class="mb-6 border-b border-white/10 pb-4 font-mono text-[11px] tracking-[0.3em] text-white/30 uppercase"
							>
								External Resources
							</h3>
							<div class="flex flex-col gap-2">
								{#each [{ href: 'https://research.rkd.nl/en/detail/https%3A%2F%2Fdata.rkd.nl%2Fartists%2F39452', label: 'RKD — Artist Record' }, { href: 'https://research.rkd.nl/en/search?current=n_63_n&q=Pieter%20de%20Hooch&size=n_20_n&filters%5B0%5D%5Bfield%5D=db&filters%5B0%5D%5Bvalues%5D%5B0%5D=rkdexcerpts&filters%5B0%5D%5Btype%5D=all', label: 'RKD — Literature Excerpts' }, { href: 'https://www.nga.gov/collection/artist-info.1403.html', label: 'NGA Archive' }, { href: 'https://www.essentialvermeer.com/dutch-painters/masters/dehooghbase.html', label: 'Essential Vermeer' }, { href: 'https://www.metmuseum.org/art/collection/search?q=Pieter+de+Hooch&searchField=ArtistCulture&showOnly=withImage&offset=0&material=Paintings', label: 'The MET Collection' }, { href: 'https://en.wikipedia.org/wiki/List_of_paintings_by_Pieter_de_Hooch', label: 'Wikipedia — Paintings List' }, { href: 'https://en.wikipedia.org/wiki/Dutch_Golden_Age_painting', label: 'Wikipedia — Dutch Golden Age' }] as link (link.href)}
									<a
										href={link.href}
										target="_blank"
										class="group flex items-center justify-between border border-white/8 px-5 py-4 transition-all hover:border-white/25 hover:bg-white/[0.02]"
									>
										<span
											class="font-sans text-[12px] tracking-wide text-white/45 transition-colors group-hover:text-white/80"
											>{link.label}</span
										>
										<span
											class="text-sm text-white/15 transition-all group-hover:translate-x-0.5 group-hover:text-white/60"
											>→</span
										>
									</a>
								{/each}
							</div>
						</div>
					</aside>
				</div>
			</div>
			<div in:fade={{ duration: 300 }} class="block lg:hidden">
				<div class="space-y-8">
					<!-- Portrait & Infobox (moved from sidebar) -->
					<div class="border border-white/8">
						<!-- Portrait image -->
						<div class="relative aspect-[3/4] overflow-hidden bg-neutral-900">
							<img
								src={PORTRAIT_URL}
								alt="Possible self-portrait of Pieter de Hooch"
								class="h-full w-full object-cover object-top opacity-85"
							/>
							<div
								class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3"
							>
								<p class="font-sans text-[10px] leading-snug text-white/50 italic">
									Possible self-portrait (1648–1649?)
								</p>
							</div>
						</div>

						<!-- Infobox rows -->
						<div class="divide-y divide-white/6">
							<!-- Name header -->
							<div class="px-5 py-4 text-center">
								<h2 class="font-serif text-[20px] leading-tight text-white/90">Pieter de Hooch</h2>
								<p class="mt-1 font-sans text-[11px] tracking-wide text-white/35">
									Pieter Hendricksz. de Hooch
								</p>
							</div>

							<div class="grid grid-cols-[auto_1fr] divide-y divide-white/6">
								<div class="contents">
									<span
										class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
										>Born</span
									>
									<div class="px-4 py-3">
										<span class="font-sans text-[12px] leading-relaxed text-white/60"
											>Baptised 20 December 1629</span
										>
										<span class="mt-0.5 block font-sans text-[11px] text-white/35"
											>Rotterdam, Dutch Republic</span
										>
									</div>
								</div>

								<div class="contents">
									<span
										class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
										>Died</span
									>
									<div class="flex items-start gap-2 px-4 py-3">
										<div>
											<button
												onclick={() => (footnoteVisible = !footnoteVisible)}
												class="inline-flex cursor-pointer items-center gap-1 font-sans text-[12px] text-white/60 underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
												aria-label="Toggle footnote about date of death"
											>
												In or after 1679?
											</button>
											<span class="mt-0.5 block font-sans text-[11px] text-white/35"
												>aged at least 49</span
											>
										</div>
									</div>
								</div>

								<div class="contents">
									<span
										class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
										>Training</span
									>
									<div class="px-4 py-3">
										<button
											onclick={() => (berchemFootnoteVisible = !berchemFootnoteVisible)}
											class="inline-flex cursor-pointer items-center gap-1 font-sans text-[12px] text-white/60 underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
											aria-label="Toggle footnote about Nicolaes Berchem"
										>
											Nicolaes Berchem?
										</button>
									</div>
								</div>

								<div class="contents">
									<span
										class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
										>Movement</span
									>
									<div class="flex flex-wrap gap-1.5 px-4 py-3">
										{#each ['Dutch Golden Age', 'Baroque', 'Delft School'] as movement (movement)}
											<span
												class="border border-white/10 px-2 py-0.5 font-sans text-[10px] tracking-wide text-white/40"
												>{movement}</span
											>
										{/each}
									</div>
								</div>

								<div class="contents">
									<span
										class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
										>Spouse</span
									>
									<div class="px-4 py-3">
										<span class="font-sans text-[12px] text-white/60">Jannetje van der Burch</span>
										<span class="mt-0.5 block font-sans text-[11px] text-white/35"
											>m. 1654 — d. 1667</span
										>
									</div>
								</div>

								<div class="contents">
									<span
										class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
										>Children</span
									>
									<div class="px-4 py-3">
										<span class="font-sans text-[12px] text-white/60"
											>7, incl. Pieter Pietersz. de Hooch</span
										>
									</div>
								</div>
							</div>
						</div>

						<!-- Signature -->
						<div class="flex flex-col items-center gap-2 px-5 py-4">
							<span class="font-mono text-[9px] tracking-[0.25em] text-white/20 uppercase"
								>Signature</span
							>
							<img
								src={SIGNATURE_URL}
								alt="Pieter de Hooch signature"
								class="h-8 opacity-40 invert"
							/>
						</div>
					</div>

					<!-- Pull-quote and main text -->
					<div class="mb-8 border-b border-white/10 pb-4">
						<p
							class="font-serif text-[22px] leading-snug tracking-wide text-white/80 italic md:text-[26px]"
						>
							Pieter de Hooch & the seventeenth-century Dutch interior
						</p>
					</div>
					<div class="mb-20">
						<div class="space-y-6 font-sans text-[16px] leading-relaxed text-white/65">
							<p>
								Pieter de Hooch is one of the more understated figures of the Dutch Golden Age, and
								one I've spent a good deal of time with — including writing his Wikipedia page. His
								work centres on the domestic interior: tiled floors, orderly courtyards, women going
								about household tasks. What makes it worth sustained attention is how consistently
								he thinks through space rather than just depicting it.
							</p>
							<p>
								The device he returns to most often is the <em class="italic">doorkijkje</em> — a view
								through an open door or passageway into another room or the street beyond. It keeps his
								interiors from feeling sealed off, connecting the private household to the wider world
								outside in a way that feels considered rather than incidental.
							</p>
							<p>
								Compared to Vermeer, whose paintings tend toward mystery, de Hooch is
								straightforward. Light in his work isn't theatrical — it falls on ordinary things
								and makes them present. Even in his later Amsterdam period, when his patrons wanted
								something grander, he kept a certain quietness about everyday subjects that runs
								through the whole of his career.
							</p>
						</div>
					</div>

					<!-- Bibliography Section -->
					<section>
						<div class="mb-3 border-b border-white/10 pb-4">
							<h3 class="font-mono text-[11px] tracking-[0.3em] text-white/30 uppercase">
								Research Bibliography
							</h3>
						</div>
						<p class="mb-10 font-sans text-[13px] leading-relaxed text-white/35">
							Sources range from short catalogue essays and journal articles to full-length
							monographs, covering both de Hooch directly and the broader Dutch art market of the
							seventeenth century.
						</p>
						<div class="space-y-10">
							{#each sortedBibliography as bib (bib.title)}
								<div class="group grid grid-cols-[3px_1fr] items-start gap-6">
									<div
										class="mt-1 h-full w-px self-stretch bg-white/8 transition-colors duration-75 group-hover:bg-white/25"
									></div>
									<div>
										<h4 class="font-serif text-[18px] leading-snug text-white/90">
											{#if bib.url}
												<a
													href={bib.url}
													target="_blank"
													class="italic underline decoration-white/10 underline-offset-4 transition-colors duration-75 hover:text-white hover:decoration-white/40"
												>
													{bib.title}
												</a>
											{:else}
												<span class="italic">{bib.title}</span>
											{/if}
										</h4>
										<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
											<span class="font-mono text-[10px] tracking-widest text-white/40 uppercase"
												>{bib.year}</span
											>
											<span class="h-1 w-1 rounded-full bg-white/15"></span>
											<span class="font-sans text-[11px] tracking-widest text-white/30 uppercase"
												>{bib.author}</span
											>
										</div>
										{#if bib.description}
											<p class="mt-3 font-sans text-[13px] leading-relaxed text-white/45 italic">
												{bib.description}
											</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</section>

					<!-- External Resources -->
					<div class="pt-8">
						<h3
							class="mb-6 border-b border-white/10 pb-4 font-mono text-[11px] tracking-[0.3em] text-white/30 uppercase"
						>
							External Resources
						</h3>
						<div class="flex flex-col gap-2">
							{#each [{ href: 'https://research.rkd.nl/en/detail/https%3A%2F%2Fdata.rkd.nl%2Fartists%2F39452', label: 'RKD — Artist Record' }, { href: 'https://research.rkd.nl/en/search?current=n_63_n&q=Pieter%20de%20Hooch&size=n_20_n&filters%5B0%5D%5Bfield%5D=db&filters%5B0%5D%5Bvalues%5D%5B0%5D=rkdexcerpts&filters%5B0%5D%5Btype%5D=all', label: 'RKD — Literature Excerpts' }, { href: 'https://www.nga.gov/collection/artist-info.1403.html', label: 'NGA Archive' }, { href: 'https://www.essentialvermeer.com/dutch-painters/masters/dehooghbase.html', label: 'Essential Vermeer' }, { href: 'https://www.metmuseum.org/art/collection/search?q=Pieter+de+Hooch&searchField=ArtistCulture&showOnly=withImage&offset=0&material=Paintings', label: 'The MET Collection' }, { href: 'https://en.wikipedia.org/wiki/List_of_paintings_by_Pieter_de_Hooch', label: 'Wikipedia — Paintings List' }, { href: 'https://en.wikipedia.org/wiki/Dutch_Golden_Age_painting', label: 'Wikipedia — Dutch Golden Age' }] as link (link.href)}
								<a
									href={link.href}
									target="_blank"
									class="group flex items-center justify-between border border-white/8 px-5 py-4 transition-all hover:border-white/25 hover:bg-white/[0.02]"
								>
									<span
										class="font-sans text-[12px] tracking-wide text-white/45 transition-colors group-hover:text-white/80"
										>{link.label}</span
									>
									<span
										class="text-sm text-white/15 transition-all group-hover:translate-x-0.5 group-hover:text-white/60"
										>→</span
									>
								</a>
							{/each}
						</div>
					</div>

					<!-- Footnotes -->
					{#if footnoteVisible}
						<div
							in:fade={{ duration: 200 }}
							class="space-y-4 border border-white/10 bg-white/2.5 p-6"
						>
							<div class="mb-1 flex items-start justify-between gap-4">
								<span class="font-mono text-[10px] tracking-[0.25em] text-white/25 uppercase"
									>Note — date of death</span
								>
								<button
									onclick={() => (footnoteVisible = false)}
									class="mt-0.5 cursor-pointer text-xs leading-none text-white/20 transition-colors hover:text-white/60"
									>✕</button
								>
							</div>
							<div class="space-y-3 font-sans text-[13px] leading-relaxed text-white/50">
								<p>
									The date is uncertain. Jansen (2019, pp. 30–31) notes that in 1679 de Hooch and
									his wife were forced to admit their son Pieter to the Dolhuis. De Hooch is not
									mentioned in any source after that year, nor are his wife, his children, or his
									brothers-in-law Hendrick van der Burch and Barend Gast.
								</p>
								<p>
									The son died in 1684, a date often wrongly given for de Hooch himself, and was
									buried at the Dolhuis's expense — suggesting the parents were either unable to
									pay, had left the city, or had died in the meantime. There is a tenuous
									possibility de Hooch moved elsewhere, perhaps to Middelburg, where his father
									spent his old age.
								</p>
								<p>
									The supposed “failure” or decline of De Hooch’s art was often blamed on the
									artist’s deteriorating mental health since he was thought to have died in an
									asylum in 1684. The fact that the mental health angle is incorrect complicates the
									picture, and it is now more understood that the artist's decline was actually a
									shift toward refined, classicizing elements that paved the way for 18th century
									Dutch painting.
								</p>
							</div>
						</div>
					{/if}

					{#if berchemFootnoteVisible}
						<div
							in:fade={{ duration: 200 }}
							class="space-y-4 border border-white/10 bg-white/2.5 p-6"
						>
							<div class="mb-1 flex items-start justify-between gap-4">
								<span class="font-mono text-[10px] tracking-[0.25em] text-white/25 uppercase"
									>Note — training</span
								>
								<button
									onclick={() => (berchemFootnoteVisible = false)}
									class="mt-0.5 cursor-pointer text-xs leading-none text-white/20 transition-colors hover:text-white/60"
									>✕</button
								>
							</div>
							<div class="space-y-3 font-sans text-[13px] leading-relaxed text-white/50">
								<p>
									Attributed to Nicolaes Berchem by Houbraken (1753), though the claim sits on shaky
									ground. Houbraken is a notoriously unreliable source, and the attribution finds no
									support in the work itself — Berchem's Italianate landscapes share no visible
									affinity with de Hooch's domestic interiors.
								</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

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
		onClose={closeLightbox}
		onNext={goToNext}
		onPrev={goToPrevious}
	/>
{/if}
