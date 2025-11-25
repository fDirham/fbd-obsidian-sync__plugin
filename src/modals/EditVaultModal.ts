import { App, Modal, Notice, Setting } from "obsidian";
import AppPlugin from "src/AppPlugin/AppPlugin";
import { AppVault } from "src/model/AppVault";

export default class EditVaultModal extends Modal {
	private _plugin: AppPlugin;
	private _vault: AppVault;

	constructor(app: App, plugin: AppPlugin, vault: AppVault) {
		super(app);
		this._plugin = plugin;
		this._vault = vault;

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
					this.onSubmit(newName);
				})
		);
	}

	async onSubmit(newName: string) {
		newName = newName.trim();
		if (!newName) {
			new Notice("Vault name cannot be empty.");
			return;
		}
		if (newName.length > 50) {
			new Notice("Vault name cannot exceed 50 characters.");
			return;
		}

		await this._plugin.appVaultsService.renameVault(
			this._vault.id,
			newName
		);
		this.close();
	}
}
