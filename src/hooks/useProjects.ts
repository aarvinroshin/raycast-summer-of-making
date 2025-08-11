import { DEFAULT_LIST_TTL, fetchJSONCached, getCookieCached, getListPage, setListPage } from "../utils/cache";

import { usePromise } from "@raycast/utils";

type Follower = {
	id: number;
	name: string;
};
type Project = {
	banner: null | string;
	category: null | string;
	created_at: string;
	demo_link: string;
	description: string;
	devlogs: readonly number[];
	devlogs_count: number;
	followers: readonly Follower[];
	id: number;
	is_shipped: boolean;
	readme_link: string;
	repo_link: string;
	slack_id: string;
	title: string;
	total_seconds_coded: number;
	updated_at: string;
	user_id: number;
	x: null | number;
	y: null | number;
};
export const useProjects = () => {
	const { isLoading, data, pagination } = usePromise(
		() =>
		async (options: { page: number }): Promise<{
			data: Project[];
			hasMore: boolean;
		}> => {
			const cookie = await getCookieCached();

			const target = Math.max(0, options.page);

			const cached = await getListPage<Project>("projects", target);
			if (cached) {
				if (cached.hasMore) {
					const next = target + 1;
					fetchJSONCached<{ projects: readonly Project[]; pagination: any }>(
						`https://summer.hackclub.com/api/v1/projects?page=${next + 1}`,
						{ headers: { Cookie: (cookie ?? "") as string } },
						30_000,
					).then(({ projects, pagination }) => {
						const hasMore = (pagination?.page ?? next + 1) < (pagination?.pages ?? next + 1);
						setListPage("projects", next, { data: projects as Project[], hasMore }, DEFAULT_LIST_TTL).catch(() => {});
					}).catch(() => {});
				}
				return cached;
			}

			const { projects, pagination: info } = await fetchJSONCached<{ projects: readonly Project[]; pagination: any }>(
				`https://summer.hackclub.com/api/v1/projects?page=${target + 1}`,
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
				data: projects as Project[],
				hasMore: pageInfo.page < pageInfo.pages,
			};
			setListPage("projects", target, result, DEFAULT_LIST_TTL).catch(() => {});
			if (result.hasMore) {
				const next = target + 1;
				fetchJSONCached<{ projects: readonly Project[]; pagination: any }>(
					`https://summer.hackclub.com/api/v1/projects?page=${next + 1}`,
					{ headers: { Cookie: (cookie ?? "") as string } },
					30_000,
				).then(({ projects, pagination }) => {
					const hasMore = (pagination?.page ?? next + 1) < (pagination?.pages ?? next + 1);
					setListPage("projects", next, { data: projects as Project[], hasMore }, DEFAULT_LIST_TTL).catch(() => {});
				}).catch(() => {});
			}
			return result;
		},
	);
	return {
		loading: isLoading,
		pagination,
		projects: data as readonly Project[],
	};
};
