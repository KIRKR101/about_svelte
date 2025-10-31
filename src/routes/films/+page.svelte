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
              posterUrl = posterUrl.replace(/-0-\d+-0-\d+-crop\.jpg/, '-0-100-0-150-crop.jpg');
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

    return `<p><strong>Rating:</strong> ${starsHtml}</p>`;
  };
</script>

<svelte:head>
  <title>Films | kirkr.xyz</title>
  <meta name="description" content="A log of recently watched films." />
  <meta name="robots" content="index, follow" />
</svelte:head>

<div class="flex flex-col items-center p-4 md:p-8">
  <header class="w-full max-w-6xl mb-8 md:mb-12 mt-8 sm:mt-0">
    <div class="text-center">
      <h1 class="text-xl sm:text-2xl mb-2 font-normal">Films</h1>
      <p class="text-sm sm:text-base text-muted-foreground">a log of recently watched films</p>
    </div>
  </header>

  <main class="w-full max-w-6xl">
    {#if loading}
      <div class="text-center text-muted-foreground">Loading films...</div>
    {:else if error}
      <div class="text-center text-destructive">Failed to load films. {error}</div>
    {:else}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 justify-items-center">
        {#each films as film, index}
          <div class="w-full flex flex-col items-center text-center border rounded-lg">
            <div class="flex flex-col items-center gap-3 p-4">
              {#if film.poster}
                <img
                  src={film.poster}
                  alt={`${film.title} poster`}
                  class="w-full h-auto object-cover rounded-lg"
                  loading={index < 10 ? "eager" : "lazy"}
                />
              {/if}

              <div class="flex flex-col items-center min-w-0">
                <h2 class="text-base font-normal mb-1">
                  <a
                    href={film.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-foreground no-underline hover:underline"
                  >
                    {film.title}{film.year ? ` (${film.year})` : ''}
                  </a>
                </h2>

                <p class="text-sm text-muted-foreground mb-0">
                  <strong>Watched:</strong> {film.watchedDate}{film.rewatch ? ' (Rewatch)' : ''}
                </p>

                {#if film.rating}
                  {@html createStarRating(film.rating)}
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>
