import { DEFAULT_LIST_TTL, fetchJSONCached, getCookieCached, getListPage, setListPage } from "../utils/cache";

import { usePromise } from "@raycast/utils";

export type Devlog = {
	id: number;
	text: string;
	attachment: string | null;
	project_id: number;
	slack_id: string;
	created_at: string;
	updated_at: string;
};
export const useDevlogs = () => {
	const { isLoading, data, pagination } = usePromise(
		() =>
		async (options: { page: number }): Promise<{
			data: Devlog[];
			hasMore: boolean;
		}> => {
			const cookie = await getCookieCached();

			const target = Math.max(0, options.page);

			const cached = await getListPage<Devlog>("devlogs", target);
			if (cached) {
				if (cached.hasMore) {
					const next = target + 1;
					fetchJSONCached<{ devlogs: readonly Devlog[]; pagination: any }>(
						`https://summer.hackclub.com/api/v1/devlogs?page=${next + 1}`,
						{ headers: { Cookie: (cookie ?? "") as string } },
						30_000,
					).then(({ devlogs, pagination }) => {
						const hasMore = (pagination?.page ?? next + 1) < (pagination?.pages ?? next + 1);
						setListPage("devlogs", next, { data: devlogs as Devlog[], hasMore }, DEFAULT_LIST_TTL).catch(() => {});
					}).catch(() => {});
				}
				return cached;
			}

			const { devlogs, pagination: info } = await fetchJSONCached<{ devlogs: readonly Devlog[]; pagination: any }>(
				`https://summer.hackclub.com/api/v1/devlogs?page=${target + 1}`,
				{ headers: { Cookie: (cookie ?? "") as string } },
				30_000,
			);
			const pageInfo = info as {
				pagination: {
					count?: number;
					items?: number;
					page: number;
					pages: number;
				};
			}["pagination"];
			const result = {
				data: devlogs as Devlog[],
				hasMore: pageInfo.page < pageInfo.pages,
			};
			setListPage("devlogs", target, result, DEFAULT_LIST_TTL).catch(() => {});
			if (result.hasMore) {
				const next = target + 1;
				fetchJSONCached<{ devlogs: readonly Devlog[]; pagination: any }>(
					`https://summer.hackclub.com/api/v1/devlogs?page=${next + 1}`,
					{ headers: { Cookie: (cookie ?? "") as string } },
					30_000,
				).then(({ devlogs, pagination }) => {
					const hasMore = (pagination?.page ?? next + 1) < (pagination?.pages ?? next + 1);
					setListPage("devlogs", next, { data: devlogs as Devlog[], hasMore }, DEFAULT_LIST_TTL).catch(() => {});
				}).catch(() => {});
			}
			return result;
		},
	);
	return {
		loading: isLoading,
		pagination,
		devlogs: data as readonly Devlog[],
	};
};
