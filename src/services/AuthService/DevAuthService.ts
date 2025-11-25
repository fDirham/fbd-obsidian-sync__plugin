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
		this._ags.authCreds.value = Mock_LoginResponse_Success;
		this._ags.authStatus.value = AuthStatus.LOGGED_IN;

		this._app.saveLocalStorage(
			LocalStorageKeys.CREDS,
			Mock_LoginResponse_Success
		);
	}

	async deleteAccount(): Promise<void> {
		await sleepPromise(1000);
		console.log("Mock delete account");
	}
}
