import { App, PluginSettingTab, Setting } from "obsidian";
import AppPlugin from "./AppPlugin/AppPlugin";
import { AuthStatus } from "./model/AuthStatus";
import { GEAR_ICON_SVG } from "./svgs/gearIconSvg";
import { DELETE_ICON_SVG } from "./svgs/deleteIconSvg";
import { AppVault } from "./model/AppVault";

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

		const { authStatus } = this.plugin.appGlobalState;

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
				this.displayLoggedIn(containerEl);
				break;
			}
			case AuthStatus.ERROR: {
				break;
			}
		}
	}

	private displayLoggedIn(containerEl: HTMLElement): void {
		const { chosenVaultId, vaults, authCreds } = this.plugin.appGlobalState;
		containerEl.classList.add("no-border-settings");

		const email = authCreds.value?.email || "Unknown user";

		// User info and logout
		new Setting(containerEl)
			.setName(email)
			.addButton((button) =>
				button
					.setButtonText("User settings")
					.onClick(() => {
						this.plugin.modalOrchestratorService.openUserSettingsModal();
					})
					.setClass("fbd-sync__small-btn")
			)
			.addButton((button) =>
				button
					.setButtonText("Behavior settings")
					.onClick(() => {
						this.plugin.modalOrchestratorService.openBehaviorSettingsModal();
					})
					.setClass("fbd-sync__small-btn")
			);

		let selectedVaultId = chosenVaultId.value;
		const selectedVault = vaults.value.find(
			(vault) => vault.id === selectedVaultId
		);
		if (!selectedVault && selectedVaultId != "") {
			selectedVaultId = "";
		}

		// Chosen container
		const chosenContainerEl = containerEl.createEl("div", {
			cls: "settings-logged-in__chosen-container",
		});
		const gearButtonEl = chosenContainerEl.createEl("button", {
			attr: { title: "Settings" },
			cls: "clickable-icon settings-logged-in__gear-button",
		});
		gearButtonEl.disabled = !selectedVault;
		const gearIconEl = gearButtonEl.createSvg("svg");
		gearIconEl.innerHTML = GEAR_ICON_SVG;
		gearIconEl.addClass("settings-logged-in__gear-icon");
		gearButtonEl.onclick = () => {
			if (!selectedVault) return;
			this.plugin.modalOrchestratorService.openEditVaultModal(
				selectedVault
			);
		};

		const selectEl = chosenContainerEl.createEl("select", {
			cls: "dropdown",
		});
		let optionsHtml = "";

		optionsHtml += `<option value="" disabled hidden ${
			selectedVaultId == "" ? "selected" : ""
		}>None</option>`;
		optionsHtml += `<option value="add">+ Add Vault</option>`;

		vaults.value.forEach((vault) => {
			optionsHtml += `<option value="${vault.id}" ${
				selectedVaultId == vault.id ? "selected" : ""
			}>${vault.name}</option>`;
		});
		selectEl.onchange = (e) => {
			//@ts-ignore
			const value: string = e.target.value;

			if (value === "add") {
				this.plugin.modalOrchestratorService.openNewVaultModal();
				return;
			}
			chosenVaultId.value = value;
		};
		selectEl.innerHTML = optionsHtml;

		// Selected vault
		if (selectedVault) {
			const restoreBar = new Setting(containerEl)
				.addButton((button) =>
					button
						.setButtonText("Restore Latest")
						.setDisabled(selectedVault.backups.length === 0)
						.onClick(() => {
							this.userDownloadLatestBackup(selectedVault);
						})
						.setClass("fbd-sync__download-btn")
						.setClass("fbd-sync__full-width")
				)
				.addButton((button) =>
					button
						.setButtonText("Upload")
						.onClick(() => {
							this.userUploadBackup(selectedVault.id);
						})
						.setClass("fbd-sync__upload-btn")
						.setClass("fbd-sync__full-width")
				);
			restoreBar.controlEl.classList.add(
				"settings-logged-in__restore-bar"
			);
			restoreBar.infoEl.hide();

			selectedVault.backups.forEach((backup) => {
				new Setting(containerEl)
					.setName(`${new Date(backup.createdAt).toLocaleString()}`)
					.addButton((button) =>
						button
							.setButtonText("Restore")
							.onClick(() => {
								this.userDownloadSpecificBackup(backup.id);
							})
							.setClass("fbd-sync__download-btn")
					)
					.addButton((button) => {
						const deleteIconEl = button.buttonEl.createSvg("svg");
						deleteIconEl.innerHTML = DELETE_ICON_SVG;
						deleteIconEl.addClass("fbd-sync__btn__icon");

						button
							.onClick(() => {
								this.userDeleteBackup(
									selectedVault.id,
									backup.id
								);
							})
							.setClass("fbd-sync__delete-btn");
					});
			});
		}
	}

	private async userDownloadLatestBackup(selectedVault: AppVault) {
		const confirmed =
			!this.plugin.appGlobalState.confirmRestoreLatestBackup ||
			(await this.plugin.modalOrchestratorService.openConfirmModalBooleanPromise(
				"Are you sure you want to restore the latest backup? This will overwrite your current vault data."
			));

		if (confirmed) {
			const latestBackup = selectedVault.backups.reduce((prev, current) =>
				prev.createdAt > current.createdAt ? prev : current
			);
			this.plugin.appVaultsService.downloadBackup(latestBackup.id);
		}
	}

	private async userUploadBackup(vaultId: string) {
		const confirmed =
			!this.plugin.appGlobalState.confirmUpload ||
			(await this.plugin.modalOrchestratorService.openConfirmModalBooleanPromise(
				"Are you sure you want to upload a new backup? This will not overwrite any existing backups."
			));

		if (confirmed) this.plugin.appVaultsService.uploadBackup(vaultId);
	}

	private async userDownloadSpecificBackup(backupId: string) {
		const confirmed =
			!this.plugin.appGlobalState.confirmRestoreSpecificBackup ||
			(await this.plugin.modalOrchestratorService.openConfirmModalBooleanPromise(
				"Are you sure you want to restore this backup? This will overwrite your current vault data."
			));

		if (confirmed) this.plugin.appVaultsService.downloadBackup(backupId);
	}

	private async userDeleteBackup(vaultId: string, backupId: string) {
		const confirmed =
			!this.plugin.appGlobalState.confirmDeleteBackup ||
			(await this.plugin.modalOrchestratorService.openConfirmModalBooleanPromise(
				"Are you sure you want to delete this backup? This action cannot be undone."
			));

		if (confirmed)
			this.plugin.appVaultsService.deleteBackup(vaultId, backupId);
	}
}
