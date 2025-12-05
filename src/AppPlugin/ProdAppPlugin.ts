import AppPlugin from "./AppPlugin";
import ProdAppGlobalState from "src/services/AppGlobalState/ProdAppGlobalState";
import ProdModalOrchestratorService from "src/services/ModalOrchestratorService/ProdModalOrchestratorService";
import ProdAppVaultsService from "src/services/AppVaultsService/ProdAppVaultsService";
import ProdAuthService from "src/services/AuthService/ProdAuthService";
import AppGlobalState from "src/services/AppGlobalState/AppGlobalState";
import AuthService from "src/services/AuthService/AuthService";
import AppVaultsService from "src/services/AppVaultsService/AppVaultsService";
import ModalOrchestratorService from "src/services/ModalOrchestratorService/ModalOrchestratorService";

export default class ProdAppPlugin extends AppPlugin {
	getDependencies(): [
		AppGlobalState,
		AuthService,
		AppVaultsService,
		ModalOrchestratorService
	] {
		const ags = new ProdAppGlobalState(this.app, this);
		const authService = new ProdAuthService(ags);
		const appVaultsService = new ProdAppVaultsService(
			ags,
			this.app,
			authService
		);
		const modalOrchestratorService = new ProdModalOrchestratorService(
			this.app,
			authService,
			appVaultsService,
			ags
		);
		return [ags, authService, appVaultsService, modalOrchestratorService];
	}
}
