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
} from "./ProdUtils";
import { typedFetch } from "src/utils";
import { CreateVaultRequest } from "src/model/dto/CreateVaultRequest";
import { RenameVaultRequest } from "src/model/dto/RenameVaultRequest";
import { StartBackupRequest } from "src/model/dto/StartBackupRequest";
import { CheckBackupRequest } from "src/model/dto/CheckBackupRequest";
import { DeleteBackupQueryParams } from "src/model/dto/DeleteBackupQueryParams";
import { GetBackupUrlResponse } from "src/model/dto/GetBackupUrlResponse";
import { GetBackupUrlQueryParams } from "src/model/dto/GetBackupUrlQueryParams";
import AppAPIRoutes from "src/model/AppAPIRoutes";

export default class ProdAppVaultsService extends AppVaultsService {
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

		const vaultsResponse = await typedFetch<never, GetVaultsResponse>(
			AppAPIRoutes.VAULTS,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${creds.token}`,
				},
			}
		);

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

		const createVaultRes = await typedFetch<
			CreateVaultRequest,
			CreateVaultResponse
		>(
			AppAPIRoutes.VAULTS,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${creds.token}`,
				},
			},
			{ name: vaultName }
		);

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

		await typedFetch<never, void>(AppAPIRoutes.VAULT_BY_ID(vaultId), {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${creds.token}`,
			},
		});

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

		await typedFetch<RenameVaultRequest, void>(
			AppAPIRoutes.VAULTS,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${creds.token}`,
				},
			},
			{ vaultId, newName }
		);

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

		const downloadBackupRes = await typedFetch<
			never,
			GetBackupUrlResponse,
			GetBackupUrlQueryParams
		>(
			AppAPIRoutes.BACKUP,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${creds.token}`,
				},
			},
			null,
			{ b: backupId }
		);
		console.debug("Fetched download URL");
		const downloadUrl = downloadBackupRes.downloadUrl;

		const tmpFilePath = normalizePath(`/vault-backup-${backupId}.zip`);

		await deleteAllVaultFiles(this._app);
		console.debug("Cleared vault files");

		await downloadVaultZip(this._app, downloadUrl, tmpFilePath);

		console.debug("Downloaded to:", tmpFilePath);

		await extractZipToVault(this._app, tmpFilePath, "/");
		console.debug("Extracted backup to vault");

		await this._app.vault.adapter.remove(tmpFilePath);
		console.debug("Removed temp file:", tmpFilePath);

		console.groupEnd();
	}

	async deleteBackup(vaultId: string, backupId: string): Promise<void> {
		const creds = this._ags.authCreds.value;
		if (!creds) {
			throw new Error("Cannot load vaults: no auth creds");
		}

		await typedFetch<never, void, DeleteBackupQueryParams>(
			AppAPIRoutes.BACKUP,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${creds.token}`,
				},
			},
			null,
			{ b: backupId }
		);

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

		const startBackupRes = await typedFetch<
			StartBackupRequest,
			StartBackupResponse
		>(
			AppAPIRoutes.BACKUP,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${creds.token}`,
				},
			},
			{ vaultId }
		);

		await uploadVaultZip(this._app, startBackupRes.presignedUrl);

		const checkVaultBackupsRes = await typedFetch<
			CheckBackupRequest,
			CheckVaultBackupsResponse
		>(
			AppAPIRoutes.CHECK_BACKUP,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${creds.token}`,
				},
			},
			{ vaultId }
		);

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
