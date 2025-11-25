import { App, Modal, Setting } from "obsidian";
import AppPlugin from "src/AppPlugin/AppPlugin";

export default class NewVaultModal extends Modal {
	private _plugin: AppPlugin;

	constructor(app: App, plugin: AppPlugin) {
		super(app);
		this._plugin = plugin;

		if (this._plugin.appGlobalState.vaults.value.length >= 5) {
			new Setting(this.contentEl)
				.setName("Too many vaults!")
				.setDesc("Maximum of 5 vaults reached.");
			return;
		}

		this.setTitle("New Vault");

		let name = "";
		new Setting(this.contentEl).setName("Name").addText((text) =>
			text.onChange((value) => {
				name = value;
			})
		);

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.onSubmit(name);
				})
		);
	}

	async onSubmit(name: string) {
		const newVault = await this._plugin.appVaultsService.createVault(name);
		this._plugin.appVaultsService.setChosenVault(newVault.id);
		this.close();
	}
}
