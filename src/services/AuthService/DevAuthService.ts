import { App } from "obsidian";
import { Mock_LoginResponse_Success } from "src/mockData";
import { LocalStorageKeys } from "src/model/LocalStorageKeys";
import { sleepPromise } from "src/utils";
import AuthService from "./AuthService";
import { AuthCreds } from "src/model/AuthCreds";
import AppGlobalState from "../AppGlobalState/AppGlobalState";
import { AuthStatus } from "src/model/AuthStatus";

export default class DevAuthService extends AuthService {
	private _ags: AppGlobalState;
	private _app: App;

	constructor(ags: AppGlobalState, app: App) {
		super();
		this._ags = ags;
		this._app = app;
	}

	async load() {
		const credsJson: AuthCreds | null = this._app.loadLocalStorage(
			LocalStorageKeys.CREDS
		);

		if (credsJson) {
			this._ags.authStatus.value = AuthStatus.LOGGED_IN;
			// TODO: simulate token refresh and validation
			await sleepPromise(1000);
		} else {
			this._ags.authStatus.value = AuthStatus.LOGGED_OUT;
		}

		this._ags.authCreds.value = credsJson;

		console.log("DevAuthService loaded");
	}

	async logout() {
		this._ags.authStatus.value = AuthStatus.LOGGED_OUT;
		this._ags.authCreds.value = null;
		this._app.saveLocalStorage(LocalStorageKeys.CREDS, null);
	}

	async login(email: string, password: string) {
		await sleepPromise(1000);

		// Mock generic success for now
		this._ags.authCreds.value = { ...Mock_LoginResponse_Success, email };
		this._ags.authStatus.value = AuthStatus.LOGGED_IN;

		this._app.saveLocalStorage(
			LocalStorageKeys.CREDS,
			this._ags.authCreds.value
		);
	}

	async deleteAccount(): Promise<void> {
		await sleepPromise(1000);
		console.log("Mock delete account");
	}

	async checkAndRefreshToken(): Promise<AuthCreds> {
		return {
			...Mock_LoginResponse_Success,
			email: this._ags.authCreds.value?.email || "",
		};
	}

	async sendResetPasswordEmail(email: string): Promise<void> {
		console.log(`Mock: sending password reset email to ${email}`);
		await sleepPromise(500);
	}

	async confirmResetPassword(
		email: string,
		newPassword: string,
		code: string
	): Promise<boolean> {
		console.log(
			`Mock: confirming password reset for ${email} with code ${code}`
		);
		await sleepPromise(500);
		return true;
	}

	async confirmVerify(email: string, code: string): Promise<boolean> {
		console.log(
			`Mock: confirming email verification for ${email} with code ${code}`
		);
		await sleepPromise(500);
		return true;
	}

	async sendVerificationEmail(email: string): Promise<void> {
		console.log(`Mock: sending verification email to ${email}`);
		await sleepPromise(500);
	}

	async signUp(email: string, password: string): Promise<void> {
		console.log(`Mock: signing up user with email ${email}`);
		await sleepPromise(1000);
	}

	async verifyEmail(token: string): Promise<void> {
		console.log(`Mock: verifying email with token ${token}`);
		await sleepPromise(500);
	}
}
