import { App, Modal, Setting } from "obsidian";
import AppPlugin from "src/AppPlugin/AppPlugin";
import { AuthStatus } from "src/model/AuthStatus";
import LogInModal from "./LogInModal";

export default class SignUpModal extends Modal {
	plugin: AppPlugin;

	constructor(app: App, plugin: AppPlugin) {
		super(app);
		this.plugin = plugin;

		this.setTitle("Sign up");

		this.plugin.appGlobalState.authStatus.addListener(
			"signupmodal",
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
				.setButtonText("Log in")
				.setCta()
				.onClick(() => {
					new LogInModal(this.app, this.plugin).open();
					this.close();
				})
		);

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
