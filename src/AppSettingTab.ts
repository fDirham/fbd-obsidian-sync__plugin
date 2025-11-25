import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import LogInModal from "./modals/LogInModal";

export default class AppSettingTab extends PluginSettingTab {
	constructor(app: App, plugin: Plugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).setName("FBD Obsidian Sync").setHeading();
		new Setting(containerEl).setName("Not Logged In").addButton((button) =>
			button.setButtonText("Log In").onClick(() => {
				new LogInModal(this.app).open();
			})
		);
	}
}
