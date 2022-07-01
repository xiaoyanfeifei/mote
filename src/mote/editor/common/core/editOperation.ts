import * as uuid from "uuid";
import RecordStore from "mote/editor/common/store/recordStore";
import BlockStore from "../store/blockStore";
import { Transaction } from "./transaction";
import { Command } from "mote/editor/common/operations";

export class EditOperation {

    public static createBlockStore(type: string, transaction: Transaction) {
        const id = uuid.v1();
        const blockStore = new BlockStore({
            table: "block",
            id: id
        }, transaction.userId);
        this.addSetOperationForStore(blockStore, {
            type: type
        }, transaction);
        return blockStore;
    }

    public static createChild(parent: BlockStore, transaction: Transaction) {
        const child = this.createBlockStore("text", transaction);
        this.appendToParent(parent.getContentStore(), child, transaction);
    }

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