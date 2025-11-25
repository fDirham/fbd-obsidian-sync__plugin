import { App, Plugin, PluginManifest } from "obsidian";
import AuthService from "src/services/AuthService";

export default abstract class BaseAppPlugin extends Plugin {
	private _authService: AuthService;

	abstract loadSettings(): Promise<void>;
	abstract saveSettings(): Promise<void>;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this._authService = new AuthService(app);
	}

	get authService() {
		return this._authService;
	}
}
