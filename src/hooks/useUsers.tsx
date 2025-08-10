import { LocalStorage as Storage } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useRef } from "react";

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
	const pages = useRef<number | null>(null);
	const { isLoading, data, pagination } = usePromise(
		() =>
		async (options: { page: number }): Promise<{
			data: User[];
			hasMore: boolean;
		}> => {
			const cookie = await Storage.getItem("cookie");

			if (pages.current == null) {
				const first = await fetch(
					`https://summer.hackclub.com/api/v1/users?page=1`,
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

			const target = (pages.current as number) - options.page;
			if (target < 1) {
				return { data: [], hasMore: false };
			}

			const response = await fetch(
				`https://summer.hackclub.com/api/v1/users?page=${target}`,
				{
					headers: {
						Cookie: cookie as string,
					},
				},
			);
			const { users } = (await response.json()) as {
				pagination: {
					count?: number;
					items?: number;
					page: number;
					pages: number;
				};
				users: readonly User[];
			};
			const reversed = [...users].reverse() as User[];
			return {
				data: reversed,
				hasMore: target > 1,
			};
		},
	);
	return {
		loading: isLoading,
		pagination,
		users: data as readonly User[],
	};
};
