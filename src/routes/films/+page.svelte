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

  let films: FilmItem[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    const fetchFilms = async () => {
      try {
        const targetRssUrl = 'https://letterboxd.com/kirkr101/rss/';
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const rssFeedUrl = proxyUrl + encodeURIComponent(targetRssUrl);

        const response = await fetch(rssFeedUrl);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
          throw new Error('Failed to parse RSS feed. The proxy may be down or the feed is invalid.');
        }

        const items = xmlDoc.querySelectorAll('item');
        if (items.length === 0) {
          error = 'No films found in the RSS feed.';
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

          // Process poster URL for different screen sizes
          const isMobile = window.matchMedia("(max-width: 768px)").matches;

          if (posterUrl.includes('/resized/')) {
            if (isMobile) {
              posterUrl = posterUrl.replace(/-0-\d+-0-\d+-crop\.jpg/, '-0-200-0-300-crop.jpg');
            } else {
              posterUrl = posterUrl.replace(/-0-\d+-0-\d+-crop\.jpg/, '-0-200-0-300-crop.jpg');
            }
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
      } catch (err) {
        console.error('Error fetching or processing RSS feed:', err);
        error = err instanceof Error ? err.message : 'Failed to load films.';
      } finally {
        loading = false;
      }
    };

    fetchFilms();
  });

  const createStarRating = (ratingStr: string) => {
    if (!ratingStr) return '';
    const rating = parseFloat(ratingStr);
    if (isNaN(rating)) return '';

    const fullStars = Math.floor(rating);
    const hasHalfStar = (rating % 1 !== 0);
    let starsHtml = '★'.repeat(fullStars);
    if (hasHalfStar) {
      starsHtml += '½';
    }

    return starsHtml;
  };
</script>

<svelte:head>
    <title>Films | kirkr.xyz</title>
    <meta name="description" content="A log of recently watched films." />
    <meta name="robots" content="index, follow" />
    <link rel="preconnect" href="https://a.ltrbxd.com" />
</svelte:head>

<div class="min-h-screen flex flex-col items-center px-6 py-12">
    <main class="w-full max-w-[600px] anim-row anim-row-1">
        
        <div class="py-7">
            <h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white/90">
                Films<em class="not-italic italic text-white/20">.</em>
            </h1>
            <div class="lbl mt-2">a collection of films</div>
        </div>

        <div class="rule mb-8"></div>

        {#if loading}
            <div class="py-8 text-center">
                <div class="lbl">Loading films...</div>
            </div>
        {:else if error}
            <div class="py-8 text-center">
                <div class="lbl text-red-500">Failed to load films</div>
            </div>
        {:else}
            <div class="space-y-4 mb-12">
                {#each films as film}
                    <div class="flex gap-4 py-3">
                        <img 
                            src={film.poster} 
                            alt={film.title} 
                            class="w-24 h-36 object-cover rounded-sm border border-bd flex-shrink-0"
                        />
                        <div class="flex flex-col justify-center">
                            <div class="text-[18px] text-white font-medium">
                                <a href={film.link} target="_blank" rel="noopener noreferrer" class="text-white hover:text-amber-400 transition-colors">
                                    {film.title}
                                </a>
                            </div>
                            <div class="lbl text-[12px] mt-1">{film.year}</div>
                            {#if film.rating}
                                <div class="text-[16px] text-amber-400 mt-1">{createStarRating(film.rating)}</div>
                            {/if}
                            <div class="lbl text-[10px] text-white/40 mt-2">
                                Watched: {film.watchedDate}
                                {#if film.rewatch}
                                    <span class="text-amber-400 ml-2">↻ Rewatch</span>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}

    </main>
</div>