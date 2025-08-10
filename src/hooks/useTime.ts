export const useTime = (time: number): string => {
	const t = Math.floor(time);
	const h = Math.floor(t / 3600);
	const m = Math.floor((t % 3600) / 60);

	const parts = [
		h ? `${h} hours` : null,
		m ? `${m} minutes` : null,
	].filter(Boolean) as string[];

	return parts.length ? parts.join(" ") : "None";
};
