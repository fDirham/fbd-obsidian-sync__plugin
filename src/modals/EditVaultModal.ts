import { App, Modal, Setting } from "obsidian";
import { AppVault } from "src/model/AppVault";

export default class EditVaultModal extends Modal {
	constructor(
		app: App,
		vault: AppVault,
		onSubmit: (newName: string) => void
	) {
		super(app);

		this.setTitle("Edit Vault");

		let newName = "";
		new Setting(this.contentEl).setName("Name").addText((text) => {
			text.setPlaceholder(vault.name);
			text.setValue(vault.name);

			text.onChange((value) => {
				newName = value;
			});
		});

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					onSubmit(newName);
				})
		);
	}
}
