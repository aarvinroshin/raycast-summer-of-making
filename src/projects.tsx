import { Action, ActionPanel, Icon, Image, List, LocalStorage as Storage } from "@raycast/api";
import { useProjects } from "./hooks/useProjects";

const projects = () => {
	const { loading, projects, pagination } = useProjects();
	return (
		<List isLoading={loading} isShowingDetail pagination={pagination}>
			{projects?.map(({
				banner,
				description,
				id,
				is_shipped: shipped,
				title,
			}) => (
				<List.Item
					accessories={[
						shipped
							? { text: "Shipped", icon: Icon.CheckRosette }
							: {},
					]}
					actions={
						<ActionPanel>
							<Action.OpenInBrowser url={`https://summer.hackclub.com/projects/${id}`} />
						</ActionPanel>
					}
					detail={
						<List.Item.Detail
							markdown={`![](${banner})\n\n# ${title}\n\n${description}`}
						/>
					}
					icon={{
						mask: Image.Mask.RoundedRectangle,
						source: banner,
					}}
					key={`${id}`}
					subtitle={description}
					title={title}
				/>
			))}
		</List>
	);
};

export default projects;
