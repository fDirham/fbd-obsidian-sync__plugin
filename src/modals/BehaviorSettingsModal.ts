import { App, Modal, Setting } from "obsidian";
import AppGlobalState from "src/services/AppGlobalState/AppGlobalState";

export default class BehaviorSettingsModal extends Modal {
	constructor(app: App, ags: AppGlobalState) {
		super(app);

		this.setTitle("Behavior Settings");

		new Setting(this.contentEl)
			.setName("Confirm before restore latest backup")
			.addToggle((toggle) =>
				toggle
					.setValue(ags.confirmRestoreLatestBackup)
					.onChange((value) => {
						ags.confirmRestoreLatestBackup = value;
					})
			);

		new Setting(this.contentEl)
			.setName("Confirm before restore specific backup")
			.addToggle((toggle) =>
				toggle
					.setValue(ags.confirmRestoreSpecificBackup)
					.onChange((value) => {
						ags.confirmRestoreSpecificBackup = value;
					})
			);

		new Setting(this.contentEl)
			.setName("Confirm before deleting a vault")
			.addToggle((toggle) =>
				toggle.setValue(ags.confirmDeleteVault).onChange((value) => {
					ags.confirmDeleteVault = value;
				})
			);

		new Setting(this.contentEl)
			.setName("Confirm before deleting a backup")
			.addToggle((toggle) =>
				toggle.setValue(ags.confirmDeleteBackup).onChange((value) => {
					ags.confirmDeleteBackup = value;
				})
			);

		new Setting(this.contentEl)
			.setName("Confirm before uploading backup")
			.addToggle((toggle) =>
				toggle.setValue(ags.confirmUpload).onChange((value) => {
					ags.confirmUpload = value;
				})
			);
	}
}
