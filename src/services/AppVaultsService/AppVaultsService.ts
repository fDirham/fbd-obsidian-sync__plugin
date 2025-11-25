export default abstract class AppVaultsService {
	abstract loadVaults(): Promise<void>;
	abstract clearVaults(): Promise<void>;
	abstract downloadBackup(vaultId: string, backupId: string): Promise<void>;
	abstract setChosenVault(vaultId: string): void;
}
