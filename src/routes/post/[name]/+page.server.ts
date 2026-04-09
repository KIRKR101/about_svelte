import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import { recentPosts } from '$lib/posts-data';

export const prerender = true;

export function entries() {
	return recentPosts.map((post) => ({
		name: post.file
	}));
}

export function load({ params }: { params: { name: string } }) {
	const post = recentPosts.find((p) => p.file === params.name);

	if (!post) {
		throw error(404, 'Post not found');
	}

	try {
		const postPath = join('static', 'posts', `${params.name}.md`);
		let markdownContent = readFileSync(postPath, 'utf8');

		markdownContent = markdownContent.replace(
			/!\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g,
			(_, file, alt) => `![${alt ?? ''}](posts/${file})`
		);

		markdownContent = markdownContent.replace(
			/^!\[([^\]]*)\]\((posts\/[^)]+\.svg)\)$/gm,
			(match, _alt, src) => {
				const fileName = src.replace('posts/', '');
				try {
					const svgPath = join('static', 'posts', fileName);
					const svgContent = readFileSync(svgPath, 'utf8');
					const altText = _alt ?? '';
					return `<div class="svg-container mb-2" role="img" aria-label="${altText}">${svgContent}</div>\n\n`;
				} catch (err) {
					console.error(`Error loading SVG ${fileName}:`, err);
					return match;
				}
			}
		);

		return {
			meta: post,
			content: markdownContent
		};
	} catch {
		throw error(404, 'Post not found');
	}
}
