import AppPluginSettings from "./model/AppPluginSettings";
import AppSettingTab from "./AppSettingTab";
import BaseAppPlugin from "./model/BaseAppPlugin";
import { App, PluginManifest } from "obsidian";

const DEFAULT_SETTINGS: AppPluginSettings = {
	mySetting: "default",
};

export default class AppPlugin extends BaseAppPlugin {
	settings: AppPluginSettings;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
	}

	async onload() {
		await this.loadSettings();
		await this.authService.load();

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
