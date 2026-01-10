import { recentPosts } from '$lib/posts-data';

export const prerender = true;

export async function load() {
  // Sort posts by date (newest first) and return top 5
  const sortedPosts = recentPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    recentPosts: sortedPosts
  };
}
