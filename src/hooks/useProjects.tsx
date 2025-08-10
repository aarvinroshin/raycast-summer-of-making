import { LocalStorage as Storage } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useRef } from "react";

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
	const pages = useRef<number | null>(null);
	const { isLoading, data, pagination } = usePromise(
		() =>
		async (options: { page: number }): Promise<{
			data: Project[];
			hasMore: boolean;
		}> => {
			const cookie = await Storage.getItem("cookie");

			if (pages.current == null) {
				const first = await fetch(
					`https://summer.hackclub.com/api/v1/projects?page=1`,
					{
						headers: {
							Cookie: cookie as string,
						},
					},
				);
				const { pagination } = (await first.json()) as {
					pagination: { pages: number };
				};
				pages.current = pagination.pages;
			}

			const target = pages.current - options.page;
			if (target < 1) {
				return { data: [], hasMore: false };
			}

			const response = await fetch(`https://summer.hackclub.com/api/v1/projects?page=${target}`, {
				headers: {
					Cookie: cookie as string,
				},
			});
			const { projects } = (await response.json()) as {
				pagination: {
					count?: number;
					items?: number;
					page: number;
					pages: number;
				};
				projects: readonly Project[];
			};
			const reversed = [...projects].reverse() as Project[];
			return {
				data: reversed,
				hasMore: target > 1,
			};
		},
	);
	return {
		loading: isLoading,
		pagination,
		projects: data as readonly Project[],
	};
};
