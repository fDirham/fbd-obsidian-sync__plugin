export interface AuthCreds {
	token: string;
	refreshToken: string;
	idToken: string;
	expiresIn: number;
	verified: boolean;
	email: string;
}
