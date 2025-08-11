import { DEFAULT_ENTITY_TTL, fetchJSONCached, getCookieCached, getEntity, setEntity } from "../utils/cache";

import { useEffect, useState } from "react";

const cache = new Map<number, string>();
export const useUser = (userId: number, slackId?: string) => {
	const [value, setValue] = useState<string | undefined>(slackId);
	useEffect(() => {
		if (!userId) {
			setValue(slackId);
			return;
		}

		const cached = cache.get(userId);
		if (cached) {
			setValue(cached);
			return;
		}

		let cancelled = false;
		(async () => {
			try {
				const persisted = await getEntity<string>("user", userId);
				if (persisted) {
					cache.set(userId, persisted);
					if (!cancelled) setValue(persisted);
					return;
				}
				const cookie = await getCookieCached();
				const json: any = await fetchJSONCached(
					`https://summer.hackclub.com/api/v1/users/${userId}`,
					{ headers: { Cookie: (cookie ?? "") as string } },
					2 * 60_000,
				);
				const name: string | undefined = json?.user?.display_name ?? json?.display_name ?? slackId;
				if (!cancelled) {
					if (name) cache.set(userId, name);
					if (name) setEntity("user", userId, name, DEFAULT_ENTITY_TTL).catch(() => {});
					setValue(name ?? slackId);
				}
			} catch {
				if (!cancelled) setValue(slackId);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [userId, slackId]);
	return value;
};
