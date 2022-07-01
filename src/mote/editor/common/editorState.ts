import { TextSelection, TextSelectionMode } from "mote/editor/common/core/selection";
import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import BlockStore from "mote/editor/common/store/blockStore";

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

    //#region properties

    public get selectionState () {
        return this._selectionState;
    }

    //#endregion

    public updateSelection(selection?: TextSelection) {
        if (selection) {
            const isEmpty = TextSelectionMode.Empty === this.selectionState.mode;
            this.selectionState.selection = selection;
        }
        
    }
}

