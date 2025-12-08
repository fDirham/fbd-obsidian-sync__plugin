export const sleepPromise = async (ms: number) => {
	return new Promise((res) => setTimeout(res, ms));
};

export function decodeJwt(token: string) {
	const payload = token.split(".")[1]; // middle part
	const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
	return JSON.parse(decoded);
}

export async function typedFetch<
	Input,
	Output,
	QueryParams extends Record<string, string> = never
>(
	url: string,
	options: Omit<RequestInit, "body">,
	bodyData: Input | null = null,
	queryParams: QueryParams = {} as QueryParams,
	timeout = 15000
): Promise<Output> {
	const fetchOptions: RequestInit = { ...options };

	// Append query params to URL
	if (Object.keys(queryParams).length > 0) {
		const urlObj = new URL(url);
		Object.entries(queryParams).forEach(([key, value]) => {
			urlObj.searchParams.append(key, value);
		});
		url = urlObj.toString();
	}

	if (bodyData) {
		fetchOptions.body = JSON.stringify(bodyData);
		fetchOptions.headers = {
			"Content-Type": "application/json",
			...(options.headers || {}),
		};
	}

	// Create abort controller for timeout
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);
	fetchOptions.signal = controller.signal;

	try {
		const res = await fetch(url, fetchOptions);
		clearTimeout(timeoutId);

		if (!res.ok) {
			throw new Error(res.body ? await res.text() : res.statusText);
		}

		const text = await res.text();
		if (!text) {
			return undefined as unknown as Output;
		}

		try {
			return JSON.parse(text) as Output;
		} catch (e) {
			// Backend sent non-JSON response, treat as void/empty
			return undefined as unknown as Output;
		}
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === "AbortError") {
			throw new Error(`Request timed out after ${timeout}ms`);
		}
		throw error;
	}
}
