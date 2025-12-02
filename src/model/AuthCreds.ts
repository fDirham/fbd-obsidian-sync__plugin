export interface AuthCreds {
	token: string;
	refreshToken: string;
	idToken: string;
	expiresIn: number;
	isVerified: boolean;
	email: string;
}
