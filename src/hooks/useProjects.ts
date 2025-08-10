import { LocalStorage as Storage } from "@raycast/api";
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
			const cookie = await Storage.getItem("cookie");

			const target = Math.max(0, options.page);

			const response = await fetch(`https://summer.hackclub.com/api/v1/projects?page=${target + 1}`, {
				headers: {
					Cookie: cookie as string,
				},
			});
			const { projects, pagination: info } = (await response.json()) as {
				pagination: {
					count?: number;
					items?: number;
					page: number;
					pages: number;
				};
				projects: readonly Project[];
			};
			return {
				data: projects as Project[],
				hasMore: info.page < info.pages,
			};
		},
	);
	return {
		loading: isLoading,
		pagination,
		projects: data as readonly Project[],
	};
};
