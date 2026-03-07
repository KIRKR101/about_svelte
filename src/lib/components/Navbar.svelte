<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let mounted = false;
  let menuOpen = false;

  onMount(() => {
    mounted = true;
  });

  $: isActive = (path: string) => {
    if (path === '/') return $page.url.pathname === '/';
    return $page.url.pathname.startsWith(path);
  };

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
  class="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a0a0b]/80 backdrop-blur-sm border-b border-bd"
>
  <div class="max-w-[1200px] mx-auto px-4 md:px-6 h-full">
    <div class="flex items-center justify-between h-full">
      
      <div class="flex items-center">
        <a href="/" class="group focus:outline-none">
          <span class="font-serif text-[24px] md:text-[28px] leading-none tracking-[-1px] text-white">
            <span class="opacity-90">kirkr</span><span class="opacity-20"><em class="not-italic italic">.</em>xyz</span>
          </span>
        </a>
      </div>

      <nav class="hidden md:flex items-center gap-8 h-full" aria-label="Desktop navigation">
        {#each navLinks as link}
          <a 
            href={link.path} 
            class="font-mono text-[11px] tracking-[0.1em] transition-colors duration-75 uppercase
            {isActive(link.path) 
              ? 'text-white/80' 
              : 'text-dim hover:text-white/60'}"
          >
            {link.name}
          </a>
        {/each}
      </nav>

      <!-- Mobile hamburger menu -->
      <div class="md:hidden flex items-center">
        <button
          on:click={toggleMenu}
          class="w-10 h-10 flex items-center justify-center"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg class="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            {#if menuOpen}
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            {/if}
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile menu dropdown -->
  {#if menuOpen}
    <div class="md:hidden absolute top-16 left-0 right-0 bg-[#0a0a0b] border-b border-bd">
      <div class="flex flex-col py-4">
        {#each navLinks as link}
          <a 
            href={link.path} 
            on:click={closeMenu}
            class="font-mono text-[11px] tracking-[0.1em] px-6 py-3 transition-colors duration-75 lowercase
            {isActive(link.path) 
              ? 'text-white/80 bg-white/5' 
              : 'text-dim hover:text-white/60 hover:bg-white/5'}"
          >
            {link.name}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</nav>
