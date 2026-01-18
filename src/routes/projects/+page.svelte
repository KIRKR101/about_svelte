<script lang="ts">
  const projects = [
    {
        id: "voxor",
        title: "Voxor",
        link: "https://voxor.kirkr.xyz",
        github: null,
        description:
            "Self-hosted chat solution built with Flask and Tailwind. Send messages and files without limits. Custom bot integration with a full API.",
    },
    {
        id: "cpusim",
        title: "CPUsim",
        link: null,
        github: "https://github.com/Kirkr101/CPUsim",
        description:
            "A C program to simulate a basic CPU and a custom instruction set, supporting operations like arithmetic, data movement, I/O, and control flow.",
    },
    {
        id: "streamline",
        title: "streamline",
        link: null,
        github: "https://github.com/Kirkr101/Streamline",
        description:
            "A simple and efficient CLI built with Rust for transferring files and directories over a LAN. It supports zipping, chunking, parallel transfers, and SHA256 hashing.",
    },
    {
        id: "rmt-debrid",
        title: "rmt-debrid",
        link: null,
        github: "https://github.com/Kirkr101/RMT-Debrid",
        description:
            "A FastAPI interface for Real-Debrid to remotely manage torrent downloads. It supports both regular and magnet links.",
    },
    {
        id: "audioshare",
        title: "audioshare",
        link: null,
        github: "https://github.com/Kirkr101/audioshare",
        description:
            "A Next.js app for uploading and playing large lossless audio files online. It supports high-quality audio and rich metadata to keep files as original as possible.",
    },
    {
        id: "linux-keylogger",
        title: "linux_keylogger",
        link: null,
        github: "https://github.com/KIRKR101/linux_keylogger",
        description:
            "A Linux keylogger that runs as a daemon, using device drivers to access keyboard logs. It adds to a log file with a low footprint.",
    },
    {
        id: "open-gallery",
        title: "Open Gallery",
        link: null,
        github: "https://github.com/KIRKR101/open-gallery",
        description:
            "A hacked together interface written in Go displaying scraped artworks from the National Gallery with clean and full metadata.",
    },
    {
        id: "wasmagick",
        title: "WASMagick",
        link: "https://wasmagick.kirkr.xyz",
        github: "github.com/Kirkr101/WASMagick",
        description:
            "A client-side image converter using a WASM implementation of Magick, featuring compression, dynamic resizing, transformations, filters, colour effects, etc.",
    },
  ];
</script>

<svelte:head>
    <title>Projects | kirkr.xyz</title>
    <meta name="description" content="A collection of projects." />
    <meta name="robots" content="index, follow" />
</svelte:head>

<!-- PAGE CONTAINER -->
<div class="min-h-full relative text-[#1A1A1A] dark:text-[#E0E0E0] p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center font-sans selection:bg-[#FF4D00] selection:text-white overflow-x-hidden">

    <!-- CSS GRAIN OVERLAY -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-50 mix-blend-multiply dark:mix-blend-overlay bg-noise"></div>

    <main class="w-full max-w-6xl relative z-10">
        <!-- HEADER CARD -->
        <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 mb-6 p-8 flex flex-col justify-center text-center min-h-[120px]">
            <h1 class="font-display font-extrabold text-5xl md:text-6xl leading-[0.8] tracking-tight text-[#1A1A1A] dark:text-[#EEEEEE] mb-3">
                Projects<span class="text-[#FF4D00]">.</span>
            </h1>
            <p class="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-2">
                a collection of projects
            </p>
        </div>

        <!-- PROJECTS GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each projects as project}
                <div class="bg-[#FAF9F6] dark:bg-[#1E1E22] border-[1.5px] border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#FF4D00] dark:shadow-[4px_4px_0px_0px_#000000] relative z-10 transition-transform duration-300 ease-out hover:-translate-y-1 hover:-translate-x-[1px] hover:shadow-[6px_6px_0px_0px_#1A1A1A] dark:hover:shadow-[6px_6px_0px_0px_#55555A] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_#1A1A1A] flex flex-col overflow-hidden">
                    <div class="p-6">
                        <h2 class="font-display font-bold text-xl text-[#1A1A1A] dark:text-[#EEEEEE] leading-tight">
                            {project.title}
                        </h2>
                    </div>
                    <div class="grow flex flex-col px-6 pb-2 pt-0">
                        <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 grow">
                            {project.description}
                        </p>
                    </div>
                    <div class="p-6 pt-0">
                        {#if project.link}
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-1 no-underline hover:text-[#FF4D00] transition-colors hover:underline"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-[14px] h-[14px] fill-none stroke-current stroke-2.5 stroke-linecap-round stroke-linejoin-round">
                                    <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                                    <g class="transition-transform duration-150">
                                        <path d="m21 3-9 9" />
                                        <path d="M15 3h6v6" />
                                    </g>
                                </svg>
                                <span>{project.link.replace('https://', '')}</span>
                            </a>
                        {:else if project.github}
                            <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-1 no-underline hover:text-[#FF4D00] transition-colors hover:underline"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-[14px] h-[14px] fill-none stroke-current stroke-2.5 stroke-linecap-round stroke-linejoin-round">
                                    <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                                    <g class="transition-transform duration-150">
                                        <path d="m21 3-9 9" />
                                        <path d="M15 3h6v6" />
                                    </g>
                                </svg>
                                <span>github</span>
                            </a>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
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
