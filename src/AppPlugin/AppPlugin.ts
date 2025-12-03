import { App, Plugin, PluginManifest } from "obsidian";
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
	}

	setDependencies(
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
}
