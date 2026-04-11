<script lang="ts">
	import { onMount } from 'svelte';
	import { projects } from '$lib/projects-data';

	interface ContributionDay {
		date: string;
		contributionCount: number;
		color: string;
	}

	interface ContributionCalendar {
		totalContributions: number;
		weeks: { contributionDays: ContributionDay[] }[];
	}

	let graphContainer = $state<HTMLElement | null>(null);
	let isMobile = $state(false);
	let contributions = $state<ContributionCalendar | null>(null);
	let loading = $state(true);

	let tooltip = $state<{ visible: boolean; date: string; count: number; x: number; y: number }>({
		visible: false,
		date: '',
		count: 0,
		x: 0,
		y: 0
	});

	let contributionWeeks = $derived(contributions?.weeks || []);
	let totalContributions = $derived(contributions?.totalContributions || 0);
	let currentYear = $derived(new Date().getFullYear());

	// Fetches GitHub contribution data from a proxy API that mirrors the GitHub GraphQL API.
	async function fetchContributions() {
		try {
			const res = await fetch('https://github.kirkr.xyz/');
			if (!res.ok) return;
			const data = await res.json();
			contributions = data.contributions;
		} catch (e) {
			console.error('Error fetching contributions:', e);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchContributions();
		isMobile = window.matchMedia('(max-width: 768px)').matches;
		const handleResize = () => {
			isMobile = window.matchMedia('(max-width: 768px)').matches;
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	// Maps contribution count to GitHub's contribution color palette.
	function getContributionColor(count: number) {
		if (count === 0) return '#1a1a1c';
		if (count < 5) return '#0e4429';
		if (count < 10) return '#006d32';
		if (count < 20) return '#26a641';
		return '#39d353';
	}

	function formatContribDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	// Displays a tooltip showing contribution count and date for a specific day.
	// Clamps the X position to keep the tooltip within the graph container.
	function showTooltip(event: MouseEvent | FocusEvent, day: ContributionDay) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const parentRect = graphContainer?.getBoundingClientRect();
		if (!parentRect) return;

		const rawX = rect.left - parentRect.left + rect.width / 2;
		const clampedX = Math.max(50, Math.min(rawX, parentRect.width - 50));

		tooltip = {
			visible: true,
			date: formatContribDate(day.date),
			count: day.contributionCount,
			x: clampedX,
			y: rect.top - parentRect.top - 6
		};
	}

	function hideTooltip() {
		tooltip = { ...tooltip, visible: false };
	}
</script>

<svelte:head>
	<title>Projects | kirkr.xyz</title>
</svelte:head>

<div class="flex flex-col items-center px-4 py-6 font-mono sm:px-6 md:py-16">
	<div class="anim-row anim-row-1 w-full max-w-[1200px]">
		<div class="py-7">
			<h1 class="font-serif text-[40px] leading-tight tracking-[-1px] text-white sm:text-[48px]">
				<span class="opacity-90">Projects</span><span class="opacity-20"
					><em class="italic not-italic">.</em></span
				>
			</h1>
			<div class="mt-2 font-sans text-[11px] tracking-[0.1em] text-dim uppercase">
				a collection of projects
			</div>
		</div>
	</div>

	<div class="anim-row anim-row-2 w-full max-w-[1200px] py-7">
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<svg viewBox="0 0 16 16" class="h-4 w-4 fill-muted">
					<path
						fill-rule="evenodd"
						d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
					/>
				</svg>
				<span class="font-sans text-[11px] tracking-[0.1em] text-dim uppercase">Github</span>
			</div>
			<a
				href="https://github.com/Kirkr101"
				target="_blank"
				rel="noopener noreferrer"
				class="font-sans text-[11px] tracking-[0.1em] text-dim uppercase no-underline transition-colors duration-75 hover:text-white/55"
			>
				Kirkr101 ↗
			</a>
		</div>

		<div class="mb-3 flex min-h-[16px] items-center">
			{#if loading}
				<div class="h-3 w-48 animate-pulse rounded-sm bg-white/5"></div>
			{:else}
				<div class="font-sans text-[11px] tracking-[0.04em] text-muted">
					{totalContributions.toLocaleString()} contributions in {currentYear}
				</div>
			{/if}
		</div>

		<div class="contribution-graph relative min-w-0" bind:this={graphContainer}>
			{#if tooltip.visible && !isMobile}
				<div
					class="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
					style="left: {tooltip.x}px; top: {tooltip.y}px;"
				>
					<div
						class="rounded-[4px] border border-muted/25 bg-[#1a1a1c] px-2.5 py-1.5 text-[11px] whitespace-nowrap shadow-xl ring-1 ring-black/40"
					>
						<span class="font-semibold text-white/90"
							>{tooltip.count === 0
								? 'No contributions'
								: `${tooltip.count} contribution${tooltip.count !== 1 ? 's' : ''}`}</span
						>
						<span class="ml-1.5 text-white/45">on {tooltip.date}</span>
					</div>
					<div class="absolute top-full left-1/2 -translate-x-1/2">
						<div
							class="absolute -top-px left-1/2 h-0 w-0 -translate-x-1/2"
							style="border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #30363d;"
						></div>
						<div
							class="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2"
							style="border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid #0d1117;"
						></div>
					</div>
				</div>
			{/if}

			<div
				class="grid w-full gap-[3px]"
				style="grid-template-columns: repeat({loading
					? 53
					: contributionWeeks.length}, minmax(0, 1fr));"
			>
				{#if loading}
					{#each [...Array(53).keys()] as wi (wi)}
						<div class="grid grid-rows-7 gap-[3px]">
							{#each [...Array(7).keys()] as di (di)}
								<div class="aspect-square w-full animate-pulse rounded-[2px] bg-white/5"></div>
							{/each}
						</div>
					{/each}
				{:else}
					{#each contributionWeeks as week, wi (week.contributionDays[0]?.date ?? `week-${wi}`)}
						<div class="grid grid-rows-7 gap-[3px]">
							{#each week.contributionDays as day (day.date)}
								<button
									class="relative aspect-square w-full cursor-default border-0 p-0 transition-all duration-75 sm:rounded-[3px] sm:hover:z-10 sm:hover:scale-110 sm:hover:brightness-125 sm:focus:z-10"
									style="background-color: {getContributionColor(day.contributionCount)}"
									onmouseenter={!isMobile ? (e) => showTooltip(e, day) : undefined}
									onmouseleave={!isMobile ? hideTooltip : undefined}
									onfocus={!isMobile ? (e) => showTooltip(e, day) : undefined}
									onblur={!isMobile ? hideTooltip : undefined}
									tabindex={isMobile ? -1 : 0}
									aria-label="{day.contributionCount} contributions on {day.date}"
								></button>
							{/each}
						</div>
					{/each}
				{/if}
			</div>

			<div class="mt-3 flex items-center justify-end gap-[3px]">
				<span class="mr-1 font-sans text-[10px] text-muted">Less</span>
				{#each [0, 3, 8, 15, 25] as count (count)}
					{#if loading}
						<div
							class="h-[10px] w-[10px] flex-shrink-0 animate-pulse rounded-[2px] bg-white/5"
						></div>
					{:else}
						<div
							class="h-[10px] w-[10px] flex-shrink-0 rounded-[2px]"
							style="background-color: {getContributionColor(count)}"
						></div>
					{/if}
				{/each}
				<span class="ml-1 font-sans text-[10px] text-muted">More</span>
			</div>
		</div>
	</div>

	<div class="h-px w-full max-w-[1200px] bg-bd"></div>

	<main class="anim-row anim-row-3 mt-8 w-full max-w-[1200px]">
		<div class="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
			{#each projects as project (project.title)}
				<div class="flex flex-col border-b border-sep pb-8 last:border-0 md:last:border-b">
					<h2 class="mb-2 font-serif text-[24px] leading-none text-white/80">{project.title}</h2>
					<p class="mb-4 flex-1 font-sans text-[13px] leading-relaxed text-muted">
						{project.description}
					</p>
					<div class="mt-auto">
						{#if project.link}
							<a
								href={project.link}
								target="_blank"
								rel="noopener noreferrer"
								class="font-sans text-[11px] tracking-[0.1em] text-dim uppercase no-underline transition-colors duration-75 hover:text-white/55"
							>
								{project.link.replace('https://', '')} ↗
							</a>
						{:else if project.github}
							<a
								href={project.github}
								target="_blank"
								rel="noopener noreferrer"
								class="font-sans text-[11px] tracking-[0.1em] text-dim uppercase no-underline transition-colors duration-75 hover:text-white/55"
							>
								github ↗
							</a>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</main>
</div>
