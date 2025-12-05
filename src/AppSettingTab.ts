import { App, PluginSettingTab, Setting } from "obsidian";
import AppPlugin from "./AppPlugin/AppPlugin";
import { AuthStatus } from "./model/AuthStatus";
import { decodeJwt } from "./utils";
import { GEAR_ICON_SVG } from "./svgs/gearIconSvg";
import { DELETE_ICON_SVG } from "./svgs/deleteIconSvg";

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

	displayLoggedIn(containerEl: HTMLElement): void {
		const { chosenVaultId, vaults, authCreds } = this.plugin.appGlobalState;
		containerEl.classList.add("no-border-settings");

		let email = "Unknown User";
		try {
			const decoded = decodeJwt(authCreds.value?.idToken || "");
			email = decoded["email"] as string;
		} catch (e) {
			console.error("Failed to decode JWT", e);
		}

		// User info and logout
		new Setting(containerEl).setName(email).addButton((button) =>
			button.setButtonText("Log Out").onClick(() => {
				this.plugin.authService.logout();
			})
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
							const latestBackup = selectedVault.backups.reduce(
								(prev, current) =>
									prev.createdAt > current.createdAt
										? prev
										: current
							);
							this.plugin.appVaultsService.downloadBackup(
								latestBackup.id
							);
						})
						.setClass("fbd-sync__download-btn")
						.setClass("fbd-sync__full-width")
				)
				.addButton((button) =>
					button
						.setButtonText("Upload")
						.onClick(() => {
							this.plugin.appVaultsService.uploadBackup(
								selectedVault.id
							);
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
								this.plugin.appVaultsService.downloadBackup(
									backup.id
								);
							})
							.setClass("fbd-sync__download-btn")
					)
					.addButton((button) => {
						const deleteIconEl = button.buttonEl.createSvg("svg");
						deleteIconEl.innerHTML = DELETE_ICON_SVG;
						deleteIconEl.addClass("fbd-sync__btn__icon");

						button
							.onClick(() => {
								this.plugin.appVaultsService.deleteBackup(
									selectedVault.id,
									backup.id
								);
							})
							.setClass("fbd-sync__delete-btn");
					});
			});
		}
	}
}
