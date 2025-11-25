import { AppVault } from "src/model/AppVault";
import { AuthCreds } from "src/model/AuthCreds";
import { AuthStatus } from "src/model/AuthStatus";
import ObservableValue from "src/model/ObservableValue";
import AppGlobalState from "./AppGlobalState";

export default class ProdAppGlobalState extends AppGlobalState {
	private _authStatus: ObservableValue<AuthStatus>;
	private _authCreds: ObservableValue<AuthCreds | null>;
	private _vaults: ObservableValue<AppVault[]>;
	private _chosenVaultId: ObservableValue<string>;

	constructor() {
		super();
		this._authStatus = new ObservableValue(AuthStatus.LOADING);
		this._vaults = new ObservableValue<AppVault[]>([]);
		this._authCreds = new ObservableValue<AuthCreds | null>(null);
		this._chosenVaultId = new ObservableValue<string>("");
	}

	get authStatus(): ObservableValue<AuthStatus> {
		return this._authStatus;
	}

	get authCreds(): ObservableValue<AuthCreds | null> {
		return this._authCreds;
	}

	get vaults(): ObservableValue<AppVault[]> {
		return this._vaults;
	}

	get chosenVaultId(): ObservableValue<string> {
		return this._chosenVaultId;
	}
}
