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
	private _confirmRestoreLatestBackup: boolean;
	private _confirmRestoreSpecificBackup: boolean;
	private _confirmDeleteVault: boolean;
	private _confirmDeleteBackup: boolean;
	private _confirmUpload: boolean;

	constructor(private app: App, private plugin: AppPlugin) {
		super();
		this._authStatus = new ObservableValue(AuthStatus.LOADING);
		this._vaults = new ObservableValue<AppVault[]>([]);
		this._authCreds = new ObservableValue<AuthCreds | null>(null);
		this._chosenVaultId = new ObservableValue<string>("");
	}

	// Getters
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

	get confirmRestoreLatestBackup(): boolean {
		return this._confirmRestoreLatestBackup;
	}

	set confirmRestoreLatestBackup(value: boolean) {
		this._confirmRestoreLatestBackup = value;
		this.saveDataSlice({ confirmRestoreLatestBackup: value });
	}

	get confirmRestoreSpecificBackup(): boolean {
		return this._confirmRestoreSpecificBackup;
	}

	set confirmRestoreSpecificBackup(value: boolean) {
		this._confirmRestoreSpecificBackup = value;
		this.saveDataSlice({ confirmRestoreSpecificBackup: value });
	}

	get confirmDeleteVault(): boolean {
		return this._confirmDeleteVault;
	}

	set confirmDeleteVault(value: boolean) {
		this._confirmDeleteVault = value;
		this.saveDataSlice({ confirmDeleteVault: value });
	}

	get confirmDeleteBackup(): boolean {
		return this._confirmDeleteBackup;
	}

	set confirmDeleteBackup(value: boolean) {
		this._confirmDeleteBackup = value;
		this.saveDataSlice({ confirmDeleteBackup: value });
	}

	get confirmUpload(): boolean {
		return this._confirmUpload;
	}

	set confirmUpload(value: boolean) {
		this._confirmUpload = value;
		this.saveDataSlice({ confirmUpload: value });
	}

	async saveDataSlice(data: Partial<AppData>): Promise<void> {
		const currData: AppData = {
			chosenVaultId: this.chosenVaultId.value,
			confirmRestoreLatestBackup: this.confirmRestoreLatestBackup,
			confirmRestoreSpecificBackup: this.confirmRestoreSpecificBackup,
			confirmDeleteVault: this.confirmDeleteVault,
			confirmDeleteBackup: this.confirmDeleteBackup,
			confirmUpload: this.confirmUpload,
		};
		const toSave = { ...currData, ...data };
		return this.plugin.saveData(toSave);
	}

	saveLocalStorage(key: string, data: unknown): void {
		this.app.saveLocalStorage(key, data);
	}

	loadAllLocalStorage(): void {
		this._authCreds.value = this.app.loadLocalStorage(
			LocalStorageKeys.CREDS
		) as AuthCreds | null;
	}

	async loadAllData() {
		const rawData = (await this.plugin.loadData()) as Partial<AppData>;
		const defaultData: AppData = {
			chosenVaultId: "",
			confirmRestoreLatestBackup: false,
			confirmRestoreSpecificBackup: true,
			confirmDeleteVault: true,
			confirmDeleteBackup: true,
			confirmUpload: false,
		};
		const appData: AppData = {
			...defaultData,
			...rawData,
		};
		this.onDataLoaded(appData);
	}
}
