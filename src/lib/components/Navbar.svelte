<script lang="ts">
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { browser } from '$app/environment';

  let isMobileMenuOpen = false;
  let mounted = false;
  let mobileMenuRef: HTMLDivElement;
  let mobileMenuTriggerRef: HTMLButtonElement;

  // Prevent hydration errors
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
      // Focus first focusable element
      setTimeout(() => {
        const focusableElements = mobileMenuRef?.querySelectorAll(
          'a[href], button:not([disabled])'
        );
        if (focusableElements && focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
    }
  }

  // Reactive function that re-evaluates when pathname changes
  $: isActive = (path: string) => $page.url.pathname === path;

  // Reactive function for link classes
  $: getLinkClassName = (path: string) =>
    `block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
      isActive(path)
        ? 'text-[var(--text-color)] dark:bg-[var(--card-bg-color)] bg-[var(--button-hover-bg-color)]'
        : 'text-[var(--subtle-text-color)] hover:text-[var(--text-color)]'
    }`;
  
  // Helper for desktop links
  $: getDesktopLinkClassName = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
      isActive(path)
        ? 'text-[var(--text-color)] dark:bg-[var(--card-bg-color)] bg-[var(--button-hover-bg-color)]'
        : 'text-[var(--subtle-text-color)] hover:text-[var(--text-color)]'
    }`;
</script>

<nav
  aria-label="Main navigation"
  class="border-b border-border fixed top-0 left-0 right-0 z-50 h-16 bg-(--bg-color)/80 backdrop-blur-sm"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
    <div class="flex justify-between items-center h-full">
      <!-- Left section: Logo and Desktop Links -->
      <div class="flex items-center gap-6">
        <a
          href="/"
          class="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <span class="text-foreground text-xl font-bold relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-current before:scale-x-0 before:transform before:transition-transform before:duration-300 before:ease-in-out before:origin-left hover:before:scale-x-100">
            kirkr.xyz
          </span>
        </a>
        <nav class="hidden md:flex items-center gap-4" aria-label="Desktop navigation">
          <a 
            href="/posts" 
            class={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${isActive('/posts') ? 'text-(--text-color) dark:bg-(--card-bg-color) bg-(--button-hover-bg-color)' : 'text-(--subtle-text-color) hover:text-(--text-color)'}`}
          >
            Posts
          </a>
          <a 
            href="/projects" 
            class={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${isActive('/projects') ? 'text-(--text-color) dark:bg-(--card-bg-color) bg-(--button-hover-bg-color)' : 'text-(--subtle-text-color) hover:text-(--text-color)'}`}
          >
            Projects
          </a>
          <a 
            href="/films" 
            class={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${isActive('/films') ? 'text-(--text-color) dark:bg-(--card-bg-color) bg-(--button-hover-bg-color)' : 'text-(--subtle-text-color) hover:text-(--text-color)'}`}
          >
            Films
          </a>
          <a 
            href="/art" 
            class={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${isActive('/art') ? 'text-(--text-color) dark:bg-(--card-bg-color) bg-(--button-hover-bg-color)' : 'text-(--subtle-text-color) hover:text-(--text-color)'}`}
          >
            Art
          </a>
        </nav>
      </div>

      <!-- Right section: Mobile Toggle, Theme -->
      <div class="flex items-center gap-3">
        <!-- Mobile Menu Button - md:hidden -->
        <div class="md:hidden">
          <button
            bind:this={mobileMenuTriggerRef}
            on:click={toggleMobileMenu}
            class="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            aria-label="Toggle main navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu-overlay"
          >
            {#if isMobileMenuOpen}
              <svg 
                aria-hidden="true"
                class="h-5 w-5 text-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            {:else}
              <svg 
                aria-hidden="true"
                class="h-5 w-5 text-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            {/if}
          </button>
        </div>

        <!-- Theme Toggle Button -->
        {#if mounted}
          <button
            on:click={toggleTheme}
            class="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            aria-label={$theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={$theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {#if $theme === 'light'}
              <svg 
                aria-hidden="true"
                class="h-4 w-4 text-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            {:else}
              <svg 
                aria-hidden="true"
                class="h-4 w-4 text-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-1.114 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            {/if}
          </button>
        {:else}
          <div class="h-9 w-9"></div>
        {/if}
      </div>
    </div>
  </div>
</nav>

<!-- Mobile Menu Overlay -->
<div
  on:click={() => (isMobileMenuOpen = false)}
  on:keydown={(e) => e.key === 'Enter' && (isMobileMenuOpen = false)}
  role="button"
  tabindex="-1"
  class={`fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ease-in-out ${
    isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`}
  aria-hidden="true"
></div>

<!-- Menu Content - Slides in from the right -->
<div
  bind:this={mobileMenuRef}
  id="mobile-menu-overlay"
  class={`fixed top-16 bottom-0 right-0 z-40 w-64 bg-background shadow-xl md:hidden transition-transform duration-300 ease-in-out transform flex flex-col border-l border-border ${
    isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
  }`}
  role="dialog"
  aria-modal="true"
  aria-labelledby="mobile-menu-heading"
>
  <div class="flex justify-between items-center p-4 border-b border-border">
    <h2
      id="mobile-menu-heading"
      class="text-lg font-semibold text-foreground"
    >
      Menu
    </h2>
  </div>

  <!-- Menu Links -->
  <nav class="grow p-4" aria-label="Mobile navigation">
    <ul class="space-y-2">
      <li>
        <a
          href="/"
          on:click={handleMobileLinkClick}
          class={getLinkClassName('/')}
        >
          Home
        </a>
      </li>
      <li>
        <a
          href="/posts"
          on:click={handleMobileLinkClick}
          class={getLinkClassName('/posts')}
        >
          Posts
        </a>
      </li>
      <li>
        <a
          href="/projects"
          on:click={handleMobileLinkClick}
          class={getLinkClassName('/projects')}
        >
          Projects
        </a>
      </li>
      <li>
        <a
          href="/films"
          on:click={handleMobileLinkClick}
          class={getLinkClassName('/films')}
        >
          Films
        </a>
      </li>
      <li>
        <a
          href="/art"
          on:click={handleMobileLinkClick}
          class={getLinkClassName('/art')}
        >
          Art
        </a>
      </li>
    </ul>
  </nav>
</div>