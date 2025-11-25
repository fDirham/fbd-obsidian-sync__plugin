export const sleepPromise = async (ms: number) => {
	return new Promise((res) => setTimeout(res, ms));
};
