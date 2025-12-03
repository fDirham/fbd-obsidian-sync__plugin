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

		this.setTitle("FBD Obsidian Sync Log In");
		const topPartEl = this.contentEl.createDiv({
			cls: "no-border-settings",
		});

		let email = "";
		new Setting(topPartEl).setName("Email").addText((text) =>
			text
				.onChange((value) => {
					email = value;
				})
				.setPlaceholder("your@email.com")
		);

		let password = "";
		new Setting(topPartEl).setName("Password").addText((text) => {
			text.onChange((value) => {
				password = value;
			});
			text.inputEl.type = "password";
		});

		new Setting(topPartEl).addButton((btn) =>
			btn
				.setButtonText("Log in")
				.setCta()
				.onClick(() => {
					onLogIn(email, password);
				})
		);

		const bottomPartEl = this.contentEl.createDiv({
			cls: "no-border-settings top-border",
		});
		new Setting(bottomPartEl)
			.setDesc("No account?")
			.setClass("squished-setting-item")
			.addButton((btn) =>
				btn
					.setButtonText("Sign up")
					.onClick(() => {
						onSignUp();
					})
					.setClass("small-button")
			);

		new Setting(bottomPartEl)
			.setDesc("Need help?")
			.setClass("squished-setting-item")
			.addButton((btn) =>
				btn
					.setButtonText("Reset Password")
					.onClick(() => {
						onResetPassword();
					})
					.setClass("small-button")
			)
			.addButton((btn) =>
				btn
					.setButtonText("Verify Account")
					.onClick(() => {
						onVerify();
					})
					.setClass("small-button")
			);
	}
}
