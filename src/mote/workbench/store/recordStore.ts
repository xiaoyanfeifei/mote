import { Pointer, Role } from "./record";

interface RecordStoreState<T> {
    value: T;
    role: Role;
}

interface RecordStoreProps {
    pointer: Pointer;
    userId?: string;
    path?: string[];
}

export default class RecordStore<T = any> {

    static key = 0;
    static keyName = "RecordStore";

    userId: string;
    pointer: Pointer;
    table: string;
    id: string;
    path: string[];
    recordStoreParentStore?: RecordStore;
    childStoreMap:{[key: string]: RecordStore} = {};
    instanceState: Partial<RecordStoreState<T>> = {};

    //#region static method

    static getChildStoreKey(pointer: Pointer, keyName: string, path?: string[]){
        const {id, table} = pointer;
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
        const childStore = cachedChildStore || new RecordStore({pointer: pointer, userId: parentStore.userId, path: path});
        cachedChildStore || childStore.setRecordStoreParent(childStoreKey, parentStore);
        return childStore;
    }

    static fromIdentity(identity: string) {
        const [table, id, userId] = identity.split(":");
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
        this.userId = props.userId || "";
        this.pointer = props.pointer;
        this.id = props.pointer.id;
        this.table = props.pointer.table;
        this.path = props.path || [];
        this.instanceState = {};
        //this.syncIfNeed();
    }

    getRecordStoreChildStore(keyName: string) {
        return this.childStoreMap[keyName];
    }

    getRecordStoreAtRootPath() {
        return RecordStore.createChildStore(this, this.pointer)
    }
}