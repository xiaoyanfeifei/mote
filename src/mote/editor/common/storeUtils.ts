import BlockStore from "./store/blockStore";
import RecordStore from "./store/recordStore";

export function getParentBlockStore(childStore: RecordStore) {
    let parentStore: RecordStore = childStore;
    while (true) {
        if (!parentStore.recordStoreParentStore) {
            return;
        }
        parentStore = parentStore.recordStoreParentStore;
        if (parentStore instanceof BlockStore && parentStore != childStore) {
            return parentStore;
        }
    }
}