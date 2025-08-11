import { LocalStorage as Storage } from "@raycast/api";

let cachedCookie: string | undefined;
export async function getCookieCached(): Promise<string | undefined> {
	if (cachedCookie !== undefined) return cachedCookie;
	const v = await Storage.getItem<string>("cookie");
	cachedCookie = (v ?? undefined) as string | undefined;
	return cachedCookie;
}

export function invalidateCookieCache() {
	cachedCookie = undefined;
}

type CacheEntry<T = unknown> = {
	expiry: number;
	data?: T;
	promise?: Promise<T>;
};

const requestCache = new Map<string, CacheEntry<any>>();

export function clearRequestCache() {
	requestCache.clear();
}

function makeKey(url: string, init?: RequestInit, extraKey?: string) {
	const method = (init?.method || "GET").toUpperCase();
	const cookie = (init?.headers && typeof init.headers === "object" && (init.headers as any)["Cookie"]) || "";
	return `${method} ${url} ${cookie}${extraKey ? ` ${extraKey}` : ""}`;
}

export async function fetchJSONCached<T = any>(
	url: string,
	init?: RequestInit,
	ttlMs = 30_000,
	extraKey?: string,
): Promise<T> {
	const key = makeKey(url, init, extraKey);
	const now = Date.now();
	const existing = requestCache.get(key);
	if (existing && existing.data !== undefined && existing.expiry > now) {
		return existing.data as T;
	}
	if (existing?.promise) {
		return existing.promise as Promise<T>;
	}

	const p = (async () => {
		const res = await fetch(url, init);
		let json: any | undefined;
		try {
			json = await res.json();
		} catch (_) {
			try {
				const text = await res.text();
				if (!res.ok) {
					throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
				}
				json = text as unknown as T;
			} catch (err) {
				if (!res.ok) {
					throw new Error(`HTTP ${res.status} ${res.statusText}`);
				}
				throw err;
			}
		}
		if (!res.ok) {
			const msg = typeof json === "string" ? json : JSON.stringify(json ?? {});
			throw new Error(`HTTP ${res.status} ${res.statusText}${msg ? ` - ${msg}` : ""}`);
		}
		requestCache.set(key, { data: json as T, expiry: Date.now() + ttlMs });
		return json as T;
	})();

	requestCache.set(key, { expiry: now + ttlMs, promise: p });
	try {
		return await p;
	} catch (e) {
		requestCache.delete(key);
		throw e;
	}
}

export const DEFAULT_LIST_TTL = 2 * 60_000;

type ListPageCache<T> = {
	expiry: number;
	value: { data: T[]; hasMore: boolean };
};

function listKey(name: string, page: number) {
	return `rsom:list:${name}:p:${page}`;
}

export async function getListPage<T = any>(
	name: string,
	page: number,
): Promise<{ data: T[]; hasMore: boolean } | undefined> {
	try {
		const raw = await Storage.getItem<string>(listKey(name, page));
		if (!raw) return undefined;
		const parsed = JSON.parse(raw) as ListPageCache<T>;
		if (!parsed?.expiry || parsed.expiry < Date.now()) return undefined;
		return parsed.value;
	} catch {
		return undefined;
	}
}

export async function setListPage<T = any>(
	name: string,
	page: number,
	value: { data: T[]; hasMore: boolean },
	ttlMs: number = DEFAULT_LIST_TTL,
): Promise<void> {
	try {
		const payload: ListPageCache<T> = { expiry: Date.now() + ttlMs, value };
		await Storage.setItem(listKey(name, page), JSON.stringify(payload));
	} catch {
	}
}

export const DEFAULT_ENTITY_TTL = 10 * 60_000;

type EntityCache<T> = {
	expiry: number;
	value: T;
};

function entityKey(name: string, id: number | string) {
	return `rsom:entity:${name}:${id}`;
}

export async function getEntity<T = any>(
	name: string,
	id: number | string,
): Promise<T | undefined> {
	try {
		const raw = await Storage.getItem<string>(entityKey(name, id));
		if (!raw) return undefined;
		const parsed = JSON.parse(raw) as EntityCache<T>;
		if (!parsed?.expiry || parsed.expiry < Date.now()) return undefined;
		return parsed.value;
	} catch {
		return undefined;
	}
}

export async function setEntity<T = any>(
	name: string,
	id: number | string,
	value: T,
	ttlMs: number = DEFAULT_ENTITY_TTL,
): Promise<void> {
	try {
		const payload: EntityCache<T> = { expiry: Date.now() + ttlMs, value };
		await Storage.setItem(entityKey(name, id), JSON.stringify(payload));
	} catch {
	}
}

export async function clearPersistentCaches(): Promise<void> {
	try {
		const all = await Storage.allItems?.();
		if (all && typeof all === "object") {
			const entries = Object.entries(all as Record<string, string>);
			await Promise.all(
				entries
					.filter(([k]) => k.startsWith("rsom:"))
					.map(([k]) => Storage.removeItem(k)),
			);
			return;
		}
		const prefixes = [
			"rsom:list:users:",
			"rsom:list:devlogs:",
			"rsom:list:projects:",
			"rsom:entity:user:",
			"rsom:entity:project:",
		];
		await Promise.all(
			prefixes.flatMap((p) => [0, 1, 2, 3, 4].map((i) => Storage.removeItem(`${p}${i}`))),
		);
	} catch {
	}
}
