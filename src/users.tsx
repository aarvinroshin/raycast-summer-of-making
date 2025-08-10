import { Action, ActionPanel, Icon, Image, List } from "@raycast/api";
import { useState } from "react";
import { useTime } from "./hooks/useTime";
import { useUsers } from "./hooks/useUsers";

const Users = () => {
	const { loading, users, pagination } = useUsers();
	const [detail, setDetail] = useState(false);

	return (
		<List isLoading={loading} isShowingDetail={detail} pagination={pagination}>
			{users?.map(
				({
					id,
					display_name: name,
					bio,
					avatar,
					badges,
					projects_count,
					devlogs_count,
					votes_count,
					ships_count,
					coding_time_seconds,
					coding_time_seconds_today,
					created_at,
					updated_at,
				}) => {
					const subtitle = bio && bio.length > 69 ? `${bio.slice(0, 68).trimEnd()}…` : bio || undefined;

					return (
						<List.Item
							key={`${id}`}
							title={name}
							subtitle={subtitle}
							icon={avatar
								? {
									mask: Image.Mask.RoundedRectangle,
									source: avatar,
								}
								: Icon.Person}
							actions={
								<ActionPanel>
									<Action.OpenInBrowser url={`https://summer.hackclub.com/users/${id}`} />
									<Action title="Toggle Detail" onAction={() => setDetail(!detail)} />
								</ActionPanel>
							}
							detail={
								<List.Item.Detail
									markdown={`${avatar ? `![](${avatar})\n\n` : ""}# ${name}\n\n${bio ?? ""}`}
									metadata={
										<List.Item.Detail.Metadata>
											<List.Item.Detail.Metadata.Label title="ID" text={`${id}`} />
											<List.Item.Detail.Metadata.Label title="Created" text={new Date(created_at).toLocaleString()} />
											<List.Item.Detail.Metadata.Label title="Updated" text={new Date(updated_at).toLocaleString()} />

											{coding_time_seconds > 0 && (
												<List.Item.Detail.Metadata.Label
													title="Coding Time"
													text={useTime(coding_time_seconds)}
												/>
											)}
											{coding_time_seconds_today > 0 && (
												<List.Item.Detail.Metadata.Label
													title="Today"
													text={useTime(coding_time_seconds_today)}
												/>
											)}

											{projects_count > 0 && (
												<List.Item.Detail.Metadata.Label title="Projects" text={`${projects_count}`} />
											)}
											{devlogs_count > 0 && (
												<List.Item.Detail.Metadata.Label title="Devlogs" text={`${devlogs_count}`} />
											)}
											{votes_count > 0 && <List.Item.Detail.Metadata.Label title="Votes" text={`${votes_count}`} />}
											{ships_count > 0 && <List.Item.Detail.Metadata.Label title="Ships" text={`${ships_count}`} />}

											{badges?.length
												? (
													<List.Item.Detail.Metadata.TagList title="Badges">
														{badges.map((b, i) => (
															<List.Item.Detail.Metadata.TagList.Item key={`${b.name}-${i}`} text={b.name} />
														))}
													</List.Item.Detail.Metadata.TagList>
												)
												: null}
										</List.Item.Detail.Metadata>
									}
								/>
							}
						/>
					);
				},
			)}
		</List>
	);
};

export default Users;
