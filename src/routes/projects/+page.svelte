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
</svelte:head>

<div class="min-h-screen flex flex-col items-center px-6 py-12">
    <main class="w-full max-w-[800px] anim-row anim-row-1">
        
        <div class="py-7">
            <h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white/90">
                Projects<em class="not-italic italic text-white/20">.</em>
            </h1>
            <div class="lbl mt-2">a collection of projects</div>
        </div>

        <div class="rule mb-8"></div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {#each projects as project}
                <div class="flex flex-col border-b border-sep pb-8">
                    <h2 class="font-serif text-[24px] text-white/80 mb-2">{project.title}</h2>
                    <p class="text-[13px] text-muted leading-relaxed mb-4 flex-1">
                        {project.description}
                    </p>
                    <div class="mt-auto">
                        {#if project.link}
                            <a href={project.link} target="_blank" class="arc-link lowercase text-[10px]">
                                {project.link.replace('https://', '')} ↗
                            </a>
                        {:else if project.github}
                            <a href={project.github} target="_blank" class="arc-link lowercase text-[10px]">
                                github ↗
                            </a>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </main>
</div>

<style>
  .arc-link {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-dim);
    text-decoration: none;
    transition: color 0.07s;
  }
  .arc-link:hover { color: rgba(255,255,255,0.55); }
</style>
