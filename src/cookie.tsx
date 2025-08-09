import { Action, ActionPanel, Form, LocalStorage as Storage } from "@raycast/api";
import { useEffect } from "react";
import { useCookie } from "./hooks/useCookie";

const cookie = () => {
	const { cookie, set, submit } = useCookie();
	useEffect(() => {
		(async () => {
			const existing = await Storage.getItem<string>("cookie");
			if (!existing) return;
			set("cookie", existing);
		})();
	}, [set]);
	return (
		<Form
			actions={
				<ActionPanel>
					<Action.SubmitForm title="Save Cookie" onSubmit={submit} />
				</ActionPanel>
			}
		>
			<Form.TextArea title="Cookie" placeholder="Enter your cookie value" {...cookie} />
		</Form>
	);
};

export default cookie;
