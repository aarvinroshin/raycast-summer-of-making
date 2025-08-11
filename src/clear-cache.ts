import { showToast, Toast } from "@raycast/api";
import { clearPersistentCaches, clearRequestCache, invalidateCookieCache } from "./utils/cache";

export default async function clearCache() {
	const toast = await showToast({ style: Toast.Style.Animated, title: "Clearing caches..." });
	try {
		clearRequestCache();
		invalidateCookieCache();
		await clearPersistentCaches();
		toast.style = Toast.Style.Success;
		toast.title = "Caches cleared";
		toast.message = "Cookie preserved";
	} catch (err) {
		toast.style = Toast.Style.Failure;
		toast.title = "Failed to clear caches";
		if (err instanceof Error) toast.message = err.message;
	}
}
