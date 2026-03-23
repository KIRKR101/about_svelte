<script lang="ts">
  import { artData } from '$lib/art-data';
  import { deHoochBibliography } from '$lib/bibliography';
  import Lightbox from '$lib/components/Lightbox.svelte';
  import { fade } from 'svelte/transition';

  let lightboxActive = $state(false);
  let currentArtIndex = $state(0);
  let activeTab = $state('gallery'); // 'gallery' | 'research'
  let footnoteVisible = $state(false);
  let berchemFootnoteVisible = $state(false);

  const artEntries = Object.entries(artData);

  const openLightbox = (artId: string) => {
    const index = artEntries.findIndex(([id]) => id === artId);
    currentArtIndex = index;
    lightboxActive = true;
  };

  const closeLightbox = () => lightboxActive = false;
  const goToNext = () => currentArtIndex = (currentArtIndex + 1) % artEntries.length;
  const goToPrevious = () => currentArtIndex = (currentArtIndex - 1 + artEntries.length) % artEntries.length;

  function handleKeydown(e: KeyboardEvent, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(id);
    }
  }

  let currentArtData = $derived(artEntries[currentArtIndex]?.[1]);

  // Sort bibliography: entries with descriptions first
  const sortedBibliography = [...deHoochBibliography].sort((a, b) => {
    const aHas = a.description ? 1 : 0;
    const bHas = b.description ? 1 : 0;
    return bHas - aHas;
  });

  const PORTRAIT_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Angebliche_zelfportret_van_de_schilder_Pieter_de_Hooch%2C_Rijksmuseum_SK-A-181.jpg/500px-Angebliche_zelfportret_van_de_schilder_Pieter_de_Hooch%2C_Rijksmuseum_SK-A-181.jpg';
  const SIGNATURE_URL = 'https://upload.wikimedia.org/wikipedia/commons/3/31/Pieter_de_Hooch_Signature.svg';
</script>

<svelte:head>
    <title>Art | kirkr.xyz</title>
    <meta name="description" content="A curated selection of artworks." />
</svelte:head>

<div class="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex flex-col items-center px-6 py-12 md:py-24">
    <main class="w-full max-w-[1000px] anim-row anim-row-1">
      
        <div class="py-7">
            <h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
                <span class="opacity-90">Art</span><span class="opacity-20"><em class="not-italic italic">.</em></span>
            </h1>
            <div class="font-sans text-[11px] tracking-[0.1em] uppercase text-dim mt-2">a collection of artworks that i like, as well as research on pieter de hooch</div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex gap-12 border-b border-white/10 font-sans text-[11px] uppercase tracking-[0.1em] mb-16">
            <button 
                onclick={() => activeTab = 'gallery'}
                class="pb-4 transition-all duration-200 cursor-pointer {activeTab === 'gallery' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white'}">
                Collection
            </button>
            <button 
                onclick={() => activeTab = 'research'}
                class="pb-4 transition-all duration-200 cursor-pointer {activeTab === 'research' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white'}">
                De Hooch Research
            </button>
        </nav>

        {#if activeTab === 'gallery'}
            <div in:fade={{ duration: 300 }}>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
                    {#each artEntries as [id, artwork] (id)}
                        <button 
                            class="flex flex-col text-left group focus:outline-none"
                            onclick={() => openLightbox(id)}
                            onkeydown={(e) => handleKeydown(e, id)}
                        >
                            <div class="overflow-hidden bg-neutral-900 aspect-[4/5] mb-6 border border-white/5 shadow-2xl">
                                <img 
                                    src={artwork.thumbnail} 
                                    alt={artwork.title} 
                                    class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-102 transition-all duration-700 ease-out"
                                />
                            </div>
                            <span class="font-serif text-xl text-white/90 leading-tight group-hover:text-white transition-colors">
                                {artwork.title}
                            </span>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="font-sans text-[12px] text-white/55 tracking-wide">
                                    {artwork.data.find(d => d[0] === 'artist')?.[1]}
                                </span>
                                {#if artwork.data.find(d => d[0] === 'year')?.[1]}
                                    <span class="text-white/20 text-[10px]">·</span>
                                    <span class="font-mono text-[11px] text-white/35 tracking-wider">
                                        {artwork.data.find(d => d[0] === 'year')?.[1]}
                                    </span>
                                {/if}
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {:else}
            <!-- Research Section -->
            <div in:fade={{ duration: 300 }}>

                <!-- Pull-quote strip -->
                <div class="border-b border-white/10 pb-4 mb-8">
                    <p class="font-serif text-[22px] md:text-[26px] text-white/80 leading-snug tracking-wide italic">
                        Pieter de Hooch &amp; the seventeenth-century Dutch interior
                    </p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    <!-- Main Content Column -->
                    <div class="lg:col-span-7">
                        <section class="mb-20">
                            <div class="font-sans text-[16px] text-white/65 leading-relaxed space-y-6">
                                <p>
                                    Pieter de Hooch is one of the more understated figures of the Dutch Golden Age, and one I've spent a good deal of time with — including writing his Wikipedia page. His work centres on the domestic interior: tiled floors, orderly courtyards, women going about household tasks. What makes it worth sustained attention is how consistently he thinks through space rather than just depicting it.
                                </p>
                                <p>
                                    The device he returns to most often is the <em class="italic">doorkijkje</em> — a view through an open door or passageway into another room or the street beyond. It keeps his interiors from feeling sealed off, connecting the private household to the wider world outside in a way that feels considered rather than incidental.
                                </p>
                                <p>
                                    Compared to Vermeer, whose paintings tend toward mystery, de Hooch is straightforward. Light in his work isn't theatrical — it falls on ordinary things and makes them present. Even in his later Amsterdam period, when his patrons wanted something grander, he kept a certain quietness about everyday subjects that runs through the whole of his career.
                                </p>
                            </div>
                        </section>

                        <!-- Bibliography Section -->
                        <section>
                            <div class="border-b border-white/10 pb-4 mb-3">
                                <h3 class="font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">
                                    Research Bibliography
                                </h3>
                            </div>
                            <p class="font-sans text-[13px] text-white/35 leading-relaxed mb-10">
                                Sources range from short catalogue essays and journal articles to full-length monographs, covering both de Hooch directly and the broader Dutch art market of the seventeenth century.
                            </p>
                            <div class="space-y-10">
                                {#each sortedBibliography as bib (bib.title)}
                                    <div class="group grid grid-cols-[3px_1fr] gap-6 items-start">
                                        <div class="w-px h-full bg-white/8 group-hover:bg-white/25 transition-colors mt-1 self-stretch"></div>
                                        <div>
                                            <h4 class="font-serif text-[18px] text-white/90 leading-snug">
                                                {#if bib.url}
                                                    <a href={bib.url} target="_blank" class="hover:text-white transition-colors italic underline decoration-white/10 underline-offset-4 hover:decoration-white/40">
                                                        {bib.title}
                                                    </a>
                                                {:else}
                                                    <span class="italic">{bib.title}</span>
                                                {/if}
                                            </h4>
                                            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                                                <span class="font-mono text-[10px] text-white/40 uppercase tracking-widest">{bib.year}</span>
                                                <span class="w-1 h-1 bg-white/15 rounded-full"></span>
                                                <span class="font-sans text-[11px] text-white/30 uppercase tracking-widest">{bib.author}</span>
                                            </div>
                                            {#if bib.description}
                                                <p class="font-sans text-[13px] text-white/45 mt-3 leading-relaxed italic">
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
                    <aside class="lg:col-span-5 space-y-8">

                        <!-- Portrait & Infobox -->
                        <div class="border border-white/8">
                            <!-- Portrait image -->
                            <div class="relative overflow-hidden bg-neutral-900 aspect-[3/4]">
                                <img
                                    src={PORTRAIT_URL}
                                    alt="Possible self-portrait of Pieter de Hooch"
                                    class="w-full h-full object-cover object-top opacity-85"
                                />
                                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                                    <p class="font-sans text-[10px] text-white/50 italic leading-snug">Possible self-portrait (1648–1649?)</p>
                                </div>
                            </div>

                            <!-- Infobox rows -->
                            <div class="divide-y divide-white/6">

                                <!-- Name header -->
                                <div class="px-5 py-4 text-center">
                                    <h2 class="font-serif text-[20px] text-white/90 leading-tight">Pieter de Hooch</h2>
                                    <p class="font-sans text-[11px] text-white/35 mt-1 tracking-wide">Pieter Hendricksz. de Hooch</p>
                                </div>

                                <div class="grid grid-cols-[auto_1fr] divide-y divide-white/6">

                                    <div class="contents">
                                        <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25 px-4 py-3 border-r border-white/6 flex items-start pt-3.5">Born</span>
                                        <div class="px-4 py-3">
                                            <span class="font-sans text-[12px] text-white/60 leading-relaxed">Baptised 20 December 1629</span>
                                            <span class="block font-sans text-[11px] text-white/35 mt-0.5">Rotterdam, Dutch Republic</span>
                                        </div>
                                    </div>

                                    <div class="contents">
                                        <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25 px-4 py-3 border-r border-white/6 flex items-start pt-3.5">Died</span>
                                        <div class="px-4 py-3 flex items-start gap-2">
                                            <div>
                                                <button
                                                    onclick={() => footnoteVisible = !footnoteVisible}
                                                    class="inline-flex items-center gap-1 font-sans text-[12px] text-white/60 underline decoration-white/30 underline-offset-2 hover:decoration-white/60 transition-colors cursor-pointer"
                                                    aria-label="Toggle footnote about date of death"
                                                >
                                                    In or after 1679?
                                                </button>
                                                <span class="block font-sans text-[11px] text-white/35 mt-0.5">aged at least 49</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="contents">
                                        <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25 px-4 py-3 border-r border-white/6 flex items-start pt-3.5">Training</span>
                                        <div class="px-4 py-3">
                                            <button
                                                onclick={() => berchemFootnoteVisible = !berchemFootnoteVisible}
                                                class="inline-flex items-center gap-1 font-sans text-[12px] text-white/60 underline decoration-white/30 underline-offset-2 hover:decoration-white/60 transition-colors cursor-pointer"
                                                aria-label="Toggle footnote about Nicolaes Berchem"
                                            >
                                                Nicolaes Berchem?
                                            </button>
                                        </div>
                                    </div>

                                    <div class="contents">
                                        <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25 px-4 py-3 border-r border-white/6 flex items-start pt-3.5">Movement</span>
                                        <div class="px-4 py-3 flex flex-wrap gap-1.5">
                                            {#each ['Dutch Golden Age', 'Baroque', 'Delft School'] as movement (movement)}
                                                <span class="font-sans text-[10px] text-white/40 border border-white/10 px-2 py-0.5 tracking-wide">{movement}</span>
                                            {/each}
                                        </div>
                                    </div>

                                    <div class="contents">
                                        <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25 px-4 py-3 border-r border-white/6 flex items-start pt-3.5">Spouse</span>
                                        <div class="px-4 py-3">
                                            <span class="font-sans text-[12px] text-white/60">Jannetje van der Burch</span>
                                            <span class="block font-sans text-[11px] text-white/35 mt-0.5">m. 1654 — d. 1667</span>
                                        </div>
                                    </div>

                                    <div class="contents">
                                        <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25 px-4 py-3 border-r border-white/6 flex items-start pt-3.5">Children</span>
                                        <div class="px-4 py-3">
                                            <span class="font-sans text-[12px] text-white/60">7, incl. Pieter Pietersz. de Hooch</span>
                                        </div>
                                    </div>

                                </div>

                                <!-- Signature -->
                                <div class="px-5 py-4 flex flex-col items-center gap-2">
                                    <span class="font-mono text-[9px] uppercase tracking-[0.25em] text-white/20">Signature</span>
                                    <img
                                        src={SIGNATURE_URL}
                                        alt="Pieter de Hooch signature"
                                        class="h-8 opacity-40 invert"
                                    />
                                </div>

                            </div>
                        </div>

                        <!-- Footnote panel -->
                        {#if footnoteVisible}
                            <div in:fade={{ duration: 200 }} class="border border-white/10 bg-white/2.5 p-6 space-y-4">
                                <div class="flex items-start justify-between gap-4 mb-1">
                                    <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">Note — date of death</span>
                                    <button onclick={() => footnoteVisible = false} class="text-white/20 hover:text-white/60 transition-colors text-xs leading-none cursor-pointer mt-0.5">✕</button>
                                </div>
                                <div class="font-sans text-[13px] text-white/50 leading-relaxed space-y-3">
                                    <p>
                                        The date is uncertain. Jansen (2019, pp. 30–31) notes that in 1679 de Hooch and his wife were forced to admit their son Pieter to the Dolhuis. De Hooch is not mentioned in any source after that year, nor are his wife, his children, or his brothers-in-law Hendrick van der Burch and Barend Gast.
                                    </p>
                                    <p>
                                        The son died in 1684, a date often wrongly given for de Hooch himself, and was buried at the Dolhuis's expense — suggesting the parents were either unable to pay, had left the city, or had died in the meantime. There is a tenuous possibility de Hooch moved elsewhere, perhaps to Middelburg, where his father spent his old age.
                                    </p>
                                    <p>
                                        The figure of 1684 as a death date rests on a painting bearing that date (Sutton 1980a, p. 119, no. 161). Jansen considers a date in or after 1679 more likely on the available evidence.
                                    </p>
                                </div>
                            </div>
                        {/if}

                        <!-- Berchem Footnote panel -->
                        {#if berchemFootnoteVisible}
                            <div in:fade={{ duration: 200 }} class="border border-white/10 bg-white/2.5 p-6 space-y-4">
                                <div class="flex items-start justify-between gap-4 mb-1">
                                    <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">Note — training</span>
                                    <button onclick={() => berchemFootnoteVisible = false} class="text-white/20 hover:text-white/60 transition-colors text-xs leading-none cursor-pointer mt-0.5">✕</button>
                                </div>
                                <div class="font-sans text-[13px] text-white/50 leading-relaxed space-y-3">
                                    <p>
                                        Attributed to Nicolaes Berchem by Houbraken (1753), though the claim sits on shaky ground. Houbraken is a notoriously unreliable source, and the attribution finds no support in the work itself — Berchem's Italianate landscapes share no visible affinity with de Hooch's domestic interiors.
                                    </p>
                                </div>
                            </div>
                        {/if}

                        <!-- External Links -->
                        <div>
                            <h3 class="font-mono text-[11px] uppercase tracking-[0.3em] text-white/30 mb-6 border-b border-white/10 pb-4">
                                External Resources
                            </h3>
                            <div class="flex flex-col gap-2">
                                {#each [
                                    { href: 'https://research.rkd.nl/en/detail/https%3A%2F%2Fdata.rkd.nl%2Fartists%2F39452', label: 'RKD — Artist Record' },
                                    { href: 'https://research.rkd.nl/en/search?current=n_63_n&q=Pieter%20de%20Hooch&size=n_20_n&filters%5B0%5D%5Bfield%5D=db&filters%5B0%5D%5Bvalues%5D%5B0%5D=rkdexcerpts&filters%5B0%5D%5Btype%5D=all', label: 'RKD — Literature Excerpts' },
                                    { href: 'https://www.nga.gov/collection/artist-info.1403.html', label: 'NGA Archive' },
                                    { href: 'https://www.essentialvermeer.com/dutch-painters/masters/dehooghbase.html', label: 'Essential Vermeer' },
                                    { href: 'https://www.metmuseum.org/art/collection/search?q=Pieter+de+Hooch&searchField=ArtistCulture&showOnly=withImage&offset=0&material=Paintings', label: 'The MET Collection' },
                                    { href: 'https://en.wikipedia.org/wiki/List_of_paintings_by_Pieter_de_Hooch', label: 'Wikipedia — Paintings List' },
                                    { href: 'https://en.wikipedia.org/wiki/Dutch_Golden_Age_painting', label: 'Wikipedia — Dutch Golden Age' },
                                ] as link (link.href)}
                                    <a href={link.href}
                                       target="_blank"
                                       class="group px-5 py-4 border border-white/8 hover:border-white/25 hover:bg-white/[0.02] transition-all flex justify-between items-center">
                                        <span class="font-sans text-[12px] text-white/45 group-hover:text-white/80 transition-colors tracking-wide">{link.label}</span>
                                        <span class="text-white/15 group-hover:text-white/60 transition-all group-hover:translate-x-0.5 text-sm">→</span>
                                    </a>
                                {/each}
                            </div>
                        </div>

                    </aside>

                </div>
            </div>
        {/if}
    </main>
</div>

{#if lightboxActive && currentArtData}
  <Lightbox 
    item={{
        ...currentArtData,
        description: currentArtData.description,
        data: currentArtData.data as [string, string][]
    }}
    currentIndex={currentArtIndex}
    totalItems={artEntries.length}
    onClose={closeLightbox}
    onNext={goToNext}
    onPrev={goToPrevious}
  />
{/if}