import { Action, ActionPanel, Icon, Image, List } from "@raycast/api";
import { useState } from "react";
import { useProjects } from "./hooks/useProjects";
import { useTime } from "./hooks/useTime";

const projects = () => {
	const { loading, projects, pagination } = useProjects();

	const [detail, setDetail] = useState(false);

	return (
		<List isLoading={loading} isShowingDetail={detail} pagination={pagination}>
			{projects?.map(({
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
				title,
				total_seconds_coded: time,
			}) => {
				const subtitle = description && description.length > 69
					? `${description.slice(0, 68).trimEnd()}…`
					: description;

				return (
					<List.Item
						accessories={[
							shipped
								? { text: "Shipped", icon: Icon.CheckRosette }
								: {},
						]}
						actions={
							<ActionPanel>
								<Action.OpenInBrowser url={`https://summer.hackclub.com/projects/${id}`} />
								<Action title="Toggle Detail" onAction={() => setDetail(!detail)} />
							</ActionPanel>
						}
						detail={
							<List.Item.Detail
								markdown={`![](${banner})\n\n# ${title}\n\n${description}`}
								metadata={
									<List.Item.Detail.Metadata>
										{category && (
											<List.Item.Detail.Metadata.Label
												title="Category"
												text={category}
											/>
										)}

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

										{devlogs > 0 && (
											<List.Item.Detail.Metadata.Label
												title="Devlogs"
												text={`${devlogs}`}
											/>
										)}

										{followers.length > 0 && (
											<List.Item.Detail.Metadata.Label
												title="Followers"
												text={`${followers.length}`}
											/>
										)}

										<List.Item.Detail.Metadata.Label
											title="Number"
											text={`${id}`}
										/>

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
												text={repo.match(
													/github\.com[:/]+([^/#?]+\/[^/#?]+?)(?=\.git(?:[/#?]|$)|[/#?]|$)/i,
												)?.at(1)
													|| new URL(repo).pathname
														.replace(/^\/|\/$/g, "")
														.replace(/\.git$/i, "")}
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
						key={`${id}`}
						subtitle={subtitle}
						title={title}
					/>
				);
			})}
		</List>
	);
};

export default projects;
