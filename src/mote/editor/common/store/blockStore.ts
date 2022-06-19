import { Pointer } from "./record";
import RecordStore from "./recordStore";

export default class BlockStore extends RecordStore {
    static override keyName = "BlockStore";

    static override createChildStore(parentStore: RecordStore, pointer: Pointer, path?: string[]): BlockStore {
        const childStoreKey = BlockStore.getChildStoreKey(pointer, BlockStore.keyName, path);
        const cachedChildStore = parentStore.getRecordStoreChildStore(childStoreKey) as BlockStore;
        const childStore = cachedChildStore || new BlockStore(pointer, parentStore.userId, path);
        cachedChildStore || childStore.setRecordStoreParent(childStoreKey, parentStore);
        return childStore;
    }

    constructor(pointer: Pointer, userId?: string, path?: string[]){
        super({pointer: pointer, userId: userId, path: path});
    }

    getType() {
        const record = this.getValue();
        if (record && record.type) {
            return record.type;
        }
    }

    override getPropertyStore(property: string): BlockStore {
        return BlockStore.createChildStore(this, this.pointer, [property]);
    }

    getTitleStore() {
        return this.getPropertyStore("title");
    }

    getContentStore() {
        return this.getPropertyStore("content");
    }

    getContentStores(table:string = "block"): BlockStore[] {
        const contentStore = this.getContentStore();
        const record = this.getValue()
        const content: string[] = record && record.content ? record.content : [];
        return content.map(itemId=>BlockStore.createChildStore(contentStore, {
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