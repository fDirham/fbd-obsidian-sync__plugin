import { App, PluginSettingTab, Setting } from "obsidian";
import AppPlugin from "./AppPlugin/AppPlugin";
import { AuthStatus } from "./model/AuthStatus";

export default class AppSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: AppPlugin) {
		super(app, plugin);

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
			this.plugin.appGlobalState;

		switch (authStatus.value) {
			case AuthStatus.LOGGED_OUT: {
				new Setting(containerEl)
					.setName("Not Logged In")
					.addButton((button) =>
						button.setButtonText("Log In").onClick(() => {
							this.plugin.modalOrchestratorService.openLogInModal();
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
								this.plugin.modalOrchestratorService.openNewVaultModal();
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
								this.plugin.appVaultsService.uploadBackup(
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
									this.plugin.appVaultsService.downloadBackup(
										backup.id
									);
								})
							)
							.addButton((button) =>
								button.setButtonText("Delete").onClick(() => {
									this.plugin.appVaultsService.deleteBackup(
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
								this.plugin.appVaultsService.deleteVault(
									selectedVault.id
								);
							})
						)
						.addButton((button) =>
							button.setButtonText("Rename").onClick(() => {
								this.plugin.modalOrchestratorService.openEditVaultModal(
									selectedVault
								);
							})
						);
				}

				new Setting(containerEl).setName("").addButton((button) =>
					button.setButtonText("Log Out").onClick(() => {
						this.plugin.authService.logout();
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
