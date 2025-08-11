const memo = new Map<number, string>();
export const useTime = (time: number): string => {
	const t = Math.floor(time);
	const existing = memo.get(t);
	if (existing) return existing;

	const h = Math.floor(t / 3600);
	const m = Math.floor((t % 3600) / 60);

	const parts = [h ? `${h} hours` : null, m ? `${m} minutes` : null].filter(Boolean) as string[];
	const out = parts.length ? parts.join(" ") : "None";
	memo.set(t, out);
	return out;
};
