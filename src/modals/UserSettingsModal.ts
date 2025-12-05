import { App, Modal, Setting } from "obsidian";

export default class UserSettingsModal extends Modal {
	constructor(
		app: App,
		email: string | undefined,
		onLogout: () => void,
		onDeleteAccount: () => void
	) {
		super(app);

		this.setTitle("User Settings");
		this.containerEl.classList.add("no-border-settings");

		new Setting(this.contentEl)
			.setName("User: " + (email || "Unknown user"))
			.setHeading();

		new Setting(this.contentEl)
			.addButton((button) =>
				button.setButtonText("Log Out").onClick(() => {
					onLogout();
				})
			)
			.setClass("squished-setting-item");

		new Setting(this.contentEl)
			.addButton((button) =>
				button.setButtonText("Delete Account").onClick(() => {
					onDeleteAccount();
				})
			)
			.setClass("squished-setting-item");
	}
}
