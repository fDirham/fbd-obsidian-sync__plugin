import { AppVault } from "src/model/AppVault";

export default abstract class ModalOrchestratorService {
	abstract openSignUpModal(): void;

	abstract openLogInModal(): void;

	abstract openVerifyEmailModal(email: string): void;

	abstract openAskEmailForVerifyModal(): void;

	abstract openAskEmailForResetPasswordModal(): void;

	abstract openResetPasswordFormModal(email: string): void;

	abstract openNewVaultModal(): void;

	abstract openEditVaultModal(appVault: AppVault): void;

	abstract openConfirmModal(
		description: string,
		onConfirm: () => void,
		onCancel: () => void
	): void;

	abstract openConfirmModalBooleanPromise(
		description: string
	): Promise<boolean>;

	abstract openBehaviorSettingsModal(): void;
}
