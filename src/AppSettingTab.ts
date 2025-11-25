import { App, PluginSettingTab, Setting } from "obsidian";
import LogInModal from "./modals/LogInModal";
import BaseAppPlugin from "./model/BaseAppPlugin";
import { AuthStatus } from "./services/AuthService";

export default class AppSettingTab extends PluginSettingTab {
	plugin: BaseAppPlugin;
	constructor(app: App, plugin: BaseAppPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.plugin.authService.status.addListener("settings", () => {
			this.display();
		});
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).setName("FBD Obsidian Sync").setHeading();

		switch (this.plugin.authService.status.value) {
			case AuthStatus.LOGGED_OUT: {
				new Setting(containerEl)
					.setName("Not Logged In")
					.addButton((button) =>
						button.setButtonText("Log In").onClick(() => {
							new LogInModal(this.app, this.plugin).open();
						})
					);
				break;
			}
			case AuthStatus.LOGGED_IN: {
				new Setting(containerEl).setName("").addButton((button) =>
					button.setButtonText("Log Out").onClick(() => {
						this.plugin.authService.logout();
					})
				);
				break;
			}
			case AuthStatus.ERROR: {
				break;
			}
		}
	}
}
