import ObservableValue from "src/model/ObservableValue";
import { AuthCreds } from "src/model/AuthCreds";
import { AppVault } from "src/model/AppVault";
import { AuthStatus } from "src/model/AuthStatus";

export default abstract class AppGlobalState {
	abstract get authStatus(): ObservableValue<AuthStatus>;
	abstract get authCreds(): ObservableValue<AuthCreds | null>;
	abstract get vaults(): ObservableValue<AppVault[]>;
	abstract get chosenVaultId(): ObservableValue<string>;

	log(): void {
		console.group("AppGlobalState Debug");

		console.log("authStatus:", AuthStatus[this.authStatus.value]);
		console.log("authCreds:", this.authCreds.value);
		console.log("vaults:", this.vaults.value);
		console.log("chosenVaultId:", this.chosenVaultId.value);

		console.groupEnd();
	}
}
