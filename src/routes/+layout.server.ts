import { recentWritings } from '$lib/writings-data';

export const prerender = true;

export function load() {
	return {
		allWritings: recentWritings
	};
}
