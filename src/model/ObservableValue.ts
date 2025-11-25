type ListenerCB<T> = (oldVal: T, newVal: T) => void;

export default class ObservableValue<T> {
	private _val: T;
	private listeners: Map<string, ListenerCB<T>>;

	constructor(initialVal: T) {
		this._val = initialVal;
		this.listeners = new Map<string, ListenerCB<T>>();
	}

	get value(): T {
		return this._val;
	}

	set value(newVal: T) {
		const oldVal = this._val;
		this._val = newVal;

		this.listeners.forEach((cb, key) => {
			cb(oldVal, newVal);
		});
	}

	addListener(id: string, cb: ListenerCB<T>): boolean {
		if (this.listeners.has(id)) {
			return false;
		}
		this.listeners.set(id, cb);
		return true;
	}

	removeListener(id: string) {
		if (this.listeners.has(id)) this.listeners.delete(id);
	}
}
