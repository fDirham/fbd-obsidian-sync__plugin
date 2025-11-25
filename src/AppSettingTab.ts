import { App, PluginSettingTab, Setting } from "obsidian";
import LogInModal from "./modals/LogInModal";
import AppPlugin from "./AppPlugin/AppPlugin";
import { AuthStatus } from "./model/AppGlobalState";

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
				const selectedVaultId = chosenVaultId.value;
				const selectedVault = vaults.value.find(
					(vault) => vault.id === selectedVaultId
				);
				new Setting(containerEl)
					.setName("Chosen Vault")
					.addDropdown((dropdown) => {
						vaults.value.forEach((vault) => {
							dropdown.addOption(vault.id, vault.name);
						});
						dropdown.addOption("", "None");
						dropdown.setValue(selectedVaultId);
						dropdown.onChange((value) => {
							chosenVaultId.value = value;
						});
					});

				if (selectedVault) {
					selectedVault.backups.forEach((backup) => {
						new Setting(containerEl)
							.setName(`${backup.id}`)
							.setDesc(`${backup.createdAt.toLocaleString()}`)
							.addButton((button) =>
								button.setButtonText("Restore").onClick(() => {
									console.log(
										"Back up restore clicked for",
										backup.id
									);
								})
							);
					});
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
