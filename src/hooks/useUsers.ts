import { LocalStorage as Storage } from "@raycast/api";
import { usePromise } from "@raycast/utils";

type UserBadge = {
	name: string;
	text: string;
	icon: string; // emoji or uri
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
			const cookie = await Storage.getItem("cookie");

			const target = Math.max(0, options.page);

			const response = await fetch(
				`https://summer.hackclub.com/api/v1/users?page=${target + 1}`,
				{
					headers: {
						Cookie: cookie as string,
					},
				},
			);
			const { users, pagination: info } = (await response.json()) as {
				pagination: {
					count?: number;
					items?: number;
					page: number;
					pages: number;
				};
				users: readonly User[];
			};
			return {
				data: users as User[],
				hasMore: info.page < info.pages,
			};
		},
	);
	return {
		loading: isLoading,
		pagination,
		users: data as readonly User[],
	};
};
