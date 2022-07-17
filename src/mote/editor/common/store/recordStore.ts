import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { get } from "../core/commandFacade";
import { Pointer, RecordValue, Role } from 'mote/editor/common/store/record';
import RecordCacheStore from "./recordCacheStore";


interface RecordStoreState<T> {
	value: T;
	role: Role;
}

interface RecordStoreProps {
	pointer: Pointer;
	userId?: string;
	path?: string[];
}

export default class RecordStore<T = any> extends Disposable {

	static key = 0;
	static keyName = 'RecordStore';

	private _onDidChange = this._register(new Emitter<void>());
	public readonly onDidChange: Event<void> = this._onDidChange.event;

	userId: string;
	pointer: Pointer;
	table: string;
	id: string;
	path: string[];
	recordStoreParentStore?: RecordStore;
	childStoreMap: { [key: string]: RecordStore } = {};
	instanceState!: RecordStoreState<T>;

	//#region static method

	static getChildStoreKey(pointer: Pointer, keyName: string, path?: string[]) {
		const { id, table } = pointer;
		let key = `${table}:${id}:${keyName}`;
		if (path) {
			for (const property of path) {
				key += `:${property}`;
			}
		}
		return key;
	}

	static createChildStore(parentStore: RecordStore, pointer: Pointer, path?: string[]) {
		const childStoreKey = RecordStore.getChildStoreKey(pointer, RecordStore.keyName, path);
		const cachedChildStore = parentStore.getRecordStoreChildStore(childStoreKey);
		const childStore: RecordStore = cachedChildStore || new RecordStore({ pointer: pointer, userId: parentStore.userId, path: path });
		if (!cachedChildStore) {
			childStore.setRecordStoreParent(childStoreKey, parentStore);
		}
		return childStore;
	}

	static fromIdentity(identity: string) {
		const [table, id, userId] = identity.split(':');
		return new RecordStore({
			pointer: {
				table: table,
				id: id
			},
			userId: userId
		});
	}

	//#endregion

	constructor(props: RecordStoreProps) {
		super();
		this.userId = props.userId || '';
		this.pointer = props.pointer;
		this.id = props.pointer.id;
		this.table = props.pointer.table;
		this.path = props.path || [];
		this.instanceState = {} as any;

		this.sync();
		RecordCacheStore.Default.onDidChange((e) => {
			if (this.identify === e) {
				const prevValue = this.instanceState?.value;
				this.sync();
				if (prevValue !== this.instanceState.value) {
					this._onDidChange.fire();
				}
			}
		});
	}

	get identify() {
		return RecordCacheStore.generateCacheKey({ pointer: this.pointer, userId: this.userId });
	}

	get state() {
		return this.instanceState;
	}

	public fire() {
		this._onDidChange.fire();
	}

	public sync() {
		const cachedRecord = RecordCacheStore.Default.getRecord({ pointer: this.pointer, userId: this.userId });
		if (cachedRecord) {
			if (this.path && this.path.length > 0) {
				this.instanceState.value = get(cachedRecord.value, this.path);
			} else {
				this.instanceState.value = cachedRecord.value as any;
			}
		}
	}


	getValue() {
		return this.state.value;
	}

	getRole() {
		return this.state.role;
	}

	getPropertyStore(property: string): RecordStore {
		return RecordStore.createChildStore(this, this.pointer, [property]);
	}

	setRecordStoreParent<T extends RecordStore>(keyName: string, parentStore: T) {
		parentStore.childStoreMap[keyName] = this;
		this.recordStoreParentStore = parentStore;
	}

	getRecordStoreChildStore(keyName: string) {
		return this.childStoreMap[keyName];
	}

	getRecordStoreAtRootPath(): RecordStore<RecordValue> {
		return RecordStore.createChildStore(this, this.pointer);
	}

	clone() {
		return new RecordStore({
			pointer: this.pointer,
			userId: this.userId
		});
	}

	cloneWithNewParent<T extends RecordStore>(parent: T): this {
		const childKey = RecordStore.getChildStoreKey(this.pointer, RecordStore.keyName, this.path);
		const childInCache = parent.getRecordStoreChildStore(childKey) as this;
		const child = childInCache || this.clone();
		if (!childInCache) {
			child.setRecordStoreParent(childKey, parent);
		}
		return child;
	}
}
