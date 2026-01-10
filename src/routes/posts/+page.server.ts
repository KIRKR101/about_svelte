import { recentPosts } from '$lib/posts-data';

export const prerender = true;

export function load() {
  return {
    posts: recentPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  };
}
