import { App, Modal, Setting } from "obsidian";

export default class SignUpModal extends Modal {
	constructor(
		app: App,
		onLogIn: () => void,
		onSubmit: (email: string, password: string) => void
	) {
		super(app);

		this.setTitle("Sign up");

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

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Log in")
				.setCta()
				.onClick(() => {
					onLogIn();
				})
		);

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					onSubmit(email, password);
				})
		);
	}
}
