import { sleepPromise } from "src/utils";
import AppVaultsService from "./AppVaultsService";
import AppGlobalState from "../AppGlobalState/AppGlobalState";
import { AppVault } from "src/model/AppVault";
import { GetVaultsResponse } from "src/model/dto/GetVaultsResponse";
import CreateVaultResponse from "src/model/dto/CreateVaultResponse";
import { StartBackupResponse } from "src/model/dto/StartBackupResponse";
import { App, normalizePath } from "obsidian";
import { CheckVaultBackupsResponse } from "src/model/dto/CheckVaultBackupsResponse";
import {
	deleteAllVaultFiles,
	downloadVaultZip,
	extractZipToVault,
	uploadVaultZip,
} from "./LocalhostUtils";
import { DownloadBackupResponse } from "src/model/dto/DownloadBackupResponse";

const API_URL = "http://localhost:3000/vault";

export default class LocalhostAppVaultsService extends AppVaultsService {
	private _ags: AppGlobalState;
	private _app: App;

	constructor(ags: AppGlobalState, app: App) {
		super();
		this._ags = ags;
		this._app = app;
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
	async downloadBackup(backupId: string) {
		console.group("Downloading backup: " + backupId);

		const creds = this._ags.authCreds.value;
		if (!creds) {
			throw new Error("Cannot load vaults: no auth creds");
		}

		const downloadBackupFetchRes = await fetch(
			`${API_URL}/backup?b=${backupId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${creds.token}`,
				},
			}
		);

		if (!downloadBackupFetchRes.ok) {
			throw new Error(
				`Failed to load vaults with status ${downloadBackupFetchRes.status}`
			);
		}
		console.info("Fetched download URL");

		const downloadBackupRes: DownloadBackupResponse =
			await downloadBackupFetchRes.json();
		const downloadUrl = downloadBackupRes.downloadUrl;

		const tmpFilePath = normalizePath(`/vault-backup-${backupId}.zip`);

		await deleteAllVaultFiles(this._app);
		console.info("Cleared vault files");

		await downloadVaultZip(this._app, downloadUrl, tmpFilePath);

		console.info("Downloaded to:", tmpFilePath);

		await extractZipToVault(this._app, tmpFilePath, "/");
		console.info("Extracted backup to vault");

		await this._app.vault.adapter.remove(tmpFilePath);
		console.info("Removed temp file:", tmpFilePath);

		console.groupEnd();
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
		const creds = this._ags.authCreds.value;
		if (!creds) {
			throw new Error("Cannot load vaults: no auth creds");
		}

		const startBackupFetchRes = await fetch(`${API_URL}/backup`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${creds.token}`,
			},
			body: JSON.stringify({ vaultId }),
		});

		if (!startBackupFetchRes.ok) {
			throw new Error(
				`Failed to load vaults with status ${startBackupFetchRes.status}`
			);
		}

		const startBackupRes: StartBackupResponse =
			await startBackupFetchRes.json();

		await uploadVaultZip(this._app, startBackupRes.presignedUrl, (prog) => {
			console.log("Upload progress:", prog);
		});

		const checkVaultBackupsFetchRes = await fetch(`${API_URL}/check`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${creds.token}`,
			},
			body: JSON.stringify({ vaultId }),
		});

		if (!checkVaultBackupsFetchRes.ok) {
			throw new Error(
				`Failed to load vaults with status ${checkVaultBackupsFetchRes.status}`
			);
		}

		const checkVaultBackupsRes: CheckVaultBackupsResponse =
			await checkVaultBackupsFetchRes.json();

		const vault = checkVaultBackupsRes.vault;

		const vaults = this._ags.vaults.value;
		this._ags.vaults.value = vaults.map((v): AppVault => {
			if (v.id === vaultId) {
				return vault;
			}
			return v;
		});
	}
}
