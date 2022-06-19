import RecordStore from "mote/editor/common/store/recordStore";
import * as uuid from "uuid";
import { Role } from "../store/record";
import RecordCacheStore from "../store/recordCacheStore";
import CommandFacade from "./commandFacade";

import { Operation } from "./editOperation";


export interface TransactionCallback {
    (transcation: Transaction): void;
}

export class Transaction {

    static create(userId: string) {
        return new Transaction(userId);
    }

    static createAndCommit(callback: TransactionCallback, userId: string) {
        const transaction = Transaction.create(userId);
        const result = callback(transaction);
        transaction.commit();
        return result;
    }

    id:string = uuid.v1();
    isLocal = true;
    canUndo = true;

    operations: Operation[] = [];
    stores: RecordStore[] = [];

    private constructor(userId: string) {

    }

    commit() {

    }

    addOperation(store:RecordStore, operation: Operation ) {
        let record = store.getRecordStoreAtRootPath().getValue();
        record = CommandFacade.execute(operation, record);
        const role = store.getRecordStoreAtRootPath().getRole();


        console.log("new record:", record);

        RecordCacheStore.Default.setRecord({
            pointer: store.pointer,
            userId: store.userId
        }, {
            value: record,
            role: role || Role.Editor
        });

        this.operations.push(operation);
        this.stores.push(store);
    }
}