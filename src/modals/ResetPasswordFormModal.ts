import { App, Modal, Setting } from "obsidian";

export default class ResetPasswordFormModal extends Modal {
	constructor(
		app: App,
		inputEmail: string,
		onResendCode: (email: string) => void,
		onSubmit: (email: string, newPassword: string, code: string) => void
	) {
		super(app);

		this.setTitle("Verify account");
		this.containerEl.classList.add("no-border-settings");

		let email = inputEmail;

		new Setting(this.contentEl).setName("Email").addText((text) => {
			text.setValue(inputEmail);
			text.onChange((value) => {
				email = value;
			});
		});

		let password = "";
		new Setting(this.contentEl).setName("New password").addText((text) => {
			text.onChange((value) => {
				password = value;
			});

			text.inputEl.type = "password";
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
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					onSubmit(email, password, code);
				})
		);

		const bottomEl = this.contentEl.createDiv({ cls: "top-border" });

		new Setting(bottomEl)
			.setClass("squished-setting-item")
			.setDesc("Didn't receive the code?")
			.addButton((btn) =>
				btn.setButtonText("Resend code").onClick(() => {
					onResendCode(email);
				})
			);
	}
}
