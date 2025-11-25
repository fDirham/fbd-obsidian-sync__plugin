import { LoginResponse } from "./dto/LoginResponse";

export default interface AppData {
	lastLoginResponse: null | LoginResponse;
	chosenVaultId: string;
}
