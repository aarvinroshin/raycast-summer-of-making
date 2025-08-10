import { LocalStorage as Storage } from "@raycast/api";
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
				const cookie = await Storage.getItem("cookie");
				const res = await fetch(`https://summer.hackclub.com/api/v1/users/${userId}`, {
					headers: { Cookie: cookie as string },
				});
				if (!res.ok) {
					if (!cancelled) setValue(slackId);
					return;
				}
				const json: any = await res.json();
				const name: string | undefined = json?.user?.display_name ?? json?.display_name ?? slackId;
				if (!cancelled) {
					if (name) cache.set(userId, name);
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
