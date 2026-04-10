<script lang="ts">
	import { page } from '$app/stores';

	let menuOpen = false;
	let isPlaying = false;
	let isLoading = false;
	let audio: HTMLAudioElement;

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

	function toggleAudio() {
		if (!audio) return;

		if (audio.paused) {
			isLoading = true;
			audio.play();
		} else {
			audio.pause();
			isPlaying = false;
		}
	}

	function onPlay() {
		isPlaying = true;
		isLoading = false;
	}

	function onPause() {
		isPlaying = false;
	}

	function onWaiting() {
		isLoading = true;
	}

	function onCanPlay() {
		isLoading = false;
	}

	function handleEnded() {
		isPlaying = false;
	}
</script>

<audio
	bind:this={audio}
	src="/Gnossienne.opus"
	loop
	preload="metadata"
	on:play={onPlay}
	on:pause={onPause}
	on:waiting={onWaiting}
	on:canplay={onCanPlay}
	on:ended={handleEnded}
></audio>

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

			<nav class="hidden h-full items-center gap-6 md:flex" aria-label="Desktop navigation">
				{#each navLinks as link (link.path)}
					<a
						href={link.path}
						class="font-sans text-[11px] tracking-[0.1em] uppercase transition-colors duration-75
						{isActive(link.path) ? 'text-white/80' : 'text-dim hover:text-white/60'}"
					>
						{link.name}
					</a>
				{/each}

				<button
					on:click={toggleAudio}
					class="flex h-6 w-6 items-center justify-center text-dim transition-colors duration-75 hover:text-white/60 focus:outline-none"
					aria-label={isPlaying ? 'Pause music' : 'Play music'}
				>
					{#if isLoading}
						<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>
					{:else if isPlaying}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
						</svg>
					{:else}
						<svg class="h-5 w-5 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
							<path d="M8 5v14l11-7z" />
						</svg>
					{/if}
				</button>
			</nav>

			<div class="flex items-center md:hidden">
				<button
					on:click={toggleMenu}
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

				<button
					on:click={toggleAudio}
					class="flex w-full items-center justify-between px-6 py-3 font-sans text-[11px] tracking-[0.1em] uppercase text-dim transition-colors hover:bg-white/5 hover:text-white/60 focus:outline-none"
					aria-label={isPlaying ? 'Pause music' : 'Play music'}
				>
					<span>Music</span>
					<div class="flex h-4 w-4 items-center justify-center">
						{#if isLoading}
							<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>
						{:else if isPlaying}
							<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
							</svg>
						{:else}
							<svg class="h-3 w-3 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
						{/if}
					</div>
				</button>
			</div>
		</div>
	{/if}
</nav>