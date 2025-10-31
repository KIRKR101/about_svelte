import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';

export const prerender = true;

interface Post {
    file: string;
    title: string;
    date: string;
    snippet: string;
}

export async function load() {
  try {
    const manifestPath = join('static', 'posts', 'manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf8');
    const posts: Post[] = JSON.parse(manifestContent);
    return {
      posts: posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  } catch (err) {
    throw error(500, err instanceof Error ? err.message : 'Failed to load posts');
  }
}
