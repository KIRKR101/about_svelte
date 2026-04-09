<script lang="ts">
	import { page } from '$app/stores';

	let menuOpen = false;

	function isActive(path: string) {
		if (path === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(path);
	}

	const navLinks = [
		{ name: 'Posts', path: '/posts' },
		{ name: 'Projects', path: '/projects' },
		{ name: 'Films', path: '/films' },
		{ name: 'Art', path: '/art' },
		{ name: 'Photography', path: '/photography' }
	];

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<nav
	aria-label="Main navigation"
	class="fixed top-0 right-0 left-0 z-50 h-16 border-b border-bd bg-[#0a0a0b]/80 backdrop-blur-sm"
	style="padding-right: var(--scrollbar-width, 0px);"
>
	<div class="mx-auto h-full max-w-[1200px] px-4 md:px-6">
		<div class="flex h-full items-center justify-between">
			<div class="flex items-center">
				<a href="/" class="group focus:outline-none">
					<span
						class="font-serif text-[24px] leading-none tracking-[-1px] text-white md:text-[28px]"
					>
						<span class="opacity-90">kirkr</span><span class="opacity-20"
							><em class="italic not-italic">.</em>xyz</span
						>
					</span>
				</a>
			</div>

			<nav class="hidden h-full items-center gap-8 md:flex" aria-label="Desktop navigation">
				{#each navLinks as link (link.path)}
					<a
						href={link.path}
						class="font-sans text-[11px] tracking-[0.1em] uppercase transition-colors duration-75
            {isActive(link.path) ? 'text-white/80' : 'text-dim hover:text-white/60'}"
					>
						{link.name}
					</a>
				{/each}
			</nav>

			<!-- Mobile hamburger menu -->
			<div class="flex items-center md:hidden">
				<button
					on:click={toggleMenu}
					class="flex h-10 w-10 items-center justify-center"
					aria-label="Toggle menu"
					aria-expanded={menuOpen}
				>
					<svg
						class="h-6 w-6 text-white/70"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						{#if menuOpen}
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
							/>
						{/if}
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu dropdown -->
	{#if menuOpen}
		<div class="absolute top-16 right-0 left-0 border-b border-bd bg-[#0a0a0b] md:hidden">
			<div class="flex flex-col py-4">
				{#each navLinks as link (link.path)}
					<a
						href={link.path}
						on:click={closeMenu}
						class="px-6 py-3 font-sans text-[11px] tracking-[0.1em] uppercase transition-colors duration-75
            {isActive(link.path)
							? 'bg-white/5 text-white/80'
							: 'text-dim hover:bg-white/5 hover:text-white/60'}"
					>
						{link.name}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</nav>
