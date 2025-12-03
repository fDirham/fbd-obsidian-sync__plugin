import { App, Modal, Setting } from "obsidian";

export default class LogInModal extends Modal {
	constructor(
		app: App,
		onSignUp: () => void,
		onVerify: () => void,
		onResetPassword: () => void,
		onLogIn: (email: string, password: string) => void
	) {
		super(app);

		this.setTitle("Log in");

		let email = "";
		new Setting(this.contentEl).setName("Email").addText((text) =>
			text.onChange((value) => {
				email = value;
			})
		);

		let password = "";
		new Setting(this.contentEl).setName("Password").addText((text) => {
			text.onChange((value) => {
				password = value;
			});

			text.inputEl.type = "password";
		});

		new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Sign up")
					.setCta()
					.onClick(() => {
						onSignUp();
					})
			)
			.addButton((btn) =>
				btn
					.setButtonText("Verify")
					.setCta()
					.onClick(() => {
						onVerify();
					})
			)
			.addButton((btn) =>
				btn
					.setButtonText("Reset password")
					.setCta()
					.onClick(() => {
						onResetPassword();
					})
			);

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Log in")
				.setCta()
				.onClick(() => {
					onLogIn(email, password);
				})
		);
	}
}
