import { Disposable } from "vs/base/common/lifecycle";
import { TextSelection, TextSelectionMode } from "mote/editor/common/core/selection";
import { textChange } from "mote/editor/common/core/textChange";
import BlockStore from "mote/editor/common/store/blockStore";
import * as segmentUtils from "mote/editor/common/segmentUtils";
import { EditOperation } from "../common/core/editOperation";
import { ISegment } from "mote/editor/common/segmentUtils";
import { DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL } from "diff-match-patch";

export class BlockService extends Disposable {
    
    public onChange(store, transaction, selection:TextSelection, oldValue: string, newValue: string) {
        const diffResult = textChange(selection, oldValue, newValue);

        let needChange = false;
        let startIndex = 0;
        let deleteFlag = false;

        for (const [op, txt] of diffResult) {
            switch (op) {
                case DIFF_INSERT:
                    needChange = true;
                    this.insert(
                        txt,
                        transaction,
                        store,
                        {
                            startIndex: startIndex,
                            endIndex: startIndex
                        },
                        TextSelectionMode.Editing
                    );
                    startIndex += txt.length;
                    break;
                case DIFF_DELETE:
                    needChange = true;
                    deleteFlag = false;
                    this.delete(
                        transaction,
                        store,
                        {
                            startIndex: startIndex,
                            endIndex: startIndex + txt.length
                        },
                        TextSelectionMode.Editing
                    );
                    break;
                default:
                    if (DIFF_EQUAL == op) {
                        startIndex += txt.length;
                    }
            }
        }

    }

    public insert(content: string, transaction, store: BlockStore, selection: TextSelection, selectionMode: TextSelectionMode) {
        if (TextSelectionMode.Editing != selectionMode) {
            return;
        }

        this.delete(transaction, store, selection, selectionMode);

        if (content.length > 0) {
            const segment = segmentUtils.combineArray(content, []) as ISegment;

            const storeValue = store.getValue();
            EditOperation.addSetOperationForStore(
                store,
                segmentUtils.merge(storeValue, [segment], selection.startIndex),
                transaction
            )

            const newSelection: TextSelection = {
                startIndex: selection.startIndex + content.length,
                endIndex: selection.endIndex + content.length
            }

        }
    }

    public delete(transaction, store: BlockStore, selection: TextSelection, selectionMode: TextSelectionMode) {
        if (selection.startIndex != selection.endIndex) {
            const storeValue = store.getValue();
            const newRecord = segmentUtils.remove(storeValue, selection.startIndex, selection.endIndex);
            console.debug(`transaction[${transaction.id}] record after delete `, storeValue, selection, newRecord);
            EditOperation.addSetOperationForStore(store, newRecord, transaction);

            const rootStore = store.getRecordStoreAtRootPath();
            if ("block" == rootStore.table) {
                const removedRecord = segmentUtils.slice(storeValue, selection.startIndex, selection.endIndex);
            }

            const newSelection: TextSelection = {
                startIndex: selection.startIndex,
                endIndex: selection.startIndex
            };
            // TODO update selection
        } else {
            // Update selection
        }
    }
}