import { App, Modal, Setting } from "obsidian";

export default class NewVaultModal extends Modal {
	constructor(app: App, onSubmit: (name: string) => void) {
		super(app);

		this.setTitle("New Vault");
		this.contentEl.classList.add("no-border-settings");

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
					onSubmit(name);
				})
		);
	}
}
