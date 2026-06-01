import { artData } from '$lib/art-data';
import { deHoochBibliography } from '$lib/bibliography';

export const prerender = true;

export function load() {
	const entries = Object.entries(artData).map(([id, artwork]) => ({
		id,
		title: artwork.title,
		thumbnail: artwork.thumbnail,
		image: artwork.image,
		description: artwork.description,
		aspectRatio: artwork.aspectRatio,
		data: artwork.data
	}));

	const sortedBibliography = [...deHoochBibliography].sort((a, b) => {
		const aHas = a.description ? 1 : 0;
		const bHas = b.description ? 1 : 0;
		return bHas - aHas;
	});

	return {
		entries,
		bibliography: sortedBibliography
	};
}
