import { Action, ActionPanel, Icon, Image, List } from "@raycast/api";
import { useCallback, useMemo, useState } from "react";
import { useDevlogs } from "./hooks/useDevlogs";
import { useProject } from "./hooks/useProject";
import { useUser } from "./hooks/useUser";

type Devlog = {
	devlog: ReturnType<typeof useDevlogs>["devlogs"][number];
	onToggleDetail: () => void;
};
const Devlog = ({ devlog, onToggleDetail }: Devlog) => {
	const {
		id,
		text,
		attachment,
		project_id,
		created_at,
		updated_at,
	} = devlog as any;

	const project = useProject(project_id);
	const creator = useUser(project?.user_id as number, project?.slack_id);

	const subtitle = text && text.length > 69
		? `${text.slice(0, 68).trimEnd()}…`
		: text;

	return (
		<List.Item
			key={`${id}`}
			title={subtitle ?? `Devlog #${id}`}
			subtitle={subtitle ? undefined : text}
			accessories={[
				project?.title ? { icon: Icon.Document, text: project.title } : {},
				creator ? { icon: Icon.Person, text: creator } : {},
			]}
			icon={attachment ? { mask: Image.Mask.RoundedRectangle, source: attachment } : undefined}
			actions={
				<ActionPanel>
					<Action.OpenInBrowser url={`https://summer.hackclub.com/projects/${project_id}`} />
					<Action title="Toggle Detail" onAction={onToggleDetail} />
				</ActionPanel>
			}
			detail={
				<List.Item.Detail
					markdown={`${attachment ? `![](${attachment})\n\n` : ""}${text ?? ""}`}
					metadata={
						<List.Item.Detail.Metadata>
							<List.Item.Detail.Metadata.Label title="ID" text={`${id}`} />
							<List.Item.Detail.Metadata.Label title="Created" text={new Date(created_at).toLocaleString()} />
							<List.Item.Detail.Metadata.Label title="Updated" text={new Date(updated_at).toLocaleString()} />
							{project?.title && <List.Item.Detail.Metadata.Label title="Project" text={project.title} />}
							{creator && <List.Item.Detail.Metadata.Label title="Creator" text={creator} />}
						</List.Item.Detail.Metadata>
					}
				/>
			}
		/>
	);
};
const Devlogs = () => {
	const { loading, devlogs, pagination } = useDevlogs();
	const [detail, setDetail] = useState(false);
	const toggleDetail = useCallback(() => setDetail((d) => !d), []);
	const items = useMemo(
		() => devlogs?.map((d: any) => <Devlog key={`${d.id}`} devlog={d} onToggleDetail={toggleDetail} />),
		[devlogs, toggleDetail],
	);

	return (
		<List isLoading={loading} isShowingDetail={detail} pagination={pagination}>
			{items}
		</List>
	);
};

export default Devlogs;
