export interface ConfirmResetPasswordRequest {
	email: string;
	newPassword: string;
	code: string;
}
