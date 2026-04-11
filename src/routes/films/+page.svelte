<script lang="ts">
	import { onMount } from 'svelte';

	interface FilmItem {
		title: string;
		year: string;
		link: string;
		poster: string;
		rating: string;
		watchedDate: string;
		rewatch: boolean;
	}

	let films: FilmItem[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function fetchFilms() {
		try {
			loading = true;
			error = null;
			const rssFeedUrl = 'https://letterboxd.kirkr.xyz/kirkr101/rss/';

			const response = await fetch(rssFeedUrl);
			if (!response.ok) throw new Error(`Status ${response.status}`);

			const xmlText = await response.text();
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

			if (xmlDoc.querySelector('parsererror')) {
				throw new Error('Parse Error');
			}

			const items = xmlDoc.querySelectorAll('item');
			if (items.length === 0) {
				error = 'No films found.';
				loading = false;
				return;
			}

			const filmItems: FilmItem[] = [];
			items.forEach((item) => {
				const link = item.querySelector('link')?.textContent?.trim() || '#';
				const filmTitle = item.querySelector('filmTitle')?.textContent || 'Unknown Film';
				const filmYear = item.querySelector('filmYear')?.textContent || '';
				const memberRating = item.querySelector('memberRating')?.textContent || '';
				const watchedDate = item.querySelector('watchedDate')?.textContent;
				const rewatch = item.querySelector('rewatch')?.textContent === 'Yes';

				const description = item.querySelector('description')?.textContent || '';
				const doc = parser.parseFromString(description, 'text/html');
				const posterImg = doc.querySelector('img');
				let posterUrl = posterImg ? posterImg.getAttribute('src')?.trim() || '' : '';

				if (posterUrl.includes('/resized/')) {
					posterUrl = posterUrl.replace(/-0-\d+-0-\d+-crop\.jpg/, '-0-200-0-300-crop.jpg');
				}

				const watchedDateFormatted = watchedDate
					? new Date(watchedDate).toLocaleDateString(undefined, {
							timeZone: 'UTC',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})
					: 'N/A';

				filmItems.push({
					title: filmTitle,
					year: filmYear,
					link,
					poster: posterUrl,
					rating: memberRating,
					watchedDate: watchedDateFormatted,
					rewatch
				});
			});

			films = filmItems;
			loading = false;
		} catch {
			error = 'Failed to load films.';
			loading = false;
		}
	}

	onMount(() => {
		fetchFilms();
	});

	const createStarRating = (ratingStr: string) => {
		if (!ratingStr) return '';
		const rating = parseFloat(ratingStr);
		if (isNaN(rating)) return '';

		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;
		let starsHtml = '★'.repeat(fullStars);
		if (hasHalfStar) starsHtml += '½';

		return starsHtml;
	};
</script>

<svelte:head>
	<title>Films | kirkr.xyz</title>
	<meta name="description" content="A log of recently watched films." />
	<meta name="robots" content="index, follow" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-mono md:py-16">
	<main class="anim-row anim-row-1 w-full max-w-[600px]">
		<div class="py-7">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Films</span><span class="opacity-20"
					><em class="italic not-italic">.</em></span
				>
			</h1>
			<div class="mt-2 font-sans text-[11px] tracking-[0.1em] text-dim uppercase">
				a collection of films
			</div>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		{#if loading}
			<div class="py-8 text-center">
				<div class="font-mono text-[11px] tracking-[0.1em] text-dim uppercase">
					Loading films...
				</div>
			</div>
		{:else if error}
			<div class="rounded-sm border border-red-500/20 bg-red-500/5 py-8 text-center">
				<div class="font-mono text-[11px] tracking-[0.1em] text-red-400 uppercase">
					Failed to load films
				</div>
			</div>
		{:else}
			<div class="mb-12 space-y-4">
				{#each films as film (film.link)}
					<div class="flex gap-4 border-b border-sep py-3 last:border-0">
						<img
							src={film.poster}
							alt={film.title}
							class="h-36 w-24 flex-shrink-0 rounded-sm border border-bd object-cover"
						/>
						<div class="flex flex-col justify-center">
							<div class="font-serif text-[18px] leading-tight text-white/90">
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a
									href={film.link}
									target="_blank"
									rel="noopener noreferrer"
									class="text-inherit no-underline transition-colors duration-75 hover:text-amber-400/80"
								>
									{film.title}
								</a>
							</div>
							<div class="mt-1 font-mono text-[12px] text-dim">{film.year}</div>
							{#if film.rating}
								<div class="mt-1 text-[16px] text-amber-400/80">
									{createStarRating(film.rating)}
								</div>
							{/if}
							<div class="mt-2 font-mono text-[10px] tracking-wider text-muted uppercase">
								Watched: {film.watchedDate}
								{#if film.rewatch}
									<span class="ml-2 text-amber-400/60">↻ Rewatch</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>
