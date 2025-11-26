import { AuthCreds } from "src/model/AuthCreds";

export default abstract class AuthService {
	abstract load(): Promise<void>;
	abstract logout(): Promise<void>;
	abstract login(email: string, password: string): Promise<void>;
	abstract deleteAccount(): Promise<void>;
	abstract checkAndRefreshToken(): Promise<AuthCreds>;
}
