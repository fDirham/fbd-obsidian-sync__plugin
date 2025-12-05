import { App, PluginManifest } from "obsidian";
import AppPlugin from "./AppPlugin";
import AppSettingTab from "src/AppSettingTab";
import ProdAppGlobalState from "src/services/AppGlobalState/ProdAppGlobalState";
import { AuthStatus } from "src/model/AuthStatus";
// import LocalhostAuthService from "src/services/AuthService/LocalhostAuthService";
// import LocalhostAppVaultsService from "src/services/AppVaultsService/LocalhostAppVaultsService";
import { RIBBON_ICON_SVG } from "src/svgs/ribbonIconSvg";
import DevAuthService from "src/services/AuthService/DevAuthService";
import DevAppVaultsService from "src/services/AppVaultsService/DevAppVaultsService";
import ProdModalOrchestratorService from "src/services/ModalOrchestratorService/ProdModalOrchestratorService";

export default class ProdAppPlugin extends AppPlugin {
	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		const ags = new ProdAppGlobalState(app, this);
		// TODO: switch to localhost services
		// const authService = new LocalhostAuthService(ags);
		// const appVaultsService = new LocalhostAppVaultsService(ags, app);
		const authService = new DevAuthService(ags, app);
		const appVaultsService = new DevAppVaultsService(ags);
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
		await this.appGlobalState.loadAllData();
		await this.authService.load();

		const settingTab = new AppSettingTab(this.app, this);
		this.addSettingTab(settingTab);

		// Ribbon
		const ribbonEl = this.addRibbonIcon("dice", "Vault Manager", () => {
			// @ts-ignore - Obsidian API
			this.app.setting.open();
			// @ts-ignore - Obsidian API
			this.app.setting.openTabById(this.manifest.id);
		});

		ribbonEl.innerHTML = RIBBON_ICON_SVG;

		// For testing
		this.modalOrchestratorService.openConfirmModal(
			"Bros nfgowneoun ok ayf qoewufofq",
			() => {
				console.log("Confirmed");
			},
			() => {
				console.log("Cancelled");
			}
		);
		// // @ts-ignore - Obsidian API
		// this.app.setting.close();
		// // @ts-ignore - Obsidian API
		// this.app.setting.open();
		// // @ts-ignore - Obsidian API
		// this.app.setting.openTabById(this.manifest.id);
	}

	onunload() {}

	onExternalSettingsChange() {
		this.appGlobalState.loadAllData();
	}
}
