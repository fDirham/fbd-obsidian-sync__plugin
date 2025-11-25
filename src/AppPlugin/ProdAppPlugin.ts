import { App, PluginManifest } from "obsidian";
import AppPlugin from "./AppPlugin";
import DevAppVaultsService from "src/services/AppVaultsService/DevAppVaultsService";
import DevAuthService from "src/services/AuthService/DevAuthService";
import AppSettingTab from "src/AppSettingTab";
import ProdAppGlobalState from "src/services/AppGlobalState/ProdAppGlobalState";
import { AuthStatus } from "src/model/AuthStatus";
import AppData from "src/model/AppData";

export default class ProdAppPlugin extends AppPlugin {
	constructor(app: App, manifest: PluginManifest) {
		const ags = new ProdAppGlobalState((d) => {
			this.saveAppData(d);
		});
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
		ags.assignDataAndValuesListeners();
	}

	async onload() {
		await this.loadSettings();
		await this.authService.load();

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
