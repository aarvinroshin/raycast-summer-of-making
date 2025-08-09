import { Action, ActionPanel, Form, LocalStorage as Storage, showToast, Toast } from "@raycast/api";
import { FormValidation as Validation, useForm } from "@raycast/utils";
import { useEffect } from "react";

interface CookieFormValues {
	cookie: string;
}

export default function Command() {
	const { handleSubmit, itemProps, setValue } = useForm<CookieFormValues>({
		initialValues: { cookie: "" },
		async onSubmit(values) {
			const toast = await showToast({
				style: Toast.Style.Animated,
				title: "Saving cookie...",
			});

			try {
				await Storage.setItem("cookie", values.cookie);

				toast.style = Toast.Style.Success;
				toast.title = "Cookie saved";
			} catch (err) {
				toast.style = Toast.Style.Failure;
				toast.title = "Failed to save cookie";

				if (err instanceof Error) {
					toast.message = err.message;
				}
			}
		},
		validation: {
			cookie: Validation.Required,
		},
	});

	useEffect(() => {
		(async () => {
			const existing = await Storage.getItem<string>("cookie");
			if (!existing) return;
			setValue("cookie", existing);
		})();
	}, [setValue]);

	return (
		<Form
			actions={
				<ActionPanel>
					<Action.SubmitForm title="Save Cookie" onSubmit={handleSubmit} />
				</ActionPanel>
			}
		>
			<Form.TextArea title="Cookie" placeholder="Enter your cookie value" {...itemProps.cookie} />
		</Form>
	);
}
