<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		title,
		visible,
		onClose,
		children
	}: {
		title: string;
		visible: boolean;
		onClose: () => void;
		children: import('svelte').Snippet;
	} = $props();
</script>

{#if visible}
	<div in:fade={{ duration: 200 }} class="space-y-4 border border-white/10 bg-white/2.5 p-6">
		<div class="mb-1 flex items-start justify-between gap-4">
			<span class="font-mono text-[10px] tracking-[0.25em] text-white/25 uppercase">{title}</span>
			<button
				onclick={onClose}
				class="mt-0.5 cursor-pointer text-xs leading-none text-white/20 transition-colors hover:text-white/60"
			>
				✕
			</button>
		</div>
		<div class="space-y-3 font-sans text-[13px] leading-relaxed text-white/50">
			{@render children()}
		</div>
	</div>
{/if}
