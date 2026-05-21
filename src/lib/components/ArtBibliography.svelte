<script lang="ts">
	import type { BibEntry } from '$lib/bibliography';

	let { bibliography }: { bibliography: BibEntry[] } = $props();
</script>

<section>
	<div class="mb-3 border-b border-white/10 pb-4">
		<h3 class="font-mono text-[11px] tracking-[0.3em] text-white/30 uppercase">
			Research Bibliography
		</h3>
	</div>
	<p class="mb-10 font-sans text-[13px] leading-relaxed text-white/35">
		Sources range from short catalogue essays and journal articles to full-length monographs,
		covering both de Hooch directly and the broader Dutch art market of the seventeenth century.
	</p>
	<div class="space-y-10">
		{#each bibliography as bib (bib.title)}
			<div class="group grid grid-cols-[3px_1fr] items-start gap-6">
				<div
					class="mt-1 h-full w-px self-stretch bg-white/8 transition-colors duration-75 group-hover:bg-white/25"
				></div>
				<div>
					<h4 class="font-serif text-[18px] leading-snug text-white/90">
						{#if bib.url}
							<a
								href={bib.url}
								target="_blank"
								class="italic underline decoration-white/10 underline-offset-4 transition-colors duration-75 hover:text-white hover:decoration-white/40"
							>
								{bib.title}
							</a>
						{:else}
							<span class="italic">{bib.title}</span>
						{/if}
					</h4>
					<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
						<span class="font-mono text-[10px] tracking-widest text-white/40 uppercase"
							>{bib.year}</span
						>
						<span class="h-1 w-1 rounded-full bg-white/15"></span>
						<span class="font-sans text-[11px] tracking-widest text-white/30 uppercase"
							>{bib.author}</span
						>
					</div>
					{#if bib.description}
						<p class="mt-3 font-sans text-[13px] leading-relaxed text-white/45 italic">
							{bib.description}
						</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>
