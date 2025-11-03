import manifest from '$lib/manifest.js';

export const prerender = true;

export function load() {
  return {
    posts: manifest.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  };
}
