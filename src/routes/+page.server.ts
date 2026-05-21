import { recentPosts } from '$lib/posts-data';

export const prerender = true;

export function load() {
	const sortedPosts = [...recentPosts]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 5);

	return {
		recentPosts: sortedPosts
	};
}
