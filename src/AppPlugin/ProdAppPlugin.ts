import { App, PluginManifest } from "obsidian";
import AppPlugin from "./AppPlugin";
import DevAppVaultsService from "src/services/AppVaultsService/DevAppVaultsService";
import DevAuthService from "src/services/AuthService/DevAuthService";
import AppGlobalState, { AuthStatus } from "src/model/AppGlobalState";
import AppSettingTab from "src/AppSettingTab";

export default class ProdAppPlugin extends AppPlugin {
	constructor(app: App, manifest: PluginManifest) {
		const ags = new AppGlobalState();
		const authService = new DevAuthService(ags, app);
		const appVaultsService = new DevAppVaultsService(ags);

		super(app, manifest, ags, authService, appVaultsService);

		// Register listeners
		ags.authStatus.addListener(
			"loadAndClearVaultsOnAuth",
			(oldVal, newVal) => {
				if (newVal == AuthStatus.LOGGED_IN) {
					this.appVaultsService.loadVaults();
				} else {
					this.appVaultsService.clearVaults();
				}
			}
		);
	}

	async onload() {
		await this.loadSettings();
		await this.authService.load();

		this.addSettingTab(new AppSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		// this.settings = Object.assign(
		// 	{},
		// 	DEFAULT_SETTINGS,
		// 	await this.loadData()
		// );
	}

	async saveSettings() {
		// await this.saveData(this.settings);
	}
}
