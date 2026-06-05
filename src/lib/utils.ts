const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
const shortDateFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric' });

export function formatDate(dateString: string) {
	return dateFormatter.format(new Date(dateString));
}

export function formatShortDate(dateString: string) {
	return shortDateFormatter.format(new Date(dateString));
}

export function getMetaValue(
	data: Array<[string, string] | string[]>,
	key: string
): string | undefined {
	return data.find(([k]) => k === key)?.[1];
}

export function getContributionColor(count: number) {
	if (count === 0) return '#1a1a1c';
	if (count < 5) return '#0e4429';
	if (count < 10) return '#006d32';
	if (count < 20) return '#26a641';
	return '#39d353';
}

const IIIF_WIDTHS: readonly number[] = [500, 800, 1200, 1600];

export function isIiifUrl(url: string): boolean {
	return /\/\d+,?\/0\/default\.(webp|jpg)$/.test(url);
}

export function getIiifSrcset(url: string): string {
	if (!isIiifUrl(url)) return '';
	return IIIF_WIDTHS.map((w: number) =>
		url.replace(/\/\d+,?\/0\/default/, `/${w},/0/default`)
	).join(', ');
}
