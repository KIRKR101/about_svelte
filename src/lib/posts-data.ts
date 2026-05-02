export interface Post {
	title: string;
	longTitle?: string;
	date: string;
	snippet: string;
	file: string;
}

const posts = import.meta.glob('/src/routes/post/*/+page.md', { eager: true });

export const recentPosts = Object.entries(posts)
	.map(([path, module]) => {
		const parts = path.split('/');
		const file = parts[parts.length - 2];
		const metadata = (module as any).metadata as Omit<Post, 'file'>;

		return {
			...metadata,
			file
		};
	})
	.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
