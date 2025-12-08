// Localhost
// const BASE_API_URL = "http://localhost:3000";
// Dev
// const BASE_API_URL =
// 	"https://q41xlmeva1.execute-api.us-west-2.amazonaws.com/dev";
// Staging
// const BASE_API_URL =
// 	"https://nsskci4gkb.execute-api.us-west-2.amazonaws.com/staging";
// Production
const BASE_API_URL =
	"https://e5djo5yw00.execute-api.us-west-2.amazonaws.com/prod";

const AppAPIRoutes = {
	LOGIN: `${BASE_API_URL}/user/login`,
	SIGN_UP: `${BASE_API_URL}/user`,
	REFRESH_TOKEN: `${BASE_API_URL}/user/refresh`,
	SEND_RESET_PASSWORD_EMAIL: `${BASE_API_URL}/user/send-reset-password`,
	CONFIRM_RESET_PASSWORD: `${BASE_API_URL}/user/confirm-reset-password`,
	SEND_VERIFICATION_EMAIL: `${BASE_API_URL}/user/send-verification`,
	CONFIRM_VERIFY_USER: `${BASE_API_URL}/user/confirm-verify`,
	VAULTS: `${BASE_API_URL}/vault`,
	VAULT_BY_ID: (vaultId: string) => `${BASE_API_URL}/vault/${vaultId}`,
	BACKUP: `${BASE_API_URL}/vault/backup`,
	CHECK_BACKUP: `${BASE_API_URL}/vault/check`,
	DELETE_ACCOUNT: `${BASE_API_URL}/user`,
} as const;

export default AppAPIRoutes;
