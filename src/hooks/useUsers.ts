import { DEFAULT_LIST_TTL, fetchJSONCached, getCookieCached, getListPage, setListPage } from "../utils/cache";

import { usePromise } from "@raycast/utils";

type UserBadge = {
	name: string;
	text: string;
	icon: string;
};
type UserProject = {
	id: number;
	title: string;
	devlogs_count: number;
	created_at: string;
};
type User = {
	id: number;
	slack_id: string;
	display_name: string;
	bio: string | null;
	projects_count: number;
	devlogs_count: number;
	votes_count: number;
	ships_count: number;
	projects: readonly UserProject[];
	coding_time_seconds: number;
	coding_time_seconds_today: number;
	balance: string;
	badges: readonly UserBadge[];
	created_at: string;
	updated_at: string;
	avatar: string | null;
	custom_css: string | null;
};
export const useUsers = () => {
	const { isLoading, data, pagination } = usePromise(
		() =>
		async (options: { page: number }): Promise<{
			data: User[];
			hasMore: boolean;
		}> => {
			const cookie = await getCookieCached();

			const target = Math.max(0, options.page);

			const cached = await getListPage<User>("users", target);
			if (cached) {
				if (cached.hasMore) {
					const next = target + 1;
					fetchJSONCached<{ users: readonly User[]; pagination: any }>(
						`https://summer.hackclub.com/api/v1/users?page=${next + 1}`,
						{ headers: { Cookie: (cookie ?? "") as string } },
						30_000,
					).then(({ users, pagination }) => {
						const hasMore = (pagination?.page ?? next + 1) < (pagination?.pages ?? next + 1);
						setListPage("users", next, { data: users as User[], hasMore }, DEFAULT_LIST_TTL).catch(() => {});
					}).catch(() => {});
				}
				return cached;
			}

			const { users, pagination: info } = await fetchJSONCached<{ users: readonly User[]; pagination: any }>(
				`https://summer.hackclub.com/api/v1/users?page=${target + 1}`,
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
				data: users as User[],
				hasMore: pageInfo.page < pageInfo.pages,
			};
			setListPage("users", target, result, DEFAULT_LIST_TTL).catch(() => {});
			if (result.hasMore) {
				const next = target + 1;
				fetchJSONCached<{ users: readonly User[]; pagination: any }>(
					`https://summer.hackclub.com/api/v1/users?page=${next + 1}`,
					{ headers: { Cookie: (cookie ?? "") as string } },
					30_000,
				).then(({ users, pagination }) => {
					const hasMore = (pagination?.page ?? next + 1) < (pagination?.pages ?? next + 1);
					setListPage("users", next, { data: users as User[], hasMore }, DEFAULT_LIST_TTL).catch(() => {});
				}).catch(() => {});
			}
			return result;
		},
	);
	return {
		loading: isLoading,
		pagination,
		users: data as readonly User[],
	};
};
