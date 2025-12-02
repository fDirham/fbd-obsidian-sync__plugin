import { App, Modal, Setting } from "obsidian";

export default class VerifyEmailModal extends Modal {
	constructor(
		app: App,
		inputEmail: string,
		onResendCode: (email: string) => void,
		onSubmit: (email: string, code: string) => void
	) {
		super(app);

		this.setTitle("Verify account");

		let email = inputEmail;

		new Setting(this.contentEl).setName("Email").addText((text) => {
			text.setValue(inputEmail);
			text.onChange((value) => {
				email = value;
			});
		});

		let code = "";
		new Setting(this.contentEl)
			.setName("Verification Code")
			.addText((text) =>
				text.onChange((value) => {
					code = value;
				})
			);

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Resend code")
				.setCta()
				.onClick(() => {
					onResendCode(email);
				})
		);

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					onSubmit(email, code);
				})
		);
	}
}
