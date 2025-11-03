import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import manifest from '$lib/manifest.js';

export const prerender = true;

// Tell SvelteKit all possible routes to generate at build time
export function entries() {
  return manifest.map(post => ({
    name: post.file
  }));
}

// Load the post data
export function load({ params }: { params: { name: string } }) {
  const post = manifest.find(p => p.file === params.name);

  if (!post) {
    throw error(404, 'Post not found');
  }

  try {
    // Fetch markdown content
    const postPath = join('static', 'posts', `${params.name}.md`);
    const markdownContent = readFileSync(postPath, 'utf8');

    return {
      meta: post,
      content: markdownContent
    };
  } catch (err) {
    throw error(404, 'Post not found');
  }
}
