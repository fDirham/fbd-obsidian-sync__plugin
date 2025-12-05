import LogInModal from "src/modals/LogInModal";
import ModalOrchestratorService from "./ModalOrchestratorService";
import { App, Notice } from "obsidian";
import AuthService from "../AuthService/AuthService";
import SignUpModal from "src/modals/SignUpModal";
import AskEmailForVerifyModal from "src/modals/AskEmailForVerifyModal";
import VerifyEmailModal from "src/modals/VerifyEmailModal";
import AskEmailForResetPasswordModal from "src/modals/AskEmailForResetPasswordModal";
import ResetPasswordFormModal from "src/modals/ResetPasswordFormModal";
import NewVaultModal from "src/modals/NewVaultModal";
import EditVaultModal from "src/modals/EditVaultModal";
import AppVaultsService from "../AppVaultsService/AppVaultsService";
import AppGlobalState from "../AppGlobalState/AppGlobalState";
import { AppVault } from "src/model/AppVault";
import ConfirmModal from "src/modals/ConfirmModal";

export default class ProdModalOrchestratorService extends ModalOrchestratorService {
	constructor(
		private app: App,
		private authService: AuthService,
		private appVaultsService: AppVaultsService,
		private appGlobalState: AppGlobalState
	) {
		super();
	}

	public openLogInModal() {
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
					const { isVerified } = await this.authService.login(
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

	public openSignUpModal() {
		const signUpModal = new SignUpModal(
			this.app,
			() => {
				signUpModal.close();
				this.openLogInModal();
			},
			async (email, password) => {
				try {
					await this.authService.signUp(email, password);
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

	public openAskEmailForVerifyModal() {
		const modal = new AskEmailForVerifyModal(this.app, async (email) => {
			try {
				await this.authService.sendVerificationEmail(email);
				new Notice("Verification email sent!");
				modal.close();
				this.openVerifyEmailModal(email);
			} catch (e) {
				new Notice("Send failed: " + (e as Error).message);
			}
		});
		modal.open();
	}

	public openVerifyEmailModal(email: string) {
		const modal = new VerifyEmailModal(
			this.app,
			email,
			async (email) => {
				try {
					await this.authService.sendVerificationEmail(email);
					new Notice("Verification email sent!");
				} catch (e) {
					new Notice("Resend failed: " + (e as Error).message);
				}
			},
			async (email, code) => {
				try {
					await this.authService.confirmVerify(email, code);
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

	public openAskEmailForResetPasswordModal() {
		const modal = new AskEmailForResetPasswordModal(
			this.app,
			async (email) => {
				try {
					await this.authService.sendResetPasswordEmail(email);
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

	public openResetPasswordFormModal(email: string) {
		const modal = new ResetPasswordFormModal(
			this.app,
			email,
			async (email: string) => {
				try {
					await this.authService.sendResetPasswordEmail(email);
					new Notice("Reset password email sent!");
				} catch (e) {
					new Notice("Send failed: " + (e as Error).message);
				}
			},
			async (email, code, newPassword) => {
				try {
					await this.authService.confirmResetPassword(
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

	openNewVaultModal(): void {
		if (this.appGlobalState.vaults.value.length >= 5) {
			new Notice("Maximum number of vaults reached (5).");
			return;
		}

		const modal = new NewVaultModal(this.app, async (name: string) => {
			const newVault = await this.appVaultsService.createVault(name);
			this.appVaultsService.setChosenVault(newVault.id);
			modal.close();
		});

		modal.open();
	}

	openEditVaultModal(appVault: AppVault): void {
		const modal = new EditVaultModal(
			this.app,
			appVault,
			async (newName: string) => {
				newName = newName.trim();
				if (!newName) {
					new Notice("Vault name cannot be empty.");
					return;
				}
				if (newName.length > 50) {
					new Notice("Vault name cannot exceed 50 characters.");
					return;
				}

				await this.appVaultsService.renameVault(appVault.id, newName);
				modal.close();
			},
			async (vaultId: string) => {
				await this.appVaultsService.deleteVault(vaultId);
				modal.close();
			}
		);

		modal.open();
	}

	openConfirmModal(
		description: string,
		onConfirm: () => void,
		onCancel: () => void
	): void {
		const modal = new ConfirmModal(
			this.app,
			description,
			() => {
				onConfirm();
			},
			() => {
				onCancel();
			}
		);

		modal.open();
	}
}
