import { App } from "obsidian";
import AskEmailModal from "./AskEmailModal";

export default class AskEmailForResetPasswordModal extends AskEmailModal {
	constructor(app: App, onSubmit: (email: string) => void) {
		const title = "Enter email to reset password";
		const subtitle =
			"Please enter the email associated with your account to receive a password reset code.";
		super(app, title, subtitle, onSubmit);
	}
}
