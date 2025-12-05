import ObservableValue from "src/model/ObservableValue";
import { AuthCreds } from "src/model/AuthCreds";
import { AppVault } from "src/model/AppVault";
import { AuthStatus } from "src/model/AuthStatus";
import AppData from "src/model/AppData";
import { LocalStorageKeys } from "src/model/LocalStorageKeys";
export default abstract class AppGlobalState {
	abstract get authStatus(): ObservableValue<AuthStatus>;
	abstract get authCreds(): ObservableValue<AuthCreds | null>;
	abstract get vaults(): ObservableValue<AppVault[]>;
	abstract get chosenVaultId(): ObservableValue<string>;
	abstract get isOnline(): ObservableValue<boolean>;
	abstract get confirmRestoreLatestBackup(): boolean;
	abstract get confirmRestoreSpecificBackup(): boolean;
	abstract get confirmDeleteVault(): boolean;
	abstract get confirmDeleteBackup(): boolean;
	abstract get confirmUpload(): boolean;
	abstract set confirmRestoreLatestBackup(value: boolean);
	abstract set confirmRestoreSpecificBackup(value: boolean);
	abstract set confirmDeleteVault(value: boolean);
	abstract set confirmDeleteBackup(value: boolean);
	abstract set confirmUpload(value: boolean);

	constructor() {}

	log(): void {
		console.group("AppGlobalState Debug");

		console.log("authStatus:", AuthStatus[this.authStatus.value]);
		console.log("authCreds:", this.authCreds.value);
		console.log("vaults:", this.vaults.value);
		console.log("chosenVaultId:", this.chosenVaultId.value);

		console.groupEnd();
	}

	assignDataAndValuesListeners() {
		this.chosenVaultId.addListener("agsDataSync", (_, newVal) => {
			const newData = {
				chosenVaultId: newVal,
			};

			this.saveDataSlice(newData);
		});

		this.authCreds.addListener("agsDataSync", (_, newVal) => {
			this.saveLocalStorage(LocalStorageKeys.CREDS, newVal);
		});
	}

	abstract assignOnlineStatusListeners(): void;

	onDataLoaded(appData: AppData) {
		this.chosenVaultId.value = appData.chosenVaultId;
		this.confirmDeleteBackup = appData.confirmDeleteBackup;
		this.confirmDeleteVault = appData.confirmDeleteVault;
		this.confirmRestoreLatestBackup = appData.confirmRestoreLatestBackup;
		this.confirmRestoreSpecificBackup =
			appData.confirmRestoreSpecificBackup;
		this.confirmUpload = appData.confirmUpload;
	}

	abstract loadAllLocalStorage(): void;

	abstract loadAllData(): Promise<void>;

	abstract saveDataSlice(data: Partial<AppData>): Promise<void>;

	abstract saveLocalStorage(key: string, data: unknown): void;
}
