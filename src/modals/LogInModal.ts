import { App, Modal, Setting } from "obsidian";
import BaseAppPlugin from "src/model/BaseAppPlugin";
import { AuthStatus } from "src/services/AuthService";

export default class LogInModal extends Modal {
	plugin: BaseAppPlugin;

	constructor(app: App, plugin: BaseAppPlugin) {
		super(app);
		this.plugin = plugin;

		this.setTitle("Log in");

		this.plugin.authService.status.addListener(
			"loginmodal",
			(_, newVal) => {
				if (newVal != AuthStatus.LOGGED_OUT) {
					this.close();
				}
			}
		);

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
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.onSubmit(email, password);
				})
		);
	}

	async onSubmit(email: string, password: string) {
		await this.plugin.authService.login(email, password);
	}
}
