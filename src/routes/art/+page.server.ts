import { artData } from '$lib/art-data';

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

	return { entries };
}
