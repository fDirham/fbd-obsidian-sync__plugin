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
	queryParams: QueryParams = {} as QueryParams
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

	const res = await fetch(url, fetchOptions);
	if (!res.ok) {
		throw new Error(`Fetch failed with status ${res.status}`);
	}
	return res.json() as Promise<Output>;
}
