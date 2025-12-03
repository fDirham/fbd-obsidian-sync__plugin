import { App } from "obsidian";
import AskEmailModal from "./AskEmailModal";

export default class AskEmailForVerifyModal extends AskEmailModal {
	constructor(app: App, onSubmit: (email: string) => void) {
		const title = "Enter email to verify";
		const subtitle =
			"Please enter the email associated with your account to receive a verification code.";
		super(app, title, subtitle, onSubmit);
	}
}
