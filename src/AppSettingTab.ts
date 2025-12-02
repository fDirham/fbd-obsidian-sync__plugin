import { App, PluginSettingTab, Setting } from "obsidian";
import LogInModal from "./modals/LogInModal";
import AppPlugin from "./AppPlugin/AppPlugin";
import { AuthStatus } from "./model/AuthStatus";
import NewVaultModal from "./modals/NewVaultModal";
import EditVaultModal from "./modals/EditVaultModal";

export default class AppSettingTab extends PluginSettingTab {
	private _plugin: AppPlugin;

	constructor(app: App, plugin: AppPlugin) {
		super(app, plugin);
		this._plugin = plugin;

		const { authStatus, vaults, chosenVaultId } = plugin.appGlobalState;

		authStatus.addListener("settings", () => {
			this.display();
		});
		vaults.addListener("settings", () => {
			this.display();
		});
		chosenVaultId.addListener("settings", () => {
			this.display();
		});
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).setName("FBD Obsidian Sync").setHeading();

		const { authStatus, vaults, chosenVaultId } =
			this._plugin.appGlobalState;

		switch (authStatus.value) {
			case AuthStatus.LOGGED_OUT: {
				new Setting(containerEl)
					.setName("Not Logged In")
					.addButton((button) =>
						button.setButtonText("Log In").onClick(() => {
							new LogInModal(this.app, this._plugin).open();
						})
					);
				break;
			}
			case AuthStatus.LOGGED_IN: {
				let selectedVaultId = chosenVaultId.value;
				const selectedVault = vaults.value.find(
					(vault) => vault.id === selectedVaultId
				);
				if (!selectedVault && selectedVaultId != "") {
					selectedVaultId = "";
				}
				new Setting(containerEl)
					.setName("Chosen Vault")
					.addDropdown((dropdown) => {
						vaults.value.forEach((vault) => {
							dropdown.addOption(vault.id, vault.name);
						});
						dropdown.addOption("", "None");
						dropdown.addOption("add", "+ Add Vault");
						dropdown.setValue(selectedVaultId);
						dropdown.onChange((value) => {
							if (value === "add") {
								new NewVaultModal(
									this.app,
									this._plugin
								).open();
								return;
							}
							chosenVaultId.value = value;
						});
					});

				if (selectedVault) {
					new Setting(containerEl)
						.setName(selectedVault.name)
						.setHeading()
						.addButton((button) =>
							button.setButtonText("Upload").onClick(() => {
								this._plugin.appVaultsService.uploadBackup(
									selectedVault.id
								);
							})
						);

					selectedVault.backups.forEach((backup) => {
						new Setting(containerEl)
							.setName(`${backup.id}`)
							.setDesc(
								`${new Date(backup.createdAt).toLocaleString()}`
							)
							.addButton((button) =>
								button.setButtonText("Restore").onClick(() => {
									this._plugin.appVaultsService.downloadBackup(
										backup.id
									);
								})
							)
							.addButton((button) =>
								button.setButtonText("Delete").onClick(() => {
									this._plugin.appVaultsService.deleteBackup(
										selectedVault.id,
										backup.id
									);
								})
							);
					});

					new Setting(containerEl)
						.setName("Vault actions")
						.addButton((button) =>
							button.setButtonText("Delete").onClick(() => {
								this._plugin.appVaultsService.deleteVault(
									selectedVault.id
								);
							})
						)
						.addButton((button) =>
							button.setButtonText("Rename").onClick(() => {
								new EditVaultModal(
									this.app,
									this._plugin,
									selectedVault
								).open();
							})
						);
				}

				new Setting(containerEl).setName("").addButton((button) =>
					button.setButtonText("Log Out").onClick(() => {
						this._plugin.authService.logout();
					})
				);

				break;
			}
			case AuthStatus.ERROR: {
				break;
			}
		}
	}
}
