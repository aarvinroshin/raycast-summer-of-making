import { clearRequestCache, invalidateCookieCache } from "../utils/cache";

import { LocalStorage as Storage, showToast, Toast } from "@raycast/api";
import { FormValidation as Validation, useForm } from "@raycast/utils";

export const useCookie = () => {
	const { handleSubmit, itemProps, setValue } = useForm<{ cookie: string }>({
		initialValues: { cookie: "" },
		async onSubmit(values) {
			const toast = await showToast({
				style: Toast.Style.Animated,
				title: "Saving cookie...",
			});

			try {
				const existing = await Storage.getItem<string>("cookie");
				if (existing !== values.cookie) {
					await Storage.setItem("cookie", values.cookie);
					invalidateCookieCache();
					clearRequestCache();
				}

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
	return {
		cookie: itemProps.cookie,
		set: setValue,
		submit: handleSubmit,
	};
};
