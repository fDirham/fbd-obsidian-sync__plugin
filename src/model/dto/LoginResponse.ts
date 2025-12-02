export interface LoginResponse {
	token: string;
	refreshToken: string;
	idToken: string;
	expiresIn: number;
	isVerified: boolean;
}
