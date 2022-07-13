import { Disposable } from "vs/base/common/lifecycle";
import { getSelectionFromRange, TextSelection, TextSelectionMode } from "mote/editor/common/core/selection";
import { textChange } from "mote/editor/common/core/textChange";
import BlockStore from "mote/editor/common/store/blockStore";
import * as segmentUtils from "mote/editor/common/segmentUtils";
import { EditOperation } from "../common/core/editOperation";
import { emptyOrArray, ISegment } from "mote/editor/common/segmentUtils";
import { DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL } from "diff-match-patch";
import { EditorState, TextSelectionState } from "../common/editorState";
import { Transaction } from "../common/core/transaction";
import { getParentBlockStore } from "../common/storeUtils";
import blockTypes, { contentTypes, pureTextTypes, textBasedTypes } from "../common/blockTypes";
import { Lodash } from "mote/base/common/lodash";



export class BlockService extends Disposable {
    private state: EditorState;

    constructor(state: EditorState) {
        super();
        this.state = state;
    }
    
    public onChange(store: BlockStore, transaction, selection:TextSelection, newValue: string) {
        const oldRecord = store.getValue();
        const content = segmentUtils.collectValueFromSegment(oldRecord);
        const diffResult = textChange(selection, content, newValue);

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

        if (needChange) {
            const selection = getSelectionFromRange();
            if (selection) {
                this.state.updateSelection({
                    selection: selection?.selection
                })
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

            const newSelection: TextSelection = {
                startIndex: selection.startIndex + content.length,
                endIndex: selection.endIndex + content.length
            }

            this.state.updateSelection({
                store: store,
                selection: newSelection
            })

            EditOperation.addSetOperationForStore(
                store,
                segmentUtils.merge(storeValue, [segment], selection.startIndex),
                transaction
            )
            
        }
    }

    public delete(transaction: Transaction, store: BlockStore, selection: TextSelection, selectionMode: TextSelectionMode) {
        if (selection.startIndex != selection.endIndex) {
            const storeValue = store.getValue();
            const newRecord = segmentUtils.remove(storeValue, selection.startIndex, selection.endIndex);
            console.log(`transaction[${transaction.id}] record after delete `, storeValue, selection, newRecord);

            const newSelection: TextSelection = {
                startIndex: selection.startIndex,
                endIndex: selection.startIndex
            };
            
            this.state.updateSelection({
                store: store,
                selection: newSelection
            });

            EditOperation.addSetOperationForStore(store, newRecord, transaction);

            const rootStore = store.getRecordStoreAtRootPath();
            if ("block" == rootStore.table) {
                const removedRecord = segmentUtils.slice(storeValue, selection.startIndex, selection.endIndex);
            }

            
        } else {
            this.state.updateSelection({
                store: store,
                selection: selection
            });
        }
    }

    public newLine(transaction: Transaction, store: BlockStore) {
        const selectionState =  this.state.selectionState;
        const selection = selectionState.selection;
        let parentStore: BlockStore;
        if ("page" == store.table) {
            parentStore =  store.recordStoreParentStore as BlockStore;
        } else {
            const titleStore = store.recordStoreParentStore;
            parentStore = titleStore?.recordStoreParentStore as BlockStore;
        }

        this.delete(transaction, store, selection, selectionState.mode);
        let newLineStore = EditOperation.createBlockStore("text", transaction);

        newLineStore = EditOperation.insertChildAfterTarget(
            parentStore.getContentStore(), newLineStore, store, transaction).child as BlockStore;
        const titleStore = newLineStore.getTitleStore();
        this.state.updateSelection({
            store: titleStore
        });
    }

    public backspace(transaction: Transaction, store: BlockStore, deleteForwards: boolean, event: KeyboardEvent) {
        const selection = this.state.selectionState.selection;
        if (!selection) {
            return;
        }
        if ( 0 !== selection.startIndex || 0 !== selection.endIndex || deleteForwards ) {
            if ( deleteForwards) {
                event.preventDefault();
            } else {
                event.preventDefault();
                let newSelection: TextSelection;
                if ( selection.startIndex === selection.endIndex ) {
                    if ( deleteForwards ) {
                        newSelection = {startIndex: selection.startIndex, endIndex: selection.endIndex + 1};
                    } else {
                        newSelection = {startIndex: selection.startIndex -1, endIndex: selection.endIndex};
                    }
                } else {
                    newSelection = selection;
                }
                this.delete(transaction, store, newSelection, this.state.selectionState.mode);
            }
        } else {
            event.preventDefault();
            const parentStore = getParentBlockStore(store);
            if (parentStore) {
                const record = parentStore.getValue();
                if (record) {
                    if (textBasedTypes.has(record.type)) {
    
                        EditOperation.turnInto(parentStore, blockTypes.text, transaction);
    
                    } else if (pureTextTypes.has(record.type)) {
    
                        const pageContentStore = getParentBlockStore(parentStore);
                        if (pageContentStore && pageContentStore.table == "page") {
                            const blockIds = pageContentStore.getValue();
                            console.log("blockIds", blockIds);
                            const storeIdx = Lodash.findIndex(blockIds, (id)=>id==store.id);
                            EditOperation.removeChild(pageContentStore, store, transaction);
                            
                            if (storeIdx > 0) {
                                const prevStoreId = blockIds[storeIdx-1];
                                const titleStore = BlockStore.createChildStore(pageContentStore, {
                                    table: store.table,
                                    id: prevStoreId
                                }, store.path);
                                const content = segmentUtils.collectValueFromSegment(titleStore.getValue());
                                console.log("prevId:", prevStoreId);
                                this.state.updateSelection({
                                    store: titleStore,
                                    selection: {
                                        startIndex: content.length,
                                        endIndex: content.length
                                    }
                                });
                            }
                            
                            // TODO add auto focus to prev store
                        }
    
                    } else if (contentTypes.has(record.type)) {
    
                    }
                }
            }
        }
    }
}