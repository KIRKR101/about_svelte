import { recentPosts } from '$lib/posts-data';

export const prerender = true;

export function load() {
	return {
		allPosts: recentPosts
	};
}
