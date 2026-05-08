<script lang="ts">
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

	const recentPostsSlice = recentPosts.slice(0, 5);

	$effect(() => {
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
		currentTrack && currentTrack.duration > 0
			? (currentTrack.progress / currentTrack.duration) * 100
			: 0
	);
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<link rel="preconnect" href="https://i.scdn.co" />
</svelte:head>

<div class="flex items-start justify-center px-6 py-6">
	<div class="w-full max-w-[600px]">
		<div class="anim-row anim-row-1 py-6">
			<div class="mb-4 flex items-center justify-between">
				<div class="font-sans text-[10px] tracking-[0.2em] text-muted uppercase">About</div>
			</div>

			<div class="border-l border-bd/60 py-1 pl-5">
				<div class="space-y-4 font-sans text-[14px] leading-[1.7] text-white/70">
					<p>
						My main academic interest is in computer engineering, particularly architecture. I'm a
						fan of C, Zig, and TypeScript, and web technologies in general; this site is built on
						Svelte.
					</p>
					<p>
						I also have an interest in art, with a strong inclination towards the Dutch Golden Age,
						especially the Delft and Hague Schools. Beyond that, I have a passing interest in
						economics, reading papers in my spare time.
					</p>
				</div>

				<div class="mt-5">
					<a
						href="https://github.com/KIRKR101"
						target="_blank"
						rel="noopener noreferrer"
						class="font-sans text-[10px] tracking-[0.15em] text-muted uppercase no-underline hover:text-white/60"
					>
						View Github ↗
					</a>
				</div>
			</div>
		</div>

		<div class="anim-row anim-row-2 h-px bg-bd/60"></div>

		<div class="anim-row anim-row-3 py-6">
			<div class="mb-5 font-sans text-[10px] tracking-[0.15em] text-muted uppercase">
				{#if currentTrack}
					{#if currentTrack.isPlaying}
						Now playing · {currentTrack.source}
					{:else}
						Last played · {currentTrack.source}
					{/if}
				{:else}
					Initialising...
				{/if}
			</div>

			{#if currentTrack}
				<div class="flex items-start gap-4 sm:gap-6">
					<div
						class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-bd bg-art-bg sm:h-24 sm:w-24"
					>
						{#if currentTrack.url}
							<a
								href={currentTrack.url}
								target="_blank"
								rel="noopener noreferrer"
								class="block h-full w-full"
							>
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
						<div class="mb-1 font-serif text-[20px] leading-tight text-white/85 italic">
							{#if currentTrack.url}
								<a
									href={currentTrack.url}
									target="_blank"
									rel="noopener noreferrer"
									class="text-inherit no-underline transition-colors hover:text-white"
								>
									{currentTrack.title}
								</a>
							{:else}
								{currentTrack.title}
							{/if}
						</div>
						<div class="font-sans text-[11px] tracking-wide text-muted">
							{#if currentTrack.artistUrl}
								<a
									href={currentTrack.artistUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="text-inherit no-underline transition-colors duration-100 hover:text-white/78"
								>
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
							<div class="mt-1.5 flex justify-between text-[9px] text-muted sm:text-[10px]">
								<span>{formatTime(currentTrack.progress)}</span>
								<span>{formatTime(currentTrack.duration)}</span>
							</div>
						{:else}
							<div class="relative mt-[14px] h-px bg-rail"></div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="flex items-start gap-4 sm:gap-6">
					<div
						class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-bd bg-art-bg sm:h-24 sm:w-24"
					>
						<svg viewBox="0 0 24 24" class="h-6 w-6 fill-white/12 sm:h-7 sm:w-7">
							<path
								d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
							/>
						</svg>
					</div>
					<div class="min-w-0 flex-1 pt-0.5">
						<div class="mb-1 font-serif text-[20px] leading-tight text-white/85 italic">
							Initialising...
						</div>
						<div class="text-[11px] tracking-wide text-muted">...</div>
						<div class="relative mt-[14px] h-px bg-rail"></div>
					</div>
				</div>
			{/if}
		</div>

		<div class="anim-row anim-row-4 h-px bg-bd/60"></div>

		<div class="anim-row anim-row-5 py-6">
			<div class="mb-6 flex items-center justify-between">
				<div class="font-serif text-[26px] text-white/85 italic">Writings</div>
				<a
					href="/posts"
					class="font-sans text-[10px] tracking-[0.15em] text-muted uppercase no-underline hover:text-white/60"
				>
					All posts ↗
				</a>
			</div>

			<div class="flex flex-col">
				{#each recentPostsSlice as post (post.file)}
					<a
						href="/post/{post.file}"
						class="group flex w-full items-baseline justify-between border-b border-bd/30 py-4 no-underline last:border-0"
					>
						<span
							class="font-sans text-[14px] text-white/70 transition-colors duration-100 group-hover:text-white"
							>{post.title}</span
						>
						<span class="font-sans text-[11px] tracking-wider text-muted/60 uppercase"
							>{formatDate(post.date)}</span
						>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
