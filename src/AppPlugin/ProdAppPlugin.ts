import { App, PluginManifest } from "obsidian";
import AppPlugin from "./AppPlugin";
import AppSettingTab from "src/AppSettingTab";
import ProdAppGlobalState from "src/services/AppGlobalState/ProdAppGlobalState";
import { AuthStatus } from "src/model/AuthStatus";
import AppData from "src/model/AppData";
import LocalhostAuthService from "src/services/AuthService/LocalhostAuthService";
import LocalhostAppVaultsService from "src/services/AppVaultsService/LocalhostAppVaultsService";
import { RIBBON_ICON_SVG } from "src/ribbonIconSvg";
import ProdModalOrchestratorService from "src/services/ModalOrchestratorService/ProdModalOrchestratorService";

export default class ProdAppPlugin extends AppPlugin {
	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		const ags = new ProdAppGlobalState(app, this);
		const modalOrchestratorService = new ProdModalOrchestratorService(
			app,
			authService,
			appVaultsService,
			ags
		);
		this.setDependencies(
			ags,
			authService,
			appVaultsService,
			modalOrchestratorService
		);

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
		this.appGlobalState.loadAllLocalStorage();
		await this.loadSettings();
		await this.authService.load();

		const settingTab = new AppSettingTab(this.app, this);
		this.addSettingTab(settingTab);

		const ribbonEl = this.addRibbonIcon("dice", "Vault Manager", () => {
			// @ts-ignore - Obsidian API
			this.app.setting.open();
			// @ts-ignore - Obsidian API
			this.app.setting.openTabById(this.manifest.id);
		});

		ribbonEl.innerHTML = RIBBON_ICON_SVG;
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
}
