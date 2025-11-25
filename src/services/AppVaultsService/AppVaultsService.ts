import { AppVault } from "src/model/AppVault";

export default abstract class AppVaultsService {
	abstract loadVaults(): Promise<void>;
	abstract clearVaults(): Promise<void>;
	abstract setChosenVault(vaultId: string): void;
	abstract createVault(vaultName: string): Promise<AppVault>;
	abstract deleteVault(vaultId: string): Promise<void>;
	abstract renameVault(vaultId: string, newName: string): Promise<void>;
	abstract downloadBackup(vaultId: string, backupId: string): Promise<void>;
	abstract deleteBackup(vaultId: string, backupId: string): Promise<void>;
}
