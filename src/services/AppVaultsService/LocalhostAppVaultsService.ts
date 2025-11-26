import { sleepPromise } from "src/utils";
import AppVaultsService from "./AppVaultsService";
import AppGlobalState from "../AppGlobalState/AppGlobalState";
import { AppVault } from "src/model/AppVault";
import { GetVaultsResponse } from "src/model/dto/GetVaultsResponse";
import CreateVaultResponse from "src/model/dto/CreateVaultResponse";

const API_URL = "http://localhost:3000/vault";

export default class LocalhostAppVaultsService extends AppVaultsService {
	private _ags: AppGlobalState;

	constructor(ags: AppGlobalState) {
		super();
		this._ags = ags;
	}

	setChosenVault(vaultId: string) {
		this._ags.chosenVaultId.value = vaultId;
	}

	async loadVaults() {
		const creds = this._ags.authCreds.value;
		if (!creds) {
			throw new Error("Cannot load vaults: no auth creds");
		}

		const fetchRes = await fetch(`${API_URL}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${creds.token}`,
			},
		});

		if (!fetchRes.ok) {
			throw new Error(
				`Failed to load vaults with status ${fetchRes.status}`
			);
		}

		const vaultsResponse: GetVaultsResponse = await fetchRes.json();

		const toSet = vaultsResponse.vaults;
		this._ags.vaults.value = toSet;
	}

	async clearVaults(): Promise<void> {
		this._ags.chosenVaultId.value = "";
		this._ags.vaults.value = [];
	}

	async createVault(vaultName: string): Promise<AppVault> {
		const creds = this._ags.authCreds.value;
		if (!creds) {
			throw new Error("Cannot load vaults: no auth creds");
		}

		const fetchRes = await fetch(`${API_URL}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${creds.token}`,
			},
			body: JSON.stringify({ name: vaultName }),
		});

		if (!fetchRes.ok) {
			throw new Error(
				`Failed to load vaults with status ${fetchRes.status}`
			);
		}

		const createVaultRes: CreateVaultResponse = await fetchRes.json();

		const newVault: AppVault = {
			id: createVaultRes.vaultId,
			name: vaultName,
			backups: [],
		};
		this._ags.vaults.value = [...this._ags.vaults.value, newVault];
		return newVault;
	}

	async deleteVault(vaultId: string): Promise<void> {
		const creds = this._ags.authCreds.value;
		if (!creds) {
			throw new Error("Cannot load vaults: no auth creds");
		}

		const fetchRes = await fetch(`${API_URL}/${vaultId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${creds.token}`,
			},
		});

		if (!fetchRes.ok) {
			throw new Error(
				`Failed to load vaults with status ${fetchRes.status}`
			);
		}

		this._ags.vaults.value = this._ags.vaults.value.filter(
			(v) => v.id !== vaultId
		);
		if (this._ags.chosenVaultId.value === vaultId) {
			this._ags.chosenVaultId.value = "";
		}
	}

	async renameVault(vaultId: string, newName: string): Promise<void> {
		const creds = this._ags.authCreds.value;
		if (!creds) {
			throw new Error("Cannot load vaults: no auth creds");
		}

		const fetchRes = await fetch(`${API_URL}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${creds.token}`,
			},
			body: JSON.stringify({ vaultId, newName }),
		});

		if (!fetchRes.ok) {
			throw new Error(
				`Failed to load vaults with status ${fetchRes.status}`
			);
		}

		this._ags.vaults.value = this._ags.vaults.value.map((v) =>
			v.id === vaultId ? { ...v, name: newName } : v
		);
	}

	// MARK: Backups
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
					createdAt: new Date().getTime(),
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
