import { Pointer, RecordWithRole } from "./record";

interface CacheKeyProps {
    pointer: Pointer;
    userId?: string;
}


export default class RecordCacheStore {
    static Default = new RecordCacheStore();

    static generateCacheKey = (props:CacheKeyProps)=> {
        const {pointer: {table, id}, userId} = props;
        return `${table}:${id}:${userId||""}`;
    }

    state = {
        cache: new Map<string, any>(),
        syncStates: new Map(),
        appliedTransaction: !1
}

getRecord(e:CacheKeyProps): RecordWithRole | null {
    const key = RecordCacheStore.generateCacheKey(e);
    let record = this.state.cache.get(key);
    if (record){
        return record.value
    }
    return null;
    /*
    record = this.storage.get(key);
    if(record){
        this.state.cache.set(key, record);
        return record.value;
    }
    */
}

getRecordValue(e:CacheKeyProps) {
    const t = this.getRecord(e);
    if (t && t.value) {
        return t.value
    }
    return null;
}
getRole(e:CacheKeyProps) {
    const t = this.getRecord(e);
    if (t && t.role)
        return t.role
    return null
}
getVersion(e:CacheKeyProps) {
    const t = this.getRecord(e);
    return t && t.value && t.value.version ? t.value.version : 0
}
setRecord(keyProps:CacheKeyProps, value: any) {
    const key = RecordCacheStore.generateCacheKey(keyProps)
    const cachedValue = this.state.cache.get(key);
    if (value) {
        const record = Object.assign({}, keyProps, {
            value: value
        });
        if(cachedValue && cachedValue.pointer.spaceId && !record.pointer.spaceId){
            record.pointer.spaceId = cachedValue.pointer.spaceId
        }
        this.state.cache.set(key, record);
        //this.storage.set(key, record);
    } else
        this.deleteRecord(keyProps)
}
deleteRecord(e:CacheKeyProps) {
    this.state.cache.delete(RecordCacheStore.generateCacheKey(e))
}
forEachRecord(e:string, callback: any) {
    for (const {pointer, value, userId} of this.state.cache.values()){
        value && "none" !== value.role && userId === e && callback(pointer, value)
    }
}
getSyncState(e:CacheKeyProps) {
    return this.state.syncStates.get(RecordCacheStore.generateCacheKey(e))
}
setSyncState(e:CacheKeyProps, t: any) {
    this.state.syncStates.set(RecordCacheStore.generateCacheKey(e), t)
}
clearSyncState(e:CacheKeyProps) {
    this.state.syncStates.delete(RecordCacheStore.generateCacheKey(e))
}
}