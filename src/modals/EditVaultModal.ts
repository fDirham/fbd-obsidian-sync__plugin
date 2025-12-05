import { App, Modal, Setting } from "obsidian";
import { AppVault } from "src/model/AppVault";

export default class EditVaultModal extends Modal {
	constructor(
		app: App,
		vault: AppVault,
		onSubmit: (newName: string) => void,
		onDelete: (vaultId: string) => void
	) {
		super(app);

		this.setTitle("Edit Vault");
		this.contentEl.classList.add("no-border-settings");

		let newName = "";
		new Setting(this.contentEl).setName("Name").addText((text) => {
			text.setPlaceholder(vault.name);
			text.setValue(vault.name);

			text.onChange((value) => {
				newName = value;
			});
		});

		new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Delete vault")
					.onClick(() => {
						onDelete(vault.id);
					})
					.setClass("fbd-sync__delete-btn")
			)
			.addButton((btn) =>
				btn
					.setButtonText("Submit")
					.setCta()
					.onClick(() => {
						onSubmit(newName);
					})
			);
	}
}
