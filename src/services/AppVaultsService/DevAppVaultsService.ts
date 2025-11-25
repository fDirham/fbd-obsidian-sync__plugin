import { sleepPromise } from "src/utils";
import { Mock_GetVaultsResponse_Success } from "src/mockData";
import AppVaultsService from "./AppVaultsService";
import AppGlobalState from "../AppGlobalState/AppGlobalState";
import { AppVault } from "src/model/AppVault";

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

	async createVault(vaultName: string): Promise<AppVault> {
		await sleepPromise(500);

		const newVault: AppVault = {
			id: `vault_${Date.now()}`,
			name: vaultName,
			backups: [],
		};
		this._ags.vaults.value = [...this._ags.vaults.value, newVault];
		return newVault;
	}

	async deleteVault(vaultId: string): Promise<void> {
		await sleepPromise(500);
		this._ags.vaults.value = this._ags.vaults.value.filter(
			(v) => v.id !== vaultId
		);
		if (this._ags.chosenVaultId.value === vaultId) {
			this._ags.chosenVaultId.value = "";
		}
	}

	async renameVault(vaultId: string, newName: string): Promise<void> {
		await sleepPromise(500);
		this._ags.vaults.value = this._ags.vaults.value.map((v) =>
			v.id === vaultId ? { ...v, name: newName } : v
		);
	}

	async downloadBackup(vaultId: string, backupId: string) {
		await sleepPromise(1000);
		console.log(
			`Downloaded backup ${backupId} for vault ${vaultId} (mock)`
		);
	}

	async deleteBackup(vaultId: string, backupId: string): Promise<void> {
		await sleepPromise(500);
		const vaults = this._ags.vaults.value;
		this._ags.vaults.value = vaults.map((v) => {
			if (v.id === vaultId) {
				return {
					...v,
					backups: v.backups.filter((b) => b.id !== backupId),
				};
			}
			return v;
		});
	}

	async uploadBackup(vaultId: string): Promise<void> {
		await sleepPromise(1000);
		const vaults = this._ags.vaults.value;
		this._ags.vaults.value = vaults.map((v): AppVault => {
			if (v.id === vaultId) {
				const newBackup = {
					id: `backup_${Date.now()}`,
					createdAt: new Date(),
				};
				return {
					...v,
					backups: [...v.backups, newBackup],
				};
			}
			return v;
		});
	}
}
