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

  const PROXIES = [
    'https://letterboxd.kirkr.xyz/?url=',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?'
  ];

  async function fetchFilms(proxyIndex = 0) {
    if (proxyIndex >= PROXIES.length) {
      error = 'Failed to load films. All connection methods exhausted.';
      loading = false;
      return;
    }

    try {
      loading = true;
      error = null;
      const targetRssUrl = 'https://letterboxd.com/kirkr101/rss/';
      const rssFeedUrl = PROXIES[proxyIndex] + encodeURIComponent(targetRssUrl);

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

        // Process poster URL
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
    } catch (err) {
      console.warn(`Proxy ${proxyIndex} failed, trying next...`);
      fetchFilms(proxyIndex + 1);
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
    const hasHalfStar = (rating % 1 !== 0);
    let starsHtml = '★'.repeat(fullStars);
    if (hasHalfStar) starsHtml += '½';

    return starsHtml;
  };
</script>

<svelte:head>
    <title>Films | kirkr.xyz</title>
    <meta name="description" content="A log of recently watched films." />
    <meta name="robots" content="index, follow" />
    <link rel="preconnect" href="https://a.ltrbxd.com" />
</svelte:head>

<div class="min-h-screen flex flex-col items-center px-6 py-6 md:py-16 font-mono">
    <main class="w-full max-w-[600px] anim-row anim-row-1">
        
        <div class="py-7">
            <h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
                <span class="opacity-90">Films</span><span class="opacity-20"><em class="not-italic italic">.</em></span>
            </h1>
            <div class="font-mono text-[11px] tracking-[0.1em] uppercase text-dim mt-2">a collection of films</div>
        </div>

        <div class="h-px bg-bd mb-8"></div>

        {#if loading}
            <div class="py-8 text-center">
                <div class="font-mono text-[11px] tracking-[0.1em] uppercase text-dim">Loading films...</div>
            </div>
        {:else if error}
            <div class="py-8 text-center border border-red-500/20 rounded-sm bg-red-500/5">
                <div class="font-mono text-[11px] tracking-[0.1em] uppercase text-red-400">Failed to load films</div>
            </div>
        {:else}
            <div class="space-y-4 mb-12">
                {#each films as film}
                    <div class="flex gap-4 py-3 border-b border-sep last:border-0">
                        <img 
                            src={film.poster} 
                            alt={film.title} 
                            class="w-24 h-36 object-cover rounded-sm border border-bd flex-shrink-0"
                        />
                        <div class="flex flex-col justify-center">
                            <div class="text-[18px] text-white/90 font-serif leading-tight">
                                <a href={film.link} target="_blank" rel="noopener noreferrer" class="hover:text-amber-400/80 transition-colors duration-75 text-inherit no-underline">
                                    {film.title}
                                </a>
                            </div>
                            <div class="font-mono text-[12px] text-dim mt-1">{film.year}</div>
                            {#if film.rating}
                                <div class="text-[16px] text-amber-400/80 mt-1">{createStarRating(film.rating)}</div>
                            {/if}
                            <div class="font-mono text-[10px] text-muted mt-2 uppercase tracking-wider">
                                Watched: {film.watchedDate}
                                {#if film.rewatch}
                                    <span class="text-amber-400/60 ml-2">↻ Rewatch</span>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}

    </main>
</div>
