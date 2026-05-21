<script lang="ts">
	let {
		onToggleDeathFootnote,
		onToggleBerchemFootnote
	}: {
		onToggleDeathFootnote: () => void;
		onToggleBerchemFootnote: () => void;
	} = $props();
</script>

<div class="border border-white/8">
	<div class="relative aspect-[3/4] overflow-hidden bg-neutral-900">
		<img
			src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Angebliche_zelfportret_van_de_schilder_Pieter_de_Hooch%2C_Rijksmuseum_SK-A-181.jpg/500px-Angebliche_zelfportret_van_de_schilder_Pieter_de_Hooch%2C_Rijksmuseum_SK-A-181.jpg"
			alt="Possible self-portrait of Pieter de Hooch"
			class="h-full w-full object-cover object-top opacity-85"
			loading="lazy"
		/>
		<div
			class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3"
		>
			<p class="font-sans text-[10px] leading-snug text-white/50 italic">
				Possible self-portrait (1648–1649?)
			</p>
		</div>
	</div>

	<div class="divide-y divide-white/6">
		<div class="px-5 py-4 text-center">
			<h2 class="font-serif text-[20px] leading-tight text-white/90">Pieter de Hooch</h2>
			<p class="mt-1 font-sans text-[11px] tracking-wide text-white/35">
				Pieter Hendricksz. de Hooch
			</p>
		</div>

		<div class="grid grid-cols-[auto_1fr] divide-y divide-white/6">
			<div class="contents">
				<span
					class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
					>Born</span
				>
				<div class="px-4 py-3">
					<span class="font-sans text-[12px] leading-relaxed text-white/60"
						>Baptised 20 December 1629</span
					>
					<span class="mt-0.5 block font-sans text-[11px] text-white/35"
						>Rotterdam, Dutch Republic</span
					>
				</div>
			</div>

			<div class="contents">
				<span
					class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
					>Died</span
				>
				<div class="flex items-start gap-2 px-4 py-3">
					<div>
						<button
							onclick={onToggleDeathFootnote}
							class="inline-flex cursor-pointer items-center gap-1 font-sans text-[12px] text-white/60 underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
							aria-label="Toggle footnote about date of death"
						>
							In or after 1679?
						</button>
						<span class="mt-0.5 block font-sans text-[11px] text-white/35">aged at least 49</span>
					</div>
				</div>
			</div>

			<div class="contents">
				<span
					class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
					>Training</span
				>
				<div class="px-4 py-3">
					<button
						onclick={onToggleBerchemFootnote}
						class="inline-flex cursor-pointer items-center gap-1 font-sans text-[12px] text-white/60 underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
						aria-label="Toggle footnote about Nicolaes Berchem"
					>
						Nicolaes Berchem?
					</button>
				</div>
			</div>

			<div class="contents">
				<span
					class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
					>Movement</span
				>
				<div class="flex flex-wrap gap-1.5 px-4 py-3">
					{#each ['Dutch Golden Age', 'Baroque', 'Delft School'] as movement (movement)}
						<span
							class="border border-white/10 px-2 py-0.5 font-sans text-[10px] tracking-wide text-white/40"
							>{movement}</span
						>
					{/each}
				</div>
			</div>

			<div class="contents">
				<span
					class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
					>Spouse</span
				>
				<div class="px-4 py-3">
					<span class="font-sans text-[12px] text-white/60">Jannetje van der Burch</span>
					<span class="mt-0.5 block font-sans text-[11px] text-white/35">m. 1654 — d. 1667</span>
				</div>
			</div>

			<div class="contents">
				<span
					class="flex items-start border-r border-white/6 px-4 py-3 pt-3.5 font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase"
					>Children</span
				>
				<div class="px-4 py-3">
					<span class="font-sans text-[12px] text-white/60">7, incl. Pieter Pietersz. de Hooch</span
					>
				</div>
			</div>
		</div>
	</div>

	<div class="flex flex-col items-center gap-2 px-5 py-4">
		<span class="font-mono text-[9px] tracking-[0.25em] text-white/20 uppercase">Signature</span>
		<img
			src="https://upload.wikimedia.org/wikipedia/commons/3/31/Pieter_de_Hooch_Signature.svg"
			alt="Pieter de Hooch signature"
			class="h-8 opacity-40 invert"
			loading="lazy"
		/>
	</div>
</div>
