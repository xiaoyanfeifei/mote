import { Lodash } from 'mote/base/common/lodash';
import BlockStore from 'mote/editor/common/store/blockStore';
import RecordStore from 'mote/editor/common/store/recordStore';
import { BugIndicatingError } from 'vs/base/common/errors';

export class StoreUtils {
	static getParentBlockStore(childStore: RecordStore) {
		let parentStore: RecordStore = childStore;
		while (true) {
			if (!parentStore.recordStoreParentStore) {
				return;
			}
			parentStore = parentStore.recordStoreParentStore;
			if (parentStore instanceof BlockStore && parentStore !== childStore) {
				return parentStore;
			}
		}
	}

	static getLineNumberForStore(store: BlockStore, contentStore: RecordStore) {
		const storeId = store.id;
		const pageIds: string[] = contentStore.getValue() || [];
		return Lodash.findIndex(pageIds, (id) => id === storeId);
	}

	static createStoreForLineNumber(lineNumber: number, contentStore: RecordStore) {
		if (lineNumber < 0) {
			throw new BugIndicatingError('lineNumber should never be negative when create new store');
		}
		const pageId = this.getPageId(lineNumber, contentStore);
		return this.createStoreForPageId(pageId, contentStore);
	}

	static getPageId(lineNumber: number, contentStore: RecordStore) {
		const pageIds: string[] = contentStore.getValue() || [];
		if (lineNumber >= pageIds.length) {
			throw new BugIndicatingError(`content length = ${pageIds.length}, less than ${lineNumber}`);
		}
		return pageIds[lineNumber];
	}

	static createStoreForPageId = (id: string, contentStore: RecordStore) => {
		return BlockStore.createChildStore(contentStore, {
			table: 'block',
			id: id
		});
	};
}



