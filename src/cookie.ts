import { LaunchProps, LocalStorage } from "@raycast/api";

const cookie = async (
	props: LaunchProps<{
		arguments: Arguments.Cookie;
	}>,
) =>
	await LocalStorage.setItem(
		"cookie",
		props.arguments.cookie,
	);

export default cookie;
