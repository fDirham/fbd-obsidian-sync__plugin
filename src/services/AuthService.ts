import { App } from "obsidian";
import { Mock_LoginResponse_Success } from "src/mockData";
import { LocalStorageKeys } from "src/model/LocalStorageKeys";
import ObservableValue from "src/model/ObservableValue";
import { sleepPromise } from "src/utils";

export enum AuthStatus {
	LOADING,
	LOGGED_IN,
	LOGGED_OUT,
	ERROR,
}

export default class AuthService {
	private _status: ObservableValue<AuthStatus>;
	private app: App;

	constructor(app: App) {
		this._status = new ObservableValue(AuthStatus.LOADING);
		this.app = app;
	}

	async load() {
		console.log("Loading AuthService");
		await sleepPromise(500);
		const isLoggedIn = !!this.app.loadLocalStorage(LocalStorageKeys.CREDS);
		this._status.value = isLoggedIn
			? AuthStatus.LOGGED_IN
			: AuthStatus.LOGGED_OUT;

		console.log("Loaded, auth status is: ", this._status.value);
	}

	async logout() {
		this._status.value = AuthStatus.LOGGED_OUT;
		this.app.saveLocalStorage(LocalStorageKeys.CREDS, null);
	}

	async login(email: string, password: string) {
		await sleepPromise(1000);

		// Mock generic success for now
		const creds = Mock_LoginResponse_Success;

		this.app.saveLocalStorage(LocalStorageKeys.CREDS, creds);

		this._status.value = AuthStatus.LOGGED_IN;
	}

	get status() {
		return this._status;
	}
}
