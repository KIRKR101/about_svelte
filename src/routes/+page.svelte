<script lang="ts">
	import { onMount } from 'svelte';
	import { recentPosts } from '$lib/posts-data';

	const SPOTIFY_API_URL = 'https://spotify.kirkr.xyz/api/now-playing';
	const LASTFM_API_URL = 'https://lastfm.kirkr.xyz/api/lastfm-track';

	interface SpotifyImage {
		height: number;
		width: number;
		url: string;
	}

	interface SpotifyTrackData {
		isPlaying: boolean;
		title: string;
		artist: string;
		artistUrl?: string;
		album: string;
		images: SpotifyImage[];
		progress: number;
		duration: number;
		uri: string;
		songUrl?: string;
		externalUrl?: string;
		playedAt?: string;
	}

	interface LastFmTrackData {
		status: string;
		title: string;
		artist: string;
		images: Record<string, string>;
		trackUrl: string;
	}

	type DataSource = 'spotify' | 'lastfm' | null;

	let spotifyData: SpotifyTrackData | null = $state(null);
	let lastFmData: LastFmTrackData | null = $state(null);
	let dataSource: DataSource = $state(null);
	let localProgress = $state(0);
	let lastFetchTime = $state(0);
	let currentTime = $state(new Date());
	let isFetching = false;

	let intervalId: ReturnType<typeof setInterval> | undefined;
	let progressIntervalId: ReturnType<typeof setInterval> | undefined;
	let retryTimeoutId: ReturnType<typeof setTimeout> | undefined;

	async function fetchSpotifyTrack() {
		if (isFetching) return;
		isFetching = true;
		try {
			const response = await fetch(SPOTIFY_API_URL);
			if (!response.ok) throw new Error(`Spotify API responded with ${response.status}`);
			const data = await response.json();

			if (data.isPlaying === false && !data.title) {
				isFetching = false;
				retryTimeoutId = setTimeout(() => fetchSpotifyTrack(), 3000);
				return;
			}

			if (data.isPlaying !== undefined) {
				spotifyData = data;
				localProgress = data.progress ?? 0;
				lastFetchTime = Date.now();
				dataSource = 'spotify';
				setupProgressUpdate();
				isFetching = false;
				return;
			}

			throw new Error('Invalid Spotify response');
		} catch (error) {
			console.info('Falling back to Last.fm:', error);
			isFetching = false;
			dataSource = 'lastfm';
			fetchLastFmTrack();
		}
	}

	async function fetchLastFmTrack() {
		try {
			const response = await fetch(LASTFM_API_URL);
			if (!response.ok) throw new Error(`Last.fm API responded with ${response.status}`);
			lastFmData = await response.json();
		} catch (error) {
			console.error('Error fetching Last.fm track:', error);
		}
	}

	function fetchCurrentTrack() {
		if (dataSource === 'lastfm') {
			fetchLastFmTrack();
		} else {
			fetchSpotifyTrack();
		}
	}

	function setupProgressUpdate() {
		if (progressIntervalId) clearInterval(progressIntervalId);
		if (spotifyData?.isPlaying) {
			progressIntervalId = setInterval(() => {
				const elapsed = Date.now() - lastFetchTime;
				const newProgress = (spotifyData?.progress ?? 0) + elapsed;
				if (newProgress >= (spotifyData?.duration ?? 0)) {
					fetchSpotifyTrack();
				} else {
					localProgress = newProgress;
				}
			}, 100);
		}
	}

	function getLargestImage(images: SpotifyImage[]): string {
		if (!images || images.length === 0) return '';
		return images.reduce((best, img) => (img.width > best.width ? img : best)).url;
	}

	function generateSpotifySrcset(images: SpotifyImage[]): string {
		if (!images || images.length === 0) return '';
		return images.map((img) => `${img.url} ${img.width}w`).join(', ');
	}

	function generateLastFmSrcset(images: Record<string, string>): string {
		if (!images) return '';
		const mapping: Record<string, string> = {
			small: '34w',
			medium: '64w',
			large: '174w',
			extralarge: '300w',
			mega: '500w'
		};
		return Object.entries(images)
			.filter(([size, url]) => url && mapping[size])
			.map(([size, url]) => `${url} ${mapping[size]}`)
			.join(', ');
	}

	function formatAriaLabel(progress: number, duration: number) {
		const progressPercent = duration > 0 ? Math.round((progress / duration) * 100) : 0;
		return `${progressPercent}% played`;
	}

	function getLastFmFallback(images: Record<string, string>): string {
		if (!images) return '';
		return images['extralarge'] || images['large'] || images['medium'] || images['small'] || '';
	}

	function formatTime(ms: number) {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	}

	function formatPlayedAt(dateString: string) {
		const date = new Date(dateString);
		const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
		const dayMonth = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		return `${dayMonth} at ${time}`;
	}

	const recentPostsSlice = recentPosts.slice(0, 5);

	$effect(() => {
		const clockInterval = setInterval(() => (currentTime = new Date()), 1000);
		return () => clearInterval(clockInterval);
	});

	onMount(() => {
		fetchSpotifyTrack();
		intervalId = setInterval(fetchCurrentTrack, 60000);
		return () => {
			if (intervalId) clearInterval(intervalId);
			if (progressIntervalId) clearInterval(progressIntervalId);
			if (retryTimeoutId) clearTimeout(retryTimeoutId);
		};
	});

	let currentTrack = $derived.by(() => {
		if (dataSource === 'spotify' && spotifyData) {
			return {
				source: 'Spotify',
				title: spotifyData.title,
				artist: spotifyData.artist,
				artistUrl: spotifyData.artistUrl,
				album: spotifyData.album,
				url: spotifyData.songUrl || spotifyData.externalUrl,
				imageUrl: getLargestImage(spotifyData.images),
				imageSrcset: generateSpotifySrcset(spotifyData.images),
				isPlaying: spotifyData.isPlaying,
				showProgress: spotifyData.isPlaying,
				duration: spotifyData.duration,
				progress: localProgress,
				playedAt: spotifyData.playedAt
			};
		}
		if (dataSource === 'lastfm' && lastFmData) {
			return {
				source: 'Last.fm',
				title: lastFmData.title,
				artist: lastFmData.artist,
				artistUrl: '',
				album: '',
				url: lastFmData.trackUrl,
				imageUrl: getLastFmFallback(lastFmData.images),
				imageSrcset: generateLastFmSrcset(lastFmData.images),
				isPlaying: lastFmData.status === 'Currently playing',
				showProgress: false,
				duration: 0,
				progress: 0,
				playedAt: undefined
			};
		}
		return null;
	});

	let progressPercentage = $derived(
		currentTrack && currentTrack.duration > 0 ? (currentTrack.progress / currentTrack.duration) * 100 : 0
	);

	let displayTime = $derived(
		currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
	);
	let displayDay = $derived(
		currentTime.toLocaleDateString('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			timeZone: 'UTC'
		})
	);
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<link rel="preconnect" href="https://i.scdn.co" />
</svelte:head>

<div class="flex items-start justify-center px-6 py-6 md:py-16">
	<div class="w-full max-w-[600px]">
		<div class="anim-row anim-row-1 py-7">
			<div class="font-serif text-[58px] leading-[0.92] tracking-[-1.5px] text-white">
				<span class="opacity-90">kirkr</span><span class="opacity-18"
					><em class="italic not-italic">.</em>xyz</span
				>
			</div>
			<div class="mt-[14px] font-mono text-[11px] tracking-[0.1em] text-dim uppercase"></div>
		</div>

		<div class="anim-row anim-row-2 h-px bg-bd"></div>

		<div class="anim-row anim-row-3 grid grid-cols-1 gap-6 py-7 md:grid-cols-2 md:gap-0">
			<div class="border-b border-bd pr-0 pb-6 md:border-r md:border-b-0 md:pr-6 md:pb-0">
				<div class="mb-[14px] font-sans text-[11px] tracking-[0.1em] text-dim uppercase">
					Local time · GMT
				</div>
				<div
					class="font-serif text-[32px] leading-none tracking-[-1.5px] text-white/85 md:text-[40px]"
				>
					{displayTime}
				</div>
				<div class="mt-[6px] font-serif text-xs text-white/45 italic">{displayDay}</div>
			</div>

			<div class="flex flex-col justify-center pl-0 md:pl-6">
				<div class="mb-[14px] font-sans text-[11px] tracking-[0.1em] text-dim uppercase">
					Open source
				</div>
				<a
					href="https://github.com/Kirkr101"
					target="_blank"
					class="group flex items-center gap-[10px] text-inherit no-underline transition-opacity duration-75 hover:opacity-70"
					><svg viewBox="0 0 16 16" class="h-5 w-5 shrink-0 fill-muted md:h-6 md:w-6"
						><path
							fill-rule="evenodd"
							d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
						></path></svg
					>
					<span
						class="font-serif text-[24px] leading-none tracking-[-0.5px] text-white/85 md:text-[28px]"
						>Kirkr101</span
					></a
				>
				<div class="mt-2 ml-[30px] text-[11px] tracking-[0.1em] text-dim uppercase md:ml-[36px]">
					github.com ↗
				</div>
			</div>
		</div>

		<div class="anim-row anim-row-3 h-px bg-bd"></div>

		<div class="anim-row anim-row-4 py-7">
			<div class="mb-4 flex items-center justify-between">
				<div class="font-sans text-[11px] tracking-[0.1em] text-dim uppercase">
					{#if currentTrack}
						{#if currentTrack.isPlaying}
							Now playing · {currentTrack.source}
						{:else}
							Last played{#if currentTrack.playedAt} {formatPlayedAt(currentTrack.playedAt)}{/if} · {currentTrack.source}
						{/if}
					{:else}
						Initialising...
					{/if}
				</div>
			</div>

			{#if currentTrack}
				<div class="flex items-start gap-3 sm:gap-4">
					<div
						class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-bd bg-art-bg sm:h-24 sm:w-24"
					>
						{#if currentTrack.url}
							<a href={currentTrack.url} target="_blank" rel="noopener noreferrer" class="block h-full w-full">
								<img
									srcset={currentTrack.imageSrcset}
									sizes="(max-width: 768px) 80px, 96px"
									src={currentTrack.imageUrl}
									alt={currentTrack.title}
									class="h-full w-full object-cover"
								/>
							</a>
						{:else}
							<img
								srcset={currentTrack.imageSrcset}
								sizes="(max-width: 768px) 80px, 96px"
								src={currentTrack.imageUrl}
								alt={currentTrack.title}
								class="h-full w-full object-cover"
							/>
						{/if}
					</div>
					<div class="min-w-0 flex-1 pt-0.5">
						<div class="mb-1 font-serif text-[18px] leading-snug text-white/78 italic sm:text-[20px]">
							{#if currentTrack.url}
								<a
									href={currentTrack.url}
									target="_blank"
									rel="noopener noreferrer"
									class="font-serif text-[18px] text-white/78 italic no-underline hover:text-white sm:text-[20px]"
								>
									{currentTrack.title}
								</a>
							{:else}
								{currentTrack.title}
							{/if}
						</div>
						<div class="font-sans text-[10px] tracking-[0.04em] text-muted sm:text-[11px]">
							{#if currentTrack.artistUrl}
								<a href={currentTrack.artistUrl} target="_blank" rel="noopener noreferrer" class="text-inherit no-underline hover:text-white transition-colors duration-200">
									{currentTrack.artist}
								</a>
							{:else}
								{currentTrack.artist}
							{/if}
							{#if currentTrack.album}
								{' · ' + currentTrack.album}
							{/if}
						</div>

						{#if currentTrack.showProgress}
							<div
								class="relative mt-[14px] h-px bg-rail"
								aria-label={formatAriaLabel(currentTrack.progress, currentTrack.duration)}
							>
								<div
									class="linear absolute inset-y-0 left-0 h-full bg-prog transition-[width] duration-100"
									style="width: {progressPercentage}%"
								></div>
								<div
									class="absolute top-[-3.5px] h-2 w-2 -translate-x-1/2 rounded-full bg-white"
									style="left: {progressPercentage}%"
								></div>
							</div>
							<div class="mt-1.5 flex justify-between text-[9px] text-dim sm:text-[10px]">
								<span>{formatTime(currentTrack.progress)}</span>
								<span>{formatTime(currentTrack.duration)}</span>
							</div>
						{:else}
							<div class="relative mt-[14px] h-px bg-rail"></div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="flex items-start gap-3 sm:gap-4">
					<div
						class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-bd bg-art-bg sm:h-24 sm:w-24"
					>
						<svg viewBox="0 0 24 24" class="h-6 w-6 fill-white/12 sm:h-7 sm:w-7">
							<path
								d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
							/>
						</svg>
					</div>
					<div class="min-w-0 flex-1 pt-0.5">
						<div class="mb-1 font-serif text-[16px] leading-snug text-white/78 sm:text-[18px]">
							Initialising...
						</div>
						<div class="text-[10px] tracking-[0.04em] text-muted sm:text-[11px]">...</div>
						<div class="relative mt-[14px] h-px bg-rail"></div>
					</div>
				</div>
			{/if}
		</div>

		<div class="anim-row anim-row-4 h-px bg-bd"></div>

		<div class="anim-row anim-row-5 pt-7">
			<div class="mb-3 flex items-center justify-between">
				<div class="font-serif text-[24px] text-white/78 italic">Writings</div>
				<a
					href="/posts"
					class="font-sans text-[11px] tracking-[0.1em] text-dim uppercase no-underline transition-colors duration-75 hover:text-white/55"
				>
					All posts ↗
				</a>
			</div>

			{#each recentPostsSlice as post (post.file)}
				<a
					href="/post/{post.file}"
					class="group flex w-full items-baseline gap-3.5 border-b border-sep py-[11px] text-left no-underline last:border-0"
				>
					<span
						class="flex-1 font-sans text-[14px] leading-[1.35] text-entry transition-colors duration-75 group-hover:text-entry-h"
						>{post.title}</span
					>
					<span class="font-sans text-[11px] tracking-[0.04em] whitespace-nowrap text-dim"
						>{formatDate(post.date)}</span
					>
				</a>
			{/each}
		</div>
	</div>
</div>