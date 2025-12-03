import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import LogInModal from "./modals/LogInModal";
import AppPlugin from "./AppPlugin/AppPlugin";
import { AuthStatus } from "./model/AuthStatus";
import NewVaultModal from "./modals/NewVaultModal";
import EditVaultModal from "./modals/EditVaultModal";
import SignUpModal from "./modals/SignUpModal";
import VerifyEmailModal from "./modals/VerifyEmailModal";
import AskEmailForVerifyModal from "./modals/AskEmailForVerifyModal";
import AskEmailForResetPasswordModal from "./modals/AskEmailForResetPasswordModal";
import ResetPasswordFormModal from "./modals/ResetPasswordFormModal";

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
							this.openLogInModal();
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

	private openLogInModal() {
		const loginModal = new LogInModal(
			this.app,
			() => {
				loginModal.close();
				this.openSignUpModal();
			},
			() => {
				loginModal.close();
				this.openAskEmailForVerifyModal();
			},
			() => {
				loginModal.close();
				this.openAskEmailForResetPasswordModal();
			},
			async (email, password) => {
				try {
					const { isVerified } = await this._plugin.authService.login(
						email,
						password
					);
					if (!isVerified) {
						new Notice(
							"Please verify your email before logging in."
						);
						return;
					}
					loginModal.close();
				} catch (e) {
					new Notice("Login failed: " + (e as Error).message);
				}
			}
		);
		loginModal.open();
	}

	private openSignUpModal() {
		const signUpModal = new SignUpModal(
			this.app,
			() => {
				signUpModal.close();
				this.openLogInModal();
			},
			async (email, password) => {
				try {
					await this._plugin.authService.signUp(email, password);
					signUpModal.close();
					new Notice("Email confirmation sent!");
					this.openVerifyEmailModal(email);
				} catch (e) {
					new Notice("Sign up failed: " + (e as Error).message);
				}
			}
		);
		signUpModal.open();
	}

	private openAskEmailForVerifyModal() {
		const modal = new AskEmailForVerifyModal(this.app, async (email) => {
			try {
				await this._plugin.authService.sendVerificationEmail(email);
				new Notice("Verification email sent!");
				modal.close();
				this.openVerifyEmailModal(email);
			} catch (e) {
				new Notice("Send failed: " + (e as Error).message);
			}
		});
		modal.open();
	}

	private openVerifyEmailModal(email: string) {
		const modal = new VerifyEmailModal(
			this.app,
			email,
			async (email) => {
				try {
					await this._plugin.authService.sendVerificationEmail(email);
					new Notice("Verification email sent!");
				} catch (e) {
					new Notice("Resend failed: " + (e as Error).message);
				}
			},
			async (email, code) => {
				try {
					await this._plugin.authService.confirmVerify(email, code);
					modal.close();
					new Notice("Email verified! You can now log in.");
					this.openLogInModal();
				} catch (e) {
					new Notice("Verification failed: " + (e as Error).message);
				}
			}
		);

		modal.open();
	}

	private openAskEmailForResetPasswordModal() {
		const modal = new AskEmailForResetPasswordModal(
			this.app,
			async (email) => {
				try {
					await this._plugin.authService.sendResetPasswordEmail(
						email
					);
					new Notice("Reset password email sent!");
					modal.close();
					this.openResetPasswordFormModal(email);
				} catch (e) {
					new Notice("Send failed: " + (e as Error).message);
				}
			}
		);
		modal.open();
	}

	private openResetPasswordFormModal(email: string) {
		const modal = new ResetPasswordFormModal(
			this.app,
			email,
			async (email: string) => {
				try {
					await this._plugin.authService.sendResetPasswordEmail(
						email
					);
					new Notice("Reset password email sent!");
				} catch (e) {
					new Notice("Send failed: " + (e as Error).message);
				}
			},
			async (email, code, newPassword) => {
				try {
					await this._plugin.authService.confirmResetPassword(
						email,
						code,
						newPassword
					);
					modal.close();
					new Notice("Password reset! You can now log in.");
					this.openLogInModal();
				} catch (e) {
					new Notice("Reset failed: " + (e as Error).message);
				}
			}
		);
		modal.open();
	}
}
