import { DEFAULT_ENTITY_TTL, fetchJSONCached, getCookieCached, getEntity, setEntity } from "../utils/cache";

import { useEffect, useState } from "react";

const cache = new Map<number, { title: string; user_id?: number; slack_id?: string }>();

export const useProject = (projectId: number) => {
	const [value, setValue] = useState<{ title?: string; user_id?: number; slack_id?: string }>({});
	useEffect(() => {
		if (!projectId) {
			setValue({});
			return;
		}

		const cached = cache.get(projectId);
		if (cached) {
			setValue(cached);
			return;
		}

		let cancelled = false;
		(async () => {
			try {
				const persisted = await getEntity<{ title?: string; user_id?: number; slack_id?: string }>(
					"project",
					projectId,
				);
				if (persisted) {
					cache.set(projectId, persisted as any);
					if (!cancelled) setValue(persisted);
					return;
				}
				const cookie = await getCookieCached();
				const json: any = await fetchJSONCached(
					`https://summer.hackclub.com/api/v1/projects/${projectId}`,
					{ headers: { Cookie: (cookie ?? "") as string } },
					2 * 60_000,
				);
				const title: string | undefined = json?.project?.title ?? json?.title;
				const user_id: number | undefined = json?.project?.user_id ?? json?.user_id;
				const slack_id: string | undefined = json?.project?.slack_id ?? json?.slack_id;
				const data = { title: title ?? undefined, user_id, slack_id };
				if (!cancelled) {
					if (title) cache.set(projectId, data as { title: string; user_id?: number; slack_id?: string });
					if (title) setEntity("project", projectId, data, DEFAULT_ENTITY_TTL).catch(() => {});
					setValue(data);
				}
			} catch {
				if (!cancelled) setValue({});
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [projectId]);
	return value;
};
