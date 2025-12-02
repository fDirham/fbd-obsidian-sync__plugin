import { App, Modal, Setting } from "obsidian";

export default class AskEmailModal extends Modal {
	constructor(
		app: App,
		title: string,
		subtitle: string,
		onSubmit: (email: string) => void
	) {
		super(app);

		this.setTitle(title);

		let email = "";
		new Setting(this.contentEl).setName("Email").addText((text) =>
			text.onChange((value) => {
				email = value;
			})
		);

		if (subtitle) {
			new Setting(this.contentEl).setDesc(subtitle);
		}

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					onSubmit(email);
				})
		);
	}
}
