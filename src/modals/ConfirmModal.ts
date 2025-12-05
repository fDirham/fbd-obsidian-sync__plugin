import { App, Modal } from "obsidian";

export default class ConfirmModal extends Modal {
	private isConfirmed = false;

	constructor(
		app: App,
		description: string,
		private onConfirm: () => void,
		private onCancel: () => void
	) {
		super(app);

		this.setTitle("Are you sure?");
		this.contentEl.classList.add("no-border-settings");

		this.contentEl.createEl("p", {
			text: description,
			cls: "confirm-modal__description",
		});

		const buttonsDivEl = this.contentEl.createDiv({
			cls: "confirm-modal__buttons",
		});
		buttonsDivEl.createEl("button", {
			text: "Cancel",
			cls: "confirm-modal__btn confirm-modal__btn--cancel",
		}).onclick = () => {
			this.isConfirmed = false;
			this.close();
		};
		buttonsDivEl.createEl("button", {
			text: "Confirm",
			cls: "confirm-modal__btn confirm-modal__btn--confirm mod-cta",
		}).onclick = () => {
			this.isConfirmed = true;
			this.close();
		};
	}

	onClose(): void {
		if (this.isConfirmed) {
			this.onConfirm();
		} else {
			this.onCancel();
		}
	}
}
