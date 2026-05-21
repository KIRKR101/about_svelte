export interface CardPosition {
	id: string;
	left: number;
	top: number;
}

export function computeVisualOrder(positions: CardPosition[], columnTolerance = 10): string[] {
	if (positions.length === 0) return [];

	const lefts = [...new Set(positions.map((p) => Math.round(p.left)))].sort((a, b) => a - b);
	if (lefts.length === 0) return [];

	const columns: { id: string; top: number }[][] = lefts.map(() => []);

	for (const pos of positions) {
		let colIdx = lefts.findIndex((l) => Math.abs(l - Math.round(pos.left)) <= columnTolerance);
		if (colIdx === -1) colIdx = 0;

		const targetCol = columns[colIdx];
		if (targetCol) {
			targetCol.push({ id: pos.id, top: pos.top });
		}
	}

	for (const col of columns) col.sort((a, b) => a.top - b.top);

	const result: string[] = [];
	const maxLen = Math.max(0, ...columns.map((c) => c.length));

	for (let row = 0; row < maxLen; row++) {
		for (const col of columns) {
			const item = col[row];
			if (item) {
				result.push(item.id);
			}
		}
	}

	return result;
}
