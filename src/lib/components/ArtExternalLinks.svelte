<script lang="ts">
	const links = [
		{
			href: 'https://research.rkd.nl/en/detail/https%3A%2F%2Fdata.rkd.nl%2Fartists%2F39452',
			label: 'RKD — Artist Record'
		},
		{
			href: 'https://research.rkd.nl/en/search?current=n_63_n&q=Pieter%20de%20Hooch&size=n_20_n&filters%5B0%5D%5Bfield%5D=db&filters%5B0%5D%5Bvalues%5D%5B0%5D=rkdexcerpts&filters%5B0%5D%5Btype%5D=all',
			label: 'RKD — Literature Excerpts'
		},
		{ href: 'https://www.nga.gov/collection/artist-info.1403.html', label: 'NGA Archive' },
		{
			href: 'https://www.essentialvermeer.com/dutch-painters/masters/dehooghbase.html',
			label: 'Essential Vermeer'
		},
		{
			href: 'https://www.metmuseum.org/art/collection/search?q=Pieter+de+Hooch&searchField=ArtistCulture&showOnly=withImage&offset=0&material=Paintings',
			label: 'The MET Collection'
		},
		{
			href: 'https://en.wikipedia.org/wiki/List_of_paintings_by_Pieter_de_Hooch',
			label: 'Wikipedia — Paintings List'
		},
		{
			href: 'https://en.wikipedia.org/wiki/Dutch_Golden_Age_painting',
			label: 'Wikipedia — Dutch Golden Age'
		}
	];
</script>

<div>
	<h3
		class="mb-6 border-b border-white/10 pb-4 font-mono text-[11px] tracking-[0.3em] text-white/30 uppercase"
	>
		External Resources
	</h3>
	<div class="flex flex-col gap-2">
		{#each links as link (link.href)}
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				class="group flex items-center justify-between border border-white/8 px-5 py-4 transition-all hover:border-white/25 hover:bg-white/[0.02]"
			>
				<span
					class="font-sans text-[12px] tracking-wide text-white/45 transition-colors group-hover:text-white/80"
				>
					{link.label}
				</span>
				<span
					class="text-sm text-white/15 transition-all group-hover:translate-x-0.5 group-hover:text-white/60"
				>
					→
				</span>
			</a>
		{/each}
	</div>
</div>
