import { useProjects } from "./hooks/useProjects";
import { useTime } from "./hooks/useTime";
import { useUser } from "./hooks/useUser";

import { Action, ActionPanel, Icon, Image, List } from "@raycast/api";
import { useCallback, useMemo, useState } from "react";

type Project = {
	onToggleDetail: () => void;
	project: {
		id: number;
		banner: string | null;
		category: string | null;
		created_at: string;
		demo_link: string;
		description: string;
		devlogs_count: number;
		followers: readonly { id: number; name: string }[];
		is_shipped: boolean;
		readme_link: string;
		repo_link: string;
		slack_id: string;
		title: string;
		total_seconds_coded: number;
		user_id: number;
	};
};
const Project = ({ onToggleDetail, project }: Project) => {
	const {
		banner,
		category,
		created_at: created,
		demo_link: demo,
		description,
		devlogs_count: devlogs,
		followers,
		id,
		is_shipped: shipped,
		readme_link: readme,
		repo_link: repo,
		slack_id,
		title,
		total_seconds_coded: time,
		user_id,
	} = project;
	const subtitle = description && description.length > 69
		? `${description.slice(0, 68).trimEnd()}…`
		: description;
	const creator = useUser(user_id, slack_id);
	return (
		<List.Item
			accessories={[
				creator ? { icon: Icon.Person, text: creator } : {},
				shipped ? { text: "Shipped", icon: Icon.CheckRosette } : {},
			]}
			actions={
				<ActionPanel>
					<Action.OpenInBrowser url={`https://summer.hackclub.com/projects/${id}`} />
					<Action title="Toggle Detail" onAction={onToggleDetail} />
				</ActionPanel>
			}
			detail={
				<List.Item.Detail
					markdown={`![](${banner})\n\n# ${title}\n\n${description}`}
					metadata={
						<List.Item.Detail.Metadata>
							{creator && <List.Item.Detail.Metadata.Label title="Creator" text={creator} />}
							{category && <List.Item.Detail.Metadata.Label title="Category" text={category} />}

							<List.Item.Detail.Metadata.Label
								title="Created"
								text={new Date(created).toLocaleString()}
							/>

							{demo && (
								<List.Item.Detail.Metadata.Link
									target={demo}
									text={new URL(demo).hostname}
									title="Demo"
								/>
							)}

							{devlogs > 0 && <List.Item.Detail.Metadata.Label title="Devlogs" text={`${devlogs}`} />}

							{followers.length > 0 && (
								<List.Item.Detail.Metadata.Label title="Followers" text={`${followers.length}`} />
							)}

							<List.Item.Detail.Metadata.Label title="Number" text={`${id}`} />

							{readme && (
								<List.Item.Detail.Metadata.Link
									target={readme}
									text={new URL(readme).hostname}
									title="README"
								/>
							)}

							{repo && (
								<List.Item.Detail.Metadata.Link
									target={repo}
									text={repo.match(/github\.com[:/]+([^/#?]+\/[^/#?]+?)(?=\.git(?:[/#?]|$)|[/#?]|$)/i)?.at(1)
										|| new URL(repo).pathname.replace(/^\/|\/$/g, "").replace(/\.git$/i, "")}
									title="Repository"
								/>
							)}

							{shipped && <List.Item.Detail.Metadata.Label title="Status" text="Shipped" />}
							{time > 0 && <List.Item.Detail.Metadata.Label title="Time" text={useTime(time)} />}
						</List.Item.Detail.Metadata>
					}
				/>
			}
			icon={banner
				? {
					mask: Image.Mask.RoundedRectangle,
					source: banner,
				}
				: undefined}
			subtitle={subtitle}
			title={title}
		/>
	);
};
const projects = () => {
	const { loading, projects, pagination } = useProjects();

	const [detail, setDetail] = useState(false);
	const toggleDetail = useCallback(() => setDetail((d) => !d), []);
	const items = useMemo(
		() => projects?.map((p) => <Project key={`${p.id}`} onToggleDetail={toggleDetail} project={p as any} />),
		[projects, toggleDetail],
	);

	return (
		<List isLoading={loading} isShowingDetail={detail} pagination={pagination}>
			{items}
		</List>
	);
};

export default projects;
