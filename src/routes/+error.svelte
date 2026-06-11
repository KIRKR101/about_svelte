<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.status} | kirkr.xyz</title>
</svelte:head>

<div class="flex min-h-full flex-col items-center justify-start px-6 pt-[20vh] lg:pt-[24vh]">
	<main class="w-full max-w-[600px] pl-6 md:pl-10">
		<div class="font-sans text-[10px] tracking-[0.15em] text-muted uppercase">
			Error {$page.status}
		</div>
		<div class="mt-3 font-serif text-[26px] leading-tight text-white/85 italic">
			{$page.error?.message || 'Page not found'}
		</div>
		<div class="mt-4 font-sans text-[14px] leading-[1.7] text-white/70">
			The page you're looking for doesn't exist or has been moved.
		</div>
		<div class="mt-6">
			<a
				href="/"
				class="font-sans text-[10px] tracking-[0.15em] text-muted uppercase no-underline transition-colors hover:text-white/60"
			>
				Return home
			</a>
		</div>
	</main>
</div>
