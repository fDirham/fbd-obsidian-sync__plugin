export interface AppVault {
	name: string;
	id: string;
	backups: {
		createdAt: number;
		id: string;
	}[];
}
