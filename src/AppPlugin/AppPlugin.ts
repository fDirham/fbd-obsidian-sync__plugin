import { App, Plugin, PluginManifest } from "obsidian";
import AppGlobalState from "src/model/AppGlobalState";
import AppVaultsService from "src/services/AppVaultsService/AppVaultsService";
import AuthService from "src/services/AuthService/AuthService";

export default abstract class AppPlugin extends Plugin {
	private _authService: AuthService;
	private _appVaultsService: AppVaultsService;
	private _appGlobalState: AppGlobalState;

	constructor(
		app: App,
		manifest: PluginManifest,
		appGlobalState: AppGlobalState,
		authService: AuthService,
		appVaultsService: AppVaultsService
	) {
		super(app, manifest);
		this._appGlobalState = appGlobalState;
		this._authService = authService;
		this._appVaultsService = appVaultsService;
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
}
