import { readFileSync } from 'fs';
import { join } from 'path';

export const prerender = true;

function fetchRecentPosts() {
  try {
    // Read from static files at build time
    const manifestPath = join('static', 'posts', 'manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf8');
    const posts = JSON.parse(manifestContent);

    // Sort posts by date (newest first) and return top 5
    return posts
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching posts manifest:', error);
    return null;
  }
}

export async function load() {
  const [recentPosts] = await Promise.all([
    Promise.resolve(fetchRecentPosts())
  ]);

  return {
    recentPosts
  };
}
