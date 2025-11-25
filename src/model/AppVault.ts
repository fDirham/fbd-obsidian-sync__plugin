export interface AppVault {
	name: string;
	id: string;
	backups: {
		createdAt: Date;
		id: string;
	}[];
}
