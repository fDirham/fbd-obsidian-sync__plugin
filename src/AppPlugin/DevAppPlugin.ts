import ProdAppGlobalState from "src/services/AppGlobalState/ProdAppGlobalState";
import ProdModalOrchestratorService from "src/services/ModalOrchestratorService/ProdModalOrchestratorService";
import DevAuthService from "src/services/AuthService/DevAuthService";
import DevAppVaultsService from "src/services/AppVaultsService/DevAppVaultsService";
import AppGlobalState from "src/services/AppGlobalState/AppGlobalState";
import AuthService from "src/services/AuthService/AuthService";
import AppVaultsService from "src/services/AppVaultsService/AppVaultsService";
import ModalOrchestratorService from "src/services/ModalOrchestratorService/ModalOrchestratorService";
import AppPlugin from "./AppPlugin";

export default class DevAppPlugin extends AppPlugin {
	getDependencies(): [
		AppGlobalState,
		AuthService,
		AppVaultsService,
		ModalOrchestratorService
	] {
		const ags = new ProdAppGlobalState(this.app, this);
		const authService = new DevAuthService(ags, this.app);
		const appVaultsService = new DevAppVaultsService(ags);
		const modalOrchestratorService = new ProdModalOrchestratorService(
			this.app,
			authService,
			appVaultsService,
			ags
		);
		return [ags, authService, appVaultsService, modalOrchestratorService];
	}

	async afterBaseOnload() {
		// For testing
		// @ts-ignore - Obsidian API
		this.app.setting.close();
		// @ts-ignore - Obsidian API
		this.app.setting.open();
		// @ts-ignore - Obsidian API
		this.app.setting.openTabById(this.manifest.id);
	}
}
