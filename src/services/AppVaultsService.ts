import { AppVault } from "src/model/AppVault";
import AuthService, { AuthStatus } from "./AuthService";
import ObservableValue from "src/model/ObservableValue";
import { sleepPromise } from "src/utils";
import { Mock_GetVaultsResponse_Success } from "src/mockData";

export default class AppVaultsService {
	private _vaults: ObservableValue<AppVault[]>;
	private _chosenVaultId: ObservableValue<string>;
	private _authService: AuthService;

	constructor(authService: AuthService) {
		this._vaults = new ObservableValue<AppVault[]>([]);
		this._chosenVaultId = new ObservableValue<string>("");
		this._authService = authService;

		this._authService.status.addListener("appvaults", (_, newVal) => {
			if (newVal == AuthStatus.LOGGED_IN) {
				this.loadVaults();
				return;
			}
			this._vaults.value = [];
		});
	}

	private async loadVaults() {
		await sleepPromise(500);
		this._vaults.value = Mock_GetVaultsResponse_Success.vaults;
	}

	get vaults() {
		return this._vaults;
	}

	get chosenVaultId() {
		return this._chosenVaultId;
	}
}
