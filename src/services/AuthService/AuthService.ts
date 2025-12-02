import { AuthCreds } from "src/model/AuthCreds";

export default abstract class AuthService {
	abstract load(): Promise<void>;
	abstract logout(): Promise<void>;
	abstract login(email: string, password: string): Promise<void>;
	abstract deleteAccount(): Promise<void>;
	abstract checkAndRefreshToken(): Promise<AuthCreds>;
	abstract signUp(email: string, password: string): Promise<void>;
	abstract sendResetPasswordEmail(email: string): Promise<void>;
	abstract confirmResetPassword(
		email: string,
		newPassword: string,
		code: string
	): Promise<boolean>;
	abstract sendVerificationEmail(email: string): Promise<void>;
	abstract confirmVerify(email: string, code: string): Promise<boolean>;
}
