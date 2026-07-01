<script lang="ts">
	import { page } from '$app/stores';
	import { fly, fade } from 'svelte/transition';

	let menuOpen = $state(false);

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

	$effect(() => {
		if (!menuOpen) {
			document.body.style.overflow = '';
			return;
		}
		document.body.style.overflow = 'hidden';
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') closeMenu();
		}
		window.addEventListener('keydown', handleKeydown);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<nav
	aria-label="Main navigation"
	class="relative z-50 h-16 shrink-0 border-b border-bd bg-[#0a0a0b]/80 backdrop-blur-sm"
>
	<div class="mx-auto h-full max-w-[1200px] px-4 md:px-6">
		<div class="flex h-full items-center justify-between">
			<div class="flex items-center">
				<a href="/" class="group focus:outline-none">
					<span
						class="font-serif text-[24px] leading-none tracking-[-1px] text-white md:text-[28px]"
					>
						<span class="opacity-90">kirkr</span><span class="opacity-20">.xyz</span>
					</span>
				</a>
			</div>

			<nav class="hidden h-full items-center gap-6 md:flex" aria-label="Desktop navigation">
				{#each navLinks as link (link.path)}
					<a
						href={link.path}
						class="font-sans text-[11px] tracking-[0.1em] uppercase transition-colors duration-75
						{isActive(link.path) ? 'text-white/80' : 'text-muted hover:text-white/60'}"
					>
						{link.name}
					</a>
				{/each}
			</nav>

			<div class="flex items-center md:hidden">
				<button
					onclick={toggleMenu}
					class="flex h-10 w-10 items-center justify-center focus:outline-none"
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

	{#if menuOpen}
		<div
			transition:fly={{ y: -6, duration: 200 }}
			class="absolute top-16 right-0 left-0 rounded-b-sm border-b border-bd bg-[#0a0a0b] shadow-xl md:hidden"
		>
			<div class="flex flex-col divide-y divide-bd/50">
				{#each navLinks as link (link.path)}
					<a
						href={link.path}
						onclick={closeMenu}
						class="px-6 py-3 font-sans text-[11px] tracking-[0.1em] uppercase transition-colors duration-75
						{isActive(link.path)
							? 'bg-white/5 text-white/80'
							: 'text-muted hover:bg-white/5 hover:text-white/60'}"
					>
						{link.name}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</nav>

{#if menuOpen}
	<div
		transition:fade={{ duration: 150 }}
		class="fixed inset-0 top-16 z-40 backdrop-blur-[2px] md:hidden"
		onclick={closeMenu}
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				closeMenu();
			}
		}}
		aria-label="Close menu"
		role="button"
		tabindex="0"
	></div>
{/if}
