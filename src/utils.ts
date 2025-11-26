export const sleepPromise = async (ms: number) => {
	return new Promise((res) => setTimeout(res, ms));
};

export function decodeJwt(token: string) {
	const payload = token.split(".")[1]; // middle part
	const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
	return JSON.parse(decoded);
}
