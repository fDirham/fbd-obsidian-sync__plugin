import { sleepPromise } from "src/utils";
import { Mock_GetVaultsResponse_Success } from "src/mockData";
import AppVaultsService from "./AppVaultsService";
import AppGlobalState from "src/model/AppGlobalState";

export default class DevAppVaultsService extends AppVaultsService {
	private _ags: AppGlobalState;

	constructor(ags: AppGlobalState) {
		super();
		this._ags = ags;
	}

	setChosenVault(vaultId: string) {
		this._ags.chosenVaultId.value = vaultId;
	}

	async loadVaults() {
		await sleepPromise(500);
		const toSet = Mock_GetVaultsResponse_Success.vaults;
		this._ags.vaults.value = toSet;
	}

	async clearVaults(): Promise<void> {
		this._ags.chosenVaultId.value = "";
		this._ags.vaults.value = [];
	}

	async downloadBackup(vaultId: string, backupId: string) {
		await sleepPromise(1000);
		console.log(
			`Downloaded backup ${backupId} for vault ${vaultId} (mock)`
		);
	}
}
