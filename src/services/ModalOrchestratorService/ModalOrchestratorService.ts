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
}
