export interface Writing {
	title: string;
	longTitle?: string;
	date: string;
	snippet: string;
	file: string;
}

interface MdModule {
	metadata: Omit<Writing, 'file'>;
}

const writings = import.meta.glob('/src/routes/writing/*/+page.md', { eager: true });

export const recentWritings = Object.entries(writings)
	.map(([path, module]) => {
		const parts = path.split('/');
		const file = parts[parts.length - 2];
		const metadata = (module as MdModule).metadata;

		return {
			...metadata,
			file
		};
	})
	.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
