import { decodeJwt, sleepPromise, typedFetch } from "src/utils";
import AuthService from "./AuthService";
import { AuthCreds } from "src/model/AuthCreds";
import AppGlobalState from "../AppGlobalState/AppGlobalState";
import { AuthStatus } from "src/model/AuthStatus";
import { LoginResponse } from "src/model/dto/LoginResponse";
import { IdTokenDecoded } from "src/model/IdTokenDecoded";
import { LoginRequest } from "src/model/dto/LoginRequest";
import { RefreshTokenRequest } from "src/model/dto/RefreshTokenRequest";
import { SignUpRequest } from "src/model/dto/SignUpRequest";
import { SendResetPasswordEmailRequest } from "src/model/dto/SendResetPasswordEmailRequest";
import { ConfirmResetPasswordRequest } from "src/model/dto/ConfirmResetPasswordRequest";
import { SendVerificationEmailRequest } from "src/model/dto/SendVerificationEmailRequest";
import { ConfirmVerifyUserRequest } from "src/model/dto/ConfirmVerifyUserRequest";
import AppAPIRoutes from "src/model/AppAPIRoutes";

export default class LocalhostAuthService extends AuthService {
	private _ags: AppGlobalState;

	constructor(ags: AppGlobalState) {
		super();
		this._ags = ags;
	}

	async load() {
		const credsJson = this._ags.authCreds.value;
		if (credsJson) {
			try {
				this._ags.authCreds.value = await this.checkAndRefreshToken();
				this._ags.authStatus.value = AuthStatus.LOGGED_IN;
			} catch (e) {
				console.error("Token refresh failed during load:", e);
				this._ags.authCreds.value = null;
				this._ags.authStatus.value = AuthStatus.LOGGED_OUT;
			}
		} else {
			this._ags.authStatus.value = AuthStatus.LOGGED_OUT;
		}

		console.log("LocalhostAuthService loaded");
	}

	async logout() {
		this._ags.authStatus.value = AuthStatus.LOGGED_OUT;
		this._ags.authCreds.value = null;
	}

	async login(email: string, password: string) {
		const loginRes = await typedFetch<LoginRequest, LoginResponse>(
			AppAPIRoutes.LOGIN,
			{ method: "POST" },
			{ email, password }
		);

		this._ags.authCreds.value = { ...loginRes, email };
		this._ags.authStatus.value = AuthStatus.LOGGED_IN;
	}

	async deleteAccount(): Promise<void> {
		await sleepPromise(1000);
		console.log("Mock delete account");
	}

	async checkAndRefreshToken(): Promise<AuthCreds> {
		const currentCreds = this._ags.authCreds.value;
		if (!currentCreds) {
			throw new Error("No current credentials to refresh");
		}

		try {
			const decoded: IdTokenDecoded = decodeJwt(currentCreds.idToken);
			const nowSec = Date.now() / 1000;

			// If token is still valid for more than 5 minutes, return current creds
			if (decoded.exp - nowSec > 300) {
				console.debug("Token still valid, no refresh needed");
				return currentCreds;
			}

			const currEmail: string | null =
				this._ags.authCreds.value?.email || null;
			if (!currEmail) {
				throw new Error(
					"Cannot refresh token: missing email in current creds"
				);
			}

			console.debug("Refreshing token");
			// Otherwise, refresh the token
			const refreshRes = await typedFetch<
				RefreshTokenRequest,
				LoginResponse
			>(
				AppAPIRoutes.REFRESH_TOKEN,
				{ method: "POST" },
				{
					uid: decoded.sub,
					refreshToken: currentCreds.refreshToken,
					email: currEmail,
				}
			);

			const newCreds: AuthCreds = { ...refreshRes, email: currEmail };

			this._ags.authCreds.value = newCreds;

			console.debug("Token refreshed successfully");
			return newCreds;
		} catch (e) {
			throw new Error("Couldn't parse access token");
		}
	}

	async signUp(email: string, password: string): Promise<void> {
		await typedFetch<SignUpRequest, void>(
			AppAPIRoutes.SIGN_UP,
			{ method: "POST" },
			{ email, password }
		);
	}

	async sendResetPasswordEmail(email: string): Promise<void> {
		await typedFetch<SendResetPasswordEmailRequest, void>(
			AppAPIRoutes.SEND_RESET_PASSWORD_EMAIL,
			{ method: "POST" },
			{ email }
		);
	}
	async confirmResetPassword(
		email: string,
		newPassword: string,
		code: string
	): Promise<boolean> {
		try {
			await typedFetch<ConfirmResetPasswordRequest, void>(
				AppAPIRoutes.CONFIRM_RESET_PASSWORD,
				{ method: "POST" },
				{ email, newPassword, code }
			);
			return true;
		} catch (e) {
			console.error("Error confirming reset password:", e);
			return false;
		}
	}

	async sendVerificationEmail(email: string): Promise<void> {
		await typedFetch<SendVerificationEmailRequest, void>(
			AppAPIRoutes.SEND_VERIFICATION_EMAIL,
			{ method: "POST" },
			{ email }
		);
	}

	async confirmVerify(email: string, code: string): Promise<boolean> {
		try {
			await typedFetch<ConfirmVerifyUserRequest, void>(
				AppAPIRoutes.CONFIRM_VERIFY_USER,
				{ method: "POST" },
				{ email, code }
			);
			return true;
		} catch (e) {
			console.error("Error confirming email verification:", e);
			return false;
		}
	}
}
