import { BlockType, Pointer } from "./record";
import RecordStore from "./recordStore";

export default class BlockStore extends RecordStore {
	static override keyName = 'BlockStore';

	static override createChildStore(parentStore: RecordStore, pointer: Pointer, path?: string[]): BlockStore {
		const childStoreKey = BlockStore.getChildStoreKey(pointer, BlockStore.keyName, path);
		const cachedChildStore = parentStore.getRecordStoreChildStore(childStoreKey) as BlockStore;
		const childStore = cachedChildStore || new BlockStore(pointer, parentStore.userId, path);
		cachedChildStore || childStore.setRecordStoreParent(childStoreKey, parentStore);
		return childStore;
	}

	constructor(pointer: Pointer, userId?: string, path?: string[]) {
		super({ pointer: pointer, userId: userId, path: path });
	}

	getType(): BlockType | undefined {
		const record = this.getValue();
		if (record && record.type) {
			return record.type;
		}
		return undefined;
	}

	override getPropertyStore(property: string): RecordStore {
		return BlockStore.createChildStore(this, this.pointer, [property]);
	}

	getProperties() {
		const value = this.getValue();
		if (value && value.properties) {
			return value.properties;
		}
		return {};
	}

	getTitleStore(): RecordStore {
		return this.getPropertyStore('title');
	}

	getContentStore() {
		return this.getPropertyStore('content');
	}

	getPropertiesStore() {
		return RecordStore.createChildStore(this, this.pointer, ['properties']);
	}

	getContentStores(table: string = 'block'): BlockStore[] {
		const contentStore = this.getContentStore();
		const record = this.getValue();
		const content: string[] = record && record.content ? record.content : [];
		return content.map(itemId => BlockStore.createChildStore(contentStore, {
			table: table,
			id: itemId,
		}));
	}

	override clone() {
		return new BlockStore(
			this.pointer,
			this.userId,
			this.path
		)
	}
}
