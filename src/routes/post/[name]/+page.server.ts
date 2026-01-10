import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import { recentPosts } from '$lib/posts-data';

export const prerender = true;

// Tell SvelteKit all possible routes to generate at build time
export function entries() {
  return recentPosts.map(post => ({
    name: post.file
  }));
}

// Load the post data
export function load({ params }: { params: { name: string } }) {
  const post = recentPosts.find(p => p.file === params.name);

  if (!post) {
    throw error(404, 'Post not found');
  }

  try {
    // Fetch markdown content
    const postPath = join('static', 'posts', `${params.name}.md`);
    let markdownContent = readFileSync(postPath, 'utf8');

    // Process wikilinks ![[file]] to standard markdown images
    markdownContent = markdownContent.replace(/!\[\[([^\]]+)\]\]/g, '![](posts/$1)');

    // Inline SVG files - replace standalone SVG image lines
    markdownContent = markdownContent.replace(/^!\[([^\]]*)\]\((posts\/[^)]+\.svg)\)$/gm, (match, alt, src) => {
      const fileName = src.replace('posts/', '');
      try {
        const svgPath = join('static', 'posts', fileName);
        const svgContent = readFileSync(svgPath, 'utf8');
        return `<div class="svg-container">${svgContent}</div>\n\n`;
      } catch (err) {
        console.error(`Error loading SVG ${fileName}:`, err);
        return match; // Return original markdown if SVG loading fails
      }
    });

    return {
      meta: post,
      content: markdownContent
    };
  } catch (err) {
    throw error(404, 'Post not found');
  }
}
