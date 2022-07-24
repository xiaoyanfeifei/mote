import { TextSelection, TextSelectionMode } from "mote/editor/common/core/selectionUtils";
import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import BlockStore from "mote/editor/common/store/blockStore";
import { TextSelectionUpdatePayload } from "mote/workbench/services/editor/common/editorService";

export interface TextSelectionState {
    /**
     * Current mode
     */
    mode: TextSelectionMode;

    /**
     * Current selection
     */
    selection: TextSelection;

    /**
     * The selection belong to
     */
    store?: BlockStore;
}

const initialState: TextSelectionState = {
    mode: TextSelectionMode.Empty,
    selection: {
        startIndex: 0,
        endIndex: 0
    }
}

interface IEditorState {
    selectionState: TextSelectionState;
}

export class EditorState extends Disposable implements IEditorState {
    private _selectionState: TextSelectionState = initialState;

    private _onDidSelectionChange = this._register(new Emitter<TextSelectionState>());
    public readonly onDidSelectionChange: Event<TextSelectionState> = this._onDidSelectionChange.event;

    private _onDidStoreChange = this._register(new Emitter<BlockStore>());
    public readonly onDidStoreChange: Event<BlockStore> = this._onDidStoreChange.event;

    //#region properties

    public get selectionState() {
        return this._selectionState;
    }

    public get blockStore() {
        return this._selectionState.store;
    }

    //#endregion

    public updateSelection(payload: TextSelectionUpdatePayload): void {
        let needStoreFire = false;
        const newState = updateTextSelection(this._selectionState, payload);
        if (newState.store && newState.store != this._selectionState.store) {
            needStoreFire = true;
        }
        this._selectionState = Object.assign({}, this._selectionState, newState);
        this._onDidSelectionChange.fire(this._selectionState);
        if (needStoreFire) {
            this._onDidStoreChange.fire(this.blockStore!);
        }
    }
}

function selectionEqual(s1: TextSelection, s2: TextSelection) {
    if (s1.endIndex == s2.endIndex && s1.startIndex == s2.startIndex) {
        return true;
    }
    return false;
}

function updateTextSelection(textSelectionState: TextSelectionState, payload: TextSelectionUpdatePayload): Partial<TextSelectionState> {
    const { readOnly, store, selection } = payload;
    if (store && selection) {
        const isEmpty = TextSelectionMode.Empty === textSelectionState.mode;
        const isReadOnly = (readOnly && TextSelectionMode.ReadOnly !== textSelectionState.mode) || (!readOnly && TextSelectionMode.ReadOnly === textSelectionState.mode)
        const storeUnmatch = textSelectionState.store == store;
        const selectionNotEq = !selectionEqual(textSelectionState.selection, selection);

        if (isEmpty || isReadOnly || storeUnmatch || selectionNotEq) {
            if (readOnly) {
                return ({
                    mode: TextSelectionMode.ReadOnly,
                    store: store,
                    selection: selection,
                    //savedSelectionXPosition: TextSelectionMode.Empty !== textSelectionState.mode ? textSelectionState.savedSelectionXPosition : void 0
                })
            } else {
                return ({
                    mode: TextSelectionMode.Editing,
                    store: store,
                    selection: selection,
                    //forceExtendAnnotations: TextSelectionMode.Editing === textSelectionState.mode && storeUnmatch ? textSelectionState.forceExtendAnnotations : {},
                    //savedSelectionXPosition: TextSelectionMode.Empty !== textSelectionState.mode ? textSelectionState.savedSelectionXPosition : void 0
                })
            }
        }
    } else {
        if (store && !selection) {
            if (readOnly) {
                return ({
                    mode: TextSelectionMode.ReadOnly,
                    store: store,
                    selection: {
                        startIndex: 0,
                        endIndex: 0
                    },
                    //savedSelectionXPosition: 0
                })
            } else {
                return ({
                    mode: TextSelectionMode.Editing,
                    store: store,
                    selection: {
                        startIndex: 0,
                        endIndex: 0
                    },
                    //forceExtendAnnotations: {},
                    //savedSelectionXPosition: 0
                })
            }
        } else {
            return ({
                store: store,
                mode: TextSelectionMode.Empty
            })
        }
    }
    return { store: store };
}

