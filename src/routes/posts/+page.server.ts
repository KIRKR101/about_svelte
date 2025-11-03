import { error } from '@sveltejs/kit';

export const prerender = true;

interface Post {
  file: string;
  title: string;
  date: string;
  snippet: string;
}

export async function load({ fetch }) {
  const res = await fetch('/posts/manifest.json');

  if (!res.ok) {
    throw error(res.status, `Failed to load posts (status ${res.status})`);
  }

  const posts: Post[] = await res.json();

  return {
    posts: posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  };
}
