import BlockStore from './blockStore';
import { Pointer, RecordValue } from './record';
import RecordStore from './recordStore';

interface SpaceRecord extends RecordValue {
	name: string;
	description?: string;
	pages: string[];
}

interface SpaceStoreProps {
	userId: string;
}

export default class SpaceStore extends RecordStore<SpaceRecord> {
	static override keyName = 'SpaceStore';

	static override createChildStore(parentStore: RecordStore, pointer: Pointer): SpaceStore {
		const childStoreKey = RecordStore.getChildStoreKey(pointer, SpaceStore.keyName);
		const childStoreInCache = parentStore.getRecordStoreChildStore(childStoreKey) as SpaceStore;
		const childStore = childStoreInCache || new SpaceStore(pointer, {
			userId: parentStore.userId,
		});
		if (!childStoreInCache) {
			childStore.setRecordStoreParent(childStoreKey, parentStore);
		}
		return childStore;
	}

	constructor(pointer: Pointer, props: SpaceStoreProps) {
		super({
			pointer: pointer,
			userId: props.userId,
		});
	}

	getSpaceId() {
		const record = this.getValue();
		if (record && record.id) {
			return record.id;
		}
		return null;
	}

	getSpaceName() {
		const record = this.getValue();
		if (record && record.name) {
			return record.name;
		}
		return null;
	}

	getPagesStore() {
		return this.getPropertyStore('pages');
	}

	getPagesStores(): BlockStore[] {
		const contentStore = this.getPagesStore();
		const record = this.getValue();
		const pages: string[] = record && record.pages ? record.pages : [];
		return pages.map(itemId => BlockStore.createChildStore(contentStore, {
			table: 'page',
			id: itemId,
		}));
	}

	override clone() {
		return new SpaceStore(this.pointer, { userId: this.userId });
	}
}
