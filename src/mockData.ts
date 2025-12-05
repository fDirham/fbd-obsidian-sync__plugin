import { GetVaultsResponse } from "./model/dto/GetVaultsResponse";
import { LoginResponse } from "./model/dto/LoginResponse";

export const Mock_LoginResponse_Success: LoginResponse = {
	token: "placeholder_token",
	refreshToken: "placeholder_refreshToken",
	idToken:
		"eyJraWQiOiJNcDR1NWpMTUVGTDBCQ3p1UDltWjlycnlKek16RTZhNXN4aWpjZGJ6R2c0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkODcxMTNiMC1hMGExLTcwOTMtNmVkNy1hN2M0YmMwYTA3MzIiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfMlpvWUVJbkZyIiwiY29nbml0bzp1c2VybmFtZSI6ImQ4NzExM2IwLWEwYTEtNzA5My02ZWQ3LWE3YzRiYzBhMDczMiIsIm9yaWdpbl9qdGkiOiI2MTNkOWE0Yi1iNzc2LTQzM2QtOTEzNS1hMzc2MGUyYTgyNzEiLCJhdWQiOiIyOTd1a2hkZ2IwOWM5YzRsajZwMTAxZXZhOSIsImV2ZW50X2lkIjoiNmNmNjVjMWYtY2Y1Ni00NmJjLTk0YjUtZTY4MGQ2N2RmYjA2IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NjQxMTI3NDUsImV4cCI6MTc2NDExNjM0NSwiaWF0IjoxNzY0MTEyNzQ1LCJqdGkiOiIwZmU0YzAxNS00ZTFkLTRkZTktOGJhMC01M2M2NTBhNDBkMzYiLCJlbWFpbCI6ImZhamFybGV0dGVyc0BnbWFpbC5jb20ifQ.ruhjGeSxnZJKc0VR_2rsYylb4bddraj1_IW3ej4uSiNeBcummi50TNwTc-qGuCrCc81Mu8mYorB-9dVjPqICGIIUwMWaLKkp5rZDk9qX9goUm02GiTIFcU-AJxU8fOdpqwCh9PImW0-3qN0MyxmQQmUH7-S9KWfJZGIIvjPtF-gsighH2WyA25PdFHko3WiIb8QknDQeCvzbM9QbETqGyXVtEbENv-YIXGYVXmFraFHU8VZ9AUhVnl0w5_qmgVoP4XTuPUeFw8C-EuvCtappekqyzAupLI6mTgrWbPuXdUOgqy_HbRk2RnTob4aBVfcfpd7qhc1YLKViAZFAjWmQ8Q",
	expiresIn: 3600,
	verified: true,
};

export const Mock_GetVaultsResponse_Success: GetVaultsResponse = {
	vaults: [
		{
			name: "Personal Notes",
			id: "vault-001",
			backups: [
				{
					createdAt: new Date("2024-11-25T10:30:00Z").getTime(),
					id: "backup-001",
				},
				{
					createdAt: new Date("2024-11-24T10:30:00Z").getTime(),
					id: "backup-002",
				},
				{
					createdAt: new Date("2024-11-23T10:30:00Z").getTime(),
					id: "backup-003",
				},
			],
		},
		{
			name: "Work Projects",
			id: "vault-002",
			backups: [
				{
					createdAt: new Date("2024-11-25T08:15:00Z").getTime(),
					id: "backup-004",
				},
				{
					createdAt: new Date("2024-11-22T08:15:00Z").getTime(),
					id: "backup-005",
				},
			],
		},
		{
			name: "Research & Reading",
			id: "vault-003",
			backups: [
				{
					createdAt: new Date("2024-11-25T14:00:00Z").getTime(),
					id: "backup-006",
				},
			],
		},
	],
};

export const Mock_GetVaultsResponse_Empty: GetVaultsResponse = {
	vaults: [],
};
