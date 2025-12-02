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

			this.saveData(newData);
		});

		this.authCreds.addListener("agsDataSync", (_, newVal) => {
			this.saveLocalStorage(LocalStorageKeys.CREDS, newVal);
		});
	}

	onDataLoaded(appData: AppData) {
		this.chosenVaultId.value = appData.chosenVaultId;
	}

	abstract loadAllLocalStorage(): void;

	abstract saveData(data: AppData): Promise<void>;

	abstract saveLocalStorage(key: string, data: unknown): void;
}
