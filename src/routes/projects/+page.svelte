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

<div class="flex flex-col items-center p-4 md:p-8">
  <div class="w-full max-w-5xl mx-auto">
    <header class="flex items-center justify-center p-0 mb-8 md:mb-12 mt-8 sm:mt-0">
      <div class="text-center">
        <h1 class="text-xl sm:text-2xl mb-2 font-normal">Projects</h1>
        <p class="text-sm sm:text-base text-muted-foreground">a collection of projects</p>
      </div>
    </header>

    <section class="w-full">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {#each projects as project}
          <div class="flex flex-col border rounded-lg">
            <div class="p-6">
              <h2 class="font-sans flex items-center text-base">
                {project.title}
              </h2>
            </div>
            <div class="font-sans grow flex flex-col p-6 pt-0">
              <p class="text-sm text-muted-foreground leading-6 mb-4 grow">
                {project.description}
              </p>
            </div>
            <div class="p-6 pt-0">
              {#if project.link}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs text-muted-foreground inline-flex items-center gap-1 no-underline hover:text-foreground transition-colors hover:underline"
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
                  class="text-xs text-muted-foreground inline-flex items-center gap-1 no-underline hover:text-foreground transition-colors hover:underline"
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
    </section>
  </div>
</div>
