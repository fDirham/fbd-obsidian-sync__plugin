import { GetVaultsResponse } from "./model/dto/GetVaultsResponse";
import { LoginResponse } from "./model/dto/LoginResponse";

export const Mock_LoginResponse_Success: LoginResponse = {
	token: "placeholder_token",
	refreshToken: "placeholder_refreshToken",
	idToken: "placeholder_idToken",
	expiresIn: 3600,
};

export const Mock_GetVaultsResponse_Success: GetVaultsResponse = {
	vaults: [
		{
			name: "Personal Notes",
			id: "vault-001",
			backups: [
				{
					createdAt: new Date("2024-11-25T10:30:00Z"),
					id: "backup-001",
				},
				{
					createdAt: new Date("2024-11-24T10:30:00Z"),
					id: "backup-002",
				},
				{
					createdAt: new Date("2024-11-23T10:30:00Z"),
					id: "backup-003",
				},
			],
		},
		{
			name: "Work Projects",
			id: "vault-002",
			backups: [
				{
					createdAt: new Date("2024-11-25T08:15:00Z"),
					id: "backup-004",
				},
				{
					createdAt: new Date("2024-11-22T08:15:00Z"),
					id: "backup-005",
				},
			],
		},
		{
			name: "Research & Reading",
			id: "vault-003",
			backups: [
				{
					createdAt: new Date("2024-11-25T14:00:00Z"),
					id: "backup-006",
				},
			],
		},
	],
};

export const Mock_GetVaultsResponse_Empty: GetVaultsResponse = {
	vaults: [],
};
