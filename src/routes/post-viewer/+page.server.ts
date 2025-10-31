import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';

export const prerender = false;

export async function load({ url }) {
  const postName = url.searchParams.get('name');

  if (!postName) {
    throw error(400, 'No post specified');
  }

  try {
    // Fetch manifest
    const manifestPath = join('static', 'posts', 'manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    const postMeta = manifest.find((p: any) => p.file === postName);

    // Fetch markdown content
    const postPath = join('static', 'posts', `${postName}.md`);
    const markdownContent = readFileSync(postPath, 'utf8');

    return {
      meta: postMeta,
      content: markdownContent
    };
  } catch (err) {
    throw error(404, 'Post not found');
  }
}
