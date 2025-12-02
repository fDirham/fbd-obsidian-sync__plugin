import { App, PluginManifest } from "obsidian";
import AppPlugin from "./AppPlugin";
import AppSettingTab from "src/AppSettingTab";
import ProdAppGlobalState from "src/services/AppGlobalState/ProdAppGlobalState";
import { AuthStatus } from "src/model/AuthStatus";
import AppData from "src/model/AppData";
import LocalhostAuthService from "src/services/AuthService/LocalhostAuthService";
import LocalhostAppVaultsService from "src/services/AppVaultsService/LocalhostAppVaultsService";

export default class ProdAppPlugin extends AppPlugin {
	constructor(app: App, manifest: PluginManifest) {
		const ags = new ProdAppGlobalState((d) => {
			this.saveAppData(d);
		});
		const authService = new LocalhostAuthService(ags, app);
		const appVaultsService = new LocalhostAppVaultsService(ags, app);

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
		ags.assignDataAndValuesListeners();
	}

	async onload() {
		await this.loadSettings();
		await this.authService.load();

		// Use this for simple tests
		// this.addRibbonIcon("dice", "Vault Manager", () => {
		// 	// testUpload(this.app);
		// });
		this.addSettingTab(new AppSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		const rawData = (await this.loadData()) as Partial<AppData>;
		const defaultData: AppData = {
			chosenVaultId: "",
		};
		const appData: AppData = {
			...defaultData,
			...rawData,
		};

		this.appGlobalState.onDataLoaded(appData);
	}

	onExternalSettingsChange() {
		this.loadSettings();
	}

	async saveAppData(data: AppData) {
		await this.saveData(data);
	}
}
