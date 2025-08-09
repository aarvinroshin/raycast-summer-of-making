import { LaunchProps, LocalStorage, showToast, Toast } from "@raycast/api";

const cookie = async (
	props: LaunchProps<{
		arguments: Arguments.Cookie;
	}>,
) => {
	const toast = await showToast({
		style: Toast.Style.Animated,
		title: "Saving cookie...",
	});
	try {
		await LocalStorage.setItem(
			"cookie",
			props.arguments.cookie,
		);

		toast.style = Toast.Style.Success;
		toast.title = "Cookie saved";
	} catch (err) {
		toast.style = Toast.Style.Failure;
		toast.title = "Failed to save cookie";

		if (err instanceof Error) {
			toast.message = err.message;
		}
	}
};

export default cookie;
