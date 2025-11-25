import { App, Plugin, PluginManifest } from "obsidian";
import AppVaultsService from "src/services/AppVaultsService";
import AuthService from "src/services/AuthService";

export default abstract class BaseAppPlugin extends Plugin {
	private _authService: AuthService;
	private _appVaultsService: AppVaultsService;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this._authService = new AuthService(app);
		this._appVaultsService = new AppVaultsService(this._authService);
	}

	get authService() {
		return this._authService;
	}

	get appVaultsService() {
		return this._appVaultsService;
	}
}
