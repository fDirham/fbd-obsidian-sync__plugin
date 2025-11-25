import { AppVault } from "./AppVault";
import { AuthCreds } from "./AuthCreds";
import ObservableValue from "./ObservableValue";

export enum AuthStatus {
	LOADING,
	LOGGED_IN,
	LOGGED_OUT,
	ERROR,
}

export default class AppGlobalState {
	public authStatus: ObservableValue<AuthStatus>;
	public authCreds: ObservableValue<AuthCreds | null>;
	public vaults: ObservableValue<AppVault[]>;
	public chosenVaultId: ObservableValue<string>;

	constructor() {
		this.authStatus = new ObservableValue(AuthStatus.LOADING);
		this.vaults = new ObservableValue<AppVault[]>([]);
		this.authCreds = new ObservableValue<AuthCreds | null>(null);
		this.chosenVaultId = new ObservableValue<string>("");
	}

	log(): void {
		console.group("AppGlobalState Debug");

		console.log("authStatus:", AuthStatus[this.authStatus.value]);
		console.log("authCreds:", this.authCreds.value);
		console.log("vaults:", this.vaults.value);
		console.log("chosenVaultId:", this.chosenVaultId.value);

		console.groupEnd();
	}
}
