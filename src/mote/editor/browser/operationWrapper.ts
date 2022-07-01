import { QuickMenu } from "mote/workbench/browser/parts/editor/quickmenu";
import { IHoverService } from "mote/workbench/services/hover/browser/hover";
import { addDisposableListener, EventType } from "vs/base/browser/dom";
import { ButtonWithDropdown } from "vs/base/browser/ui/button/button";
import { HoverPosition } from "vs/base/browser/ui/hover/hoverWidget";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { Range } from "../common/core/range";
import { getSelectionFromRange } from "../common/core/selection";
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

    constructor(
        element: HTMLElement, 
        //options: OperationWrapperOptions,
        @IHoverService private hoverService: IHoverService,
    ) {
        super();
        this.element = element;

        this._register(addDisposableListener(element, "mouseleave", ()=>this.handleSelect()))
        //this._register(addDisposableListener(this.element, EventType.CLICK, ()=>this.handleSelect()))
      
    }

    set store(value: BlockStore) {
        this.blockstore = value;
    }

    private handleSelect() {
        const selection = document.getSelection();
        
        console.log("handle selection:", getSelectionFromRange(), Range.get());
        const menu = new QuickMenu();
        this.hoverService.showHover({
            content: menu.element,
            target: this.element,
            hoverPosition: HoverPosition.ABOVE,
            hideOnHover: false,
        }, true);
    }

    private saveSerializedTextSelection(){
        
    }
}