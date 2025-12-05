import { App, Modal, Setting } from "obsidian";

export default class SignUpModal extends Modal {
	constructor(
		app: App,
		onLogIn: () => void,
		onSubmit: (email: string, password: string) => void
	) {
		super(app);

		this.setTitle("Sign up");

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
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					onSubmit(email, password);
				})
		);

		const bottomPartEl = this.contentEl.createDiv({
			cls: "no-border-settings top-border",
		});

		new Setting(bottomPartEl)
			.setClass("squished-setting-item")
			.setDesc("Already have account?")
			.addButton((btn) =>
				btn
					.setButtonText("Log in")
					.onClick(() => {
						onLogIn();
					})
					.setClass("fbd-sync__small-btn")
			);
	}
}
