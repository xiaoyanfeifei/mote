import RecordStore from "mote/editor/common/store/recordStore";
import { Transaction } from "./transaction";

export enum Command {
    Update = 0,
    Set,
    ListBefore,
    ListAfter,
    ListRemove
}

export interface Operation {
    id: string;
    table: string;
    path: string[];
    command: Command;
    size?: number;
    args: any;
}

export class EditOperation {

    public static prependChild(parent: RecordStore, prepend: RecordStore, transaction: Transaction) {
        this.addOperationForStore(parent, {id: prepend.id}, transaction, Command.ListBefore);
        return {
            parent: parent,
            child: prepend.cloneWithNewParent(parent)
        }
    }

    public static appendToParent(parent: RecordStore, append: RecordStore, transaction: Transaction) {
        this.addOperationForStore(parent, {id: append.id}, transaction, Command.ListAfter);
        return {
            parent: parent,
            child: append.cloneWithNewParent(parent)
        }
    }

    public static insertChildAfterTarget(parent: RecordStore, insert: RecordStore, after: RecordStore, transaction: Transaction) {
        this.addOperationForStore(parent, {id: insert.id, after: after.id}, transaction, Command.ListAfter);
        return {
            parent: parent,
            child: insert.cloneWithNewParent(parent)
        }
    }
    
    public static insertChildBeforeTarget(parent: RecordStore, insert: RecordStore, before: RecordStore, transaction: Transaction) {
        this.addOperationForStore(parent, {id: insert.id, before: before.id}, transaction, Command.ListBefore)
    }

    public static addUpdateOperationForStore(store: RecordStore, data: any, transaction: Transaction) {
        this.addOperationForStore(store, data, transaction, Command.Update);
    }

    public static addSetOperationForStore(store: RecordStore, data: any, transaction: Transaction) {
        this.addOperationForStore(store, data, transaction, Command.Set);
    }

    public static addOperationForStore(store: RecordStore, data: any, transaction: Transaction, command: Command) {
        transaction.addOperation(
            store,
            {
                id: store.id,
                table: store.table,
                path: store.path,
                command: command,
                args: data
            }
        );
    }
}