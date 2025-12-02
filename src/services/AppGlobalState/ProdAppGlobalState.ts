import { AppVault } from "src/model/AppVault";
import { AuthCreds } from "src/model/AuthCreds";
import { AuthStatus } from "src/model/AuthStatus";
import ObservableValue from "src/model/ObservableValue";
import AppGlobalState from "./AppGlobalState";
import AppPlugin from "src/AppPlugin/AppPlugin";
import AppData from "src/model/AppData";
import { App } from "obsidian";
import { LocalStorageKeys } from "src/model/LocalStorageKeys";

export default class ProdAppGlobalState extends AppGlobalState {
	private _authStatus: ObservableValue<AuthStatus>;
	private _authCreds: ObservableValue<AuthCreds | null>;
	private _vaults: ObservableValue<AppVault[]>;
	private _chosenVaultId: ObservableValue<string>;

	constructor(private app: App, private plugin: AppPlugin) {
		super();
		this._authStatus = new ObservableValue(AuthStatus.LOADING);
		this._vaults = new ObservableValue<AppVault[]>([]);
		this._authCreds = new ObservableValue<AuthCreds | null>(null);
		this._chosenVaultId = new ObservableValue<string>("");
	}

	get authStatus(): ObservableValue<AuthStatus> {
		return this._authStatus;
	}

	get authCreds(): ObservableValue<AuthCreds | null> {
		return this._authCreds;
	}

	get vaults(): ObservableValue<AppVault[]> {
		return this._vaults;
	}

	get chosenVaultId(): ObservableValue<string> {
		return this._chosenVaultId;
	}

	saveData(data: AppData): Promise<void> {
		return this.plugin.saveData(data);
	}
	saveLocalStorage(key: string, data: unknown): void {
		this.app.saveLocalStorage(key, data);
	}
	loadAllLocalStorage(): void {
		this._authCreds.value = this.app.loadLocalStorage(
			LocalStorageKeys.CREDS
		) as AuthCreds | null;
	}
}
