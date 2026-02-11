<script lang="ts">
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { browser } from '$app/environment';

  let isMobileMenuOpen = false;
  let mounted = false;
  let mobileMenuRef: HTMLDivElement;
  let mobileMenuTriggerRef: HTMLButtonElement;

  onMount(() => {
    mounted = true;
  });

  const toggleMobileMenu = () => {
    isMobileMenuOpen = !isMobileMenuOpen;
  };

  const handleMobileLinkClick = () => {
    isMobileMenuOpen = false;
  };

  const toggleTheme = () => {
    theme.update((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
    if (browser) {
      const newTheme = $theme;
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('theme', newTheme);
    }
  };

  const handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isMobileMenuOpen) {
      isMobileMenuOpen = false;
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      isMobileMenuOpen &&
      mobileMenuRef &&
      !mobileMenuRef.contains(event.target as Node) &&
      mobileMenuTriggerRef &&
      !mobileMenuTriggerRef.contains(event.target as Node)
    ) {
      isMobileMenuOpen = false;
    }
  };

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleEscKey);
      window.addEventListener('mousedown', handleClickOutside);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleEscKey);
      window.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    }
  });

  $: if (browser && typeof document !== 'undefined') {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

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
</script>

<nav
  aria-label="Main navigation"
  class="fixed top-0 left-0 right-0 z-50 h-20 bg-[#FAF9F6] dark:bg-[#121214] border-b border-[#1A1A1A] dark:border-[#444448]"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
    <div class="flex items-center h-full w-full">
      
      <div class="flex-1 flex items-center justify-start">
        <a
          href="/"
          class="group flex items-center space-x-1 focus:outline-none"
        >
          <span class="font-display font-extrabold text-3xl tracking-tight text-[#1A1A1A] dark:text-[#EEEEEE]">
            kirkr<span class="text-[#FF4D00]">.</span><span class="ml-[0.2ch] text-zinc-400 dark:text-[#444448] italic font-serif text-2xl tracking-normal">xyz</span>
          </span>
        </a>
      </div>

      <nav class="hidden md:flex items-center justify-center gap-6 h-full" aria-label="Desktop navigation">
        {#each navLinks as link}
          <a 
            href={link.path} 
            class="px-2 h-full flex items-center font-mono text-xs uppercase tracking-widest font-bold transition-all duration-50
            {isActive(link.path) 
              ? 'text-[#FF4D00] border-b-2 border-[#FF4D00]' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-[#1A1A1A] hover:underline dark:hover:text-white'}"
          >
            {link.name}
          </a>
        {/each}
      </nav>

      <div class="flex-1 flex items-center justify-end gap-4">
        {#if mounted}
          <button
            on:click={toggleTheme}
            class="w-10 h-10 flex items-center justify-center border-[1.5px] cursor-pointer border-[#1A1A1A] dark:border-[#444448] bg-[#FAF9F6] dark:bg-[#1E1E22] shadow-[2px_2px_0px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_0px_#000000] 
            hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_0px_#FF4D00] hover:scale-105
            active:translate-y-[1px] active:translate-x-[1px] active:shadow-[0px_0px_0px_0px_#1A1A1A] active:scale-95
            transition-all duration-150 ease-out group"
            aria-label={$theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {#if $theme === 'light'}
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="square" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            {:else}
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="square" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-1.114 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            {/if}
          </button>
        {:else}
          <div class="w-10 h-10 border-2 border-[#1A1A1A] dark:border-[#444448]"></div>
        {/if}

        <div class="md:hidden">
          <button
            bind:this={mobileMenuTriggerRef}
            on:click={toggleMobileMenu}
            class="w-10 h-10 flex items-center justify-center border-2 border-[#1A1A1A] dark:border-[#444448] bg-[#FAF9F6] dark:bg-[#1E1E22] shadow-[2px_2px_0px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_0px_#000000] hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_#FF4D00] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_0px_#1A1A1A] transition-all"
            aria-label="Toggle menu"
          >
            {#if isMobileMenuOpen}
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="square" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            {:else}
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="square" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
</nav>

{#if isMobileMenuOpen}
<div
  on:click={() => (isMobileMenuOpen = false)}
  on:keydown={(e) => e.key === 'Enter' && (isMobileMenuOpen = false)}
  role="button"
  tabindex="-1"
  class="fixed inset-0 backdrop-blur-xs bg-[#F2F0E9]/50 dark:bg-[#121214]/50 z-[60] md:hidden"
  aria-hidden="true"
>
  <div
    bind:this={mobileMenuRef}
    role="dialog"
    aria-modal="true"
    aria-label="Mobile navigation menu"
    tabindex="-1"
    class="absolute top-0 right-0 h-full w-full max-w-xs bg-[#FAF9F6] dark:bg-[#1E1E22] border-l-4 border-[#1A1A1A] dark:border-[#444448] p-8 flex flex-col gap-8"
    on:click|stopPropagation
    on:keydown={(e) => {
      if (e.key === 'Escape') {
        isMobileMenuOpen = false;
      }
    }}
  >
    <div class="flex justify-between items-center mb-4">
      <span class="font-display font-extrabold text-2xl tracking-tighter text-[#1A1A1A] dark:text-[#EEEEEE]">
        MENU<span class="text-[#FF4D00]">.</span>
      </span>
      <button on:click={() => (isMobileMenuOpen = false)} class="text-zinc-500" aria-label="Close menu">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <nav class="flex flex-col gap-4">
      <a
        href="/"
        on:click={handleMobileLinkClick}
        class="font-mono text-lg uppercase tracking-widest font-bold p-4 border-2 border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_#000000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all
        {isActive('/') ? 'bg-[#FF4D00] text-white border-[#FF4D00]' : 'bg-white dark:bg-zinc-900 text-[#1A1A1A] dark:text-white'}"
      >
        Home
      </a>
      {#each navLinks as link}
        <a
          href={link.path}
          on:click={handleMobileLinkClick}
          class="font-mono text-lg uppercase tracking-widest font-bold p-4 border-2 border-[#1A1A1A] dark:border-[#444448] shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_#000000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all
          {isActive(link.path) ? 'bg-[#FF4D00] text-white border-[#FF4D00]' : 'bg-white dark:bg-zinc-900 text-[#1A1A1A] dark:text-white'}"
        >
          {link.name}
        </a>
      {/each}
    </nav>
  </div>
</div>
{/if}
