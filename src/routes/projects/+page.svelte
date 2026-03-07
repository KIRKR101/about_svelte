<script lang="ts">
  import { projects } from '$lib/projects-data';
</script>

<svelte:head>
    <title>Projects | kirkr.xyz</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center px-6 py-6 md:py-16 font-mono">
    <main class="w-full max-w-[800px] anim-row anim-row-1">
        
        <div class="py-7">
            <h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
                <span class="opacity-90">Projects</span><span class="opacity-20"><em class="not-italic italic">.</em></span>
            </h1>
            <div class="font-mono text-[11px] tracking-[0.1em] uppercase text-dim mt-2">a collection of projects</div>
        </div>

        <div class="h-px bg-bd mb-8"></div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {#each projects as project}
                <div class="flex flex-col border-b border-sep pb-8 last:border-0 md:last:border-b">
                    <h2 class="font-serif text-[24px] text-white/80 mb-2 leading-none">{project.title}</h2>
                    <p class="text-[13px] font-sans text-muted leading-relaxed mb-4 flex-1">
                        {project.description}
                    </p>
                    <div class="mt-auto">
                        {#if project.link}
                            <a href={project.link} target="_blank" class="font-mono text-[11px] tracking-[0.1em] uppercase text-dim no-underline transition-colors duration-75 hover:text-white/55 lowercase">
                                {project.link.replace('https://', '')} ↗
                            </a>
                        {:else if project.github}
                            <a href={project.github} target="_blank" class="font-mono text-[11px] tracking-[0.1em] uppercase text-dim no-underline transition-colors duration-75 hover:text-white/55 lowercase">
                                github ↗
                            </a>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </main>
</div>
