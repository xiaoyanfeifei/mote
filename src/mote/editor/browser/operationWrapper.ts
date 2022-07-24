import { AnchorAlignment } from "mote/base/browser/ui/contextview/contextview";
import { IEditorStateService } from "mote/workbench/services/editor/common/editorService";
import { IQuickMenuService } from "mote/workbench/services/quickmenu/browser/quickmenu";
import { addDisposableListener, EventType } from "vs/base/browser/dom";
import { ButtonWithDropdown } from "vs/base/browser/ui/button/button";
import { HoverPosition } from "vs/base/browser/ui/hover/hoverWidget";
import { Emitter, Event as BaseEvent } from "vs/base/common/event";
import { KeyCode, KeyCodeUtils } from "vs/base/common/keyCodes";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { RangeUtils } from "../common/core/rangeUtils";
import { getSelectionFromRange, TextSelectionMode } from "../common/core/selectionUtils";
import { EditorState } from "../common/editorState";
import BlockStore from "../common/store/blockStore";

export interface OperationViewDelegate {
    render(container: HTMLElement): IDisposable;
}

interface OperationWrapperOptions {

}

export class OperationWrapper extends Disposable {

    private element: HTMLElement;
    private blockstore?: BlockStore;

    private _onDidDelete = this._register(new Emitter<Event>());
    get onDidDelete(): BaseEvent<Event> { return this._onDidDelete.event; }

    private _onDidEnter = this._register(new Emitter<Event>());
    get onDidEnter(): BaseEvent<Event> { return this._onDidEnter.event; }

    constructor(
        element: HTMLElement,
        //options: OperationWrapperOptions,
        @IQuickMenuService private quickMenuService: IQuickMenuService,
        @IEditorStateService private editorStateService: IEditorStateService,
    ) {
        super();
        this.element = element;

        this._register(addDisposableListener(element, EventType.MOUSE_UP, () => this.handleSelect()))
        this._register(addDisposableListener(element, EventType.CLICK, () => this.handleSelect()))
        this._register(addDisposableListener(this.element, EventType.KEY_DOWN, (e) => {
            if (e.code == KeyCodeUtils.toString(KeyCode.Enter)) {
                this._onDidEnter.fire(e);
            }
            if ((e.code == KeyCodeUtils.toString(KeyCode.Backspace)) ||
                (e.code == KeyCodeUtils.toString(KeyCode.Delete))) {
                this._onDidDelete.fire(e);
            }
        }));

    }

    set store(value: BlockStore) {
        this.blockstore = value;
    }

    private handleSelect() {
        const textSelection = getSelectionFromRange();
        const editorState = this.editorStateService.getEditorState();
        const textSelectionState = this.editorStateService.getEditorState().selectionState;

        if (textSelection) {
            editorState.updateSelection({
                store: this.blockstore!,
                selection: textSelection.selection
            })
        }
        if (textSelection && textSelection.selection.endIndex > textSelection.selection.startIndex) {
            const isNotEmpty = TextSelectionMode.Empty != textSelectionState.mode;
            console.log("handle selection:", getSelectionFromRange(), RangeUtils.get());
            this.editorStateService.getEditorState
            this.quickMenuService.showQuickMenu({
                state: {
                    store: this.blockstore!,
                    selection: textSelection.selection,
                    mode: TextSelectionMode.Editing
                }
            });
        }
    }

    private saveSerializedTextSelection() {

    }
}
