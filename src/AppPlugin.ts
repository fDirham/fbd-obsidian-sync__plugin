import { Plugin } from "obsidian";
import AppPluginSettings from "./model/AppPluginSettings";
import AppSettingTab from "./AppSettingTab";

const DEFAULT_SETTINGS: AppPluginSettings = {
	mySetting: "default",
};

export default class AppPlugin extends Plugin {
	settings: AppPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AppSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
