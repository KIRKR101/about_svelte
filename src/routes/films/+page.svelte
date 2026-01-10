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

    return `<p><strong>Rating:</strong> ${starsHtml}</p>`;
  };
</script>

<svelte:head>
    <title>Films | kirkr.xyz</title>
    <meta name="description" content="A log of recently watched films." />
    <meta name="robots" content="index, follow" />
    <link rel="preconnect" href="https://a.ltrbxd.com" />
</svelte:head>

<!-- PAGE CONTAINER -->
<div class="min-h-full relative text-[#1A1A1A] dark:text-[#E0E0E0] p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center font-sans selection:bg-[#FF4D00] selection:text-white overflow-x-hidden">

    <!-- CSS GRAIN OVERLAY -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-50 mix-blend-multiply dark:mix-blend-overlay bg-noise"></div>

    <!-- BACKGROUND GRID -->
    <div class="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] dark:opacity-[0.08]"
         style="background-image: linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px); background-size: 40px 40px;">
    </div>
    <div class="absolute inset-0 w-full h-full pointer-events-none opacity-0 dark:opacity-[0.04]"
         style="background-image: linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px); background-size: 40px 40px;">
    </div>

    <main class="w-full max-w-6xl relative z-10">
        <!-- HEADER CARD -->
        <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 mb-6 p-8 flex flex-col justify-center text-center min-h-[120px]">
            <h1 class="font-display font-extrabold text-5xl md:text-6xl leading-[0.8] tracking-tight text-[#1A1A1A] dark:text-[#EEEEEE] mb-3">
                Films<span class="text-[#FF4D00]">.</span>
            </h1>
            <p class="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-2">
                a log of recently watched films
            </p>
        </div>

        <!-- FILMS CONTENT -->
        {#if loading}
            <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] p-8 text-center">
                <div class="font-mono text-sm uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Loading films...</div>
            </div>
        {:else if error}
            <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] p-4 sm:p-8 text-center">
                <p class="text-[#FF4D00] mb-4 font-mono text-xs sm:text-sm uppercase tracking-widest leading-relaxed">
                    Failed to load films. Just see my profile instead.
                </p>
                
                <iframe
                  src="https://embed.letterboxd.com/kirkr101"
                  width="100%"
                  title="Letterboxd film diary embed"
                  class="rounded-lg border-[1.5px] border-[#1A1A1A] dark:border-[#444448] h-[450px] sm:h-[600px]"
                  allow="fullscreen"
                ></iframe>
            </div>
        {:else}
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 justify-items-center">
                {#each films as film, index}
                    <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 transition-transform duration-300 ease-out hover:-translate-y-1 hover:-translate-x-[1px] hover:shadow-[6px_6px_0px_0px_#1A1A1A] dark:hover:shadow-[6px_6px_0px_0px_#55555A] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_#1A1A1A] w-full flex flex-col items-center text-center overflow-hidden">
                        <div class="flex flex-col items-center gap-3 p-4 w-full">
                            {#if film.poster}
                                <img
                                  src={film.poster}
                                  alt={`${film.title} poster`}
                                  class="w-full h-auto object-cover rounded-lg"
                                  loading={index < 10 ? "eager" : "lazy"}
                                />
                            {/if}

                            <div class="flex flex-col items-center min-w-0 w-full">
                                <h2 class="text-base font-normal mb-1">
                                  <a
                                    href={film.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-[#1A1A1A] dark:text-[#E0E0E0] no-underline hover:underline hover:text-[#FF4D00] transition-colors"
                                  >
                                    {film.title}{film.year ? ` (${film.year})` : ''}
                                  </a>
                                </h2>

                                <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-0 font-mono">
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

<style>
    .font-display { font-family: 'Syne', sans-serif; }
    .font-serif { font-family: 'Instrument Serif', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    .bg-noise {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
    }
</style>
