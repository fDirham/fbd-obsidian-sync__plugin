import { App, Plugin, PluginManifest } from "obsidian";
import AppSettingTab from "src/AppSettingTab";
import { AuthStatus } from "src/model/AuthStatus";
import AppGlobalState from "src/services/AppGlobalState/AppGlobalState";
import AppVaultsService from "src/services/AppVaultsService/AppVaultsService";
import AuthService from "src/services/AuthService/AuthService";
import ModalOrchestratorService from "src/services/ModalOrchestratorService/ModalOrchestratorService";

export default abstract class AppPlugin extends Plugin {
	private _authService: AuthService;
	private _appVaultsService: AppVaultsService;
	private _appGlobalState: AppGlobalState;
	private _modalOrchestratorService: ModalOrchestratorService;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		const [
			appGlobalState,
			authService,
			appVaultsService,
			modalOrchestratorService,
		] = this.getDependencies();

		this.setDependencies(
			appGlobalState,
			authService,
			appVaultsService,
			modalOrchestratorService
		);
	}

	private setDependencies(
		appGlobalState: AppGlobalState,
		authService: AuthService,
		appVaultsService: AppVaultsService,
		modalOrchestratorService: ModalOrchestratorService
	) {
		this._appGlobalState = appGlobalState;
		this._authService = authService;
		this._appVaultsService = appVaultsService;
		this._modalOrchestratorService = modalOrchestratorService;
	}

	abstract getDependencies(): [
		AppGlobalState,
		AuthService,
		AppVaultsService,
		ModalOrchestratorService
	];

	get authService() {
		return this._authService;
	}

	get appVaultsService() {
		return this._appVaultsService;
	}

	get appGlobalState() {
		return this._appGlobalState;
	}

	get modalOrchestratorService() {
		return this._modalOrchestratorService;
	}

	async onload() {
		// Register listeners
		this.appGlobalState.authStatus.addListener(
			"loadAndClearVaultsOnAuth",
			(oldVal, newVal) => {
				if (newVal == AuthStatus.LOGGED_IN) {
					this.appVaultsService.loadVaults();
				} else {
					this.appVaultsService.clearVaults();
				}
			}
		);
		this.appGlobalState.assignDataAndValuesListeners();
		this.appGlobalState.assignOnlineStatusListeners();

		this.appGlobalState.loadAllLocalStorage();
		await this.appGlobalState.loadAllData();
		await this.authService.load();

		const settingTab = new AppSettingTab(this.app, this);
		this.addSettingTab(settingTab);

		// Ribbon
		this.addRibbonIcon("sync", "FBD Sync", () => {
			// @ts-ignore - Obsidian API
			this.app.setting.open();
			// @ts-ignore - Obsidian API
			this.app.setting.openTabById(this.manifest.id);
		});

		await this.afterBaseOnload();
	}

	async afterBaseOnload() {}

	onunload() {}

	onExternalSettingsChange() {
		this.appGlobalState.loadAllData();
	}
}
