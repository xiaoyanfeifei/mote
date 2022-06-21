import { CSSProperties } from "mote/base/jsx";
import { setStyles } from "mote/base/jsx/createElement";
import fonts from "mote/base/ui/fonts";
import { EditableContainer } from "mote/editor/browser/editableContainer";
import BlockStore from "mote/editor/common/store/blockStore";
import { $ } from "vs/base/browser/dom";
import { IDisposable } from "vs/base/common/lifecycle";

interface BlockOptions {
    placeholder?: string;
    style?: CSSProperties;
}

interface Block {
    get element(): HTMLElement;

    update(): void;
}

abstract class BaseBlock implements Block {

    private _store!: BlockStore;
    private listener!: IDisposable;

    public abstract get element(): HTMLElement;

    public abstract update(): void;
    
    set store(value: BlockStore) {
        this._store = value;
        if (this.listener) {
            this.listener.dispose();
        }
        this.listener = this._store.onDidChange(this.update);
    }
}

class TextBasedBlock extends BaseBlock {

    private _element: HTMLElement;
    protected options: BlockOptions;
    private input: EditableContainer;

    constructor(options: BlockOptions) {
        super();
        this.options = options;
        this._element = $("text-block");
        this.input = new EditableContainer(this._element, {
            placeholder: options.placeholder || "Type to continue"
        });
        if (this.getStyle()) {
            setStyles(this.element, this.getStyle()!);
        }
    }

    public get element(): HTMLElement {
        return this._element;
    }
    
    public override set store(value: BlockStore) {
        super.store = value;
        this.input.store = value.getTitleStore();
    }

    public update(): void {
        
    }

    public getStyle(): void | CSSProperties {
        
    } 
}

export class TextBlock extends TextBasedBlock {

    public override getStyle(): void | CSSProperties {
        return Object.assign({
            width: "100%",
        }, this.options.style)
    }
}


export class HeaderBlock {

    private options: BlockOptions;

    private container: HTMLElement;
    private input: EditableContainer;

    constructor(options: BlockOptions) {
        this.options = options;
        this.container = $("header-block");
        setStyles(this.container, this.getStyle());
        this.input = new EditableContainer(this.container, {});
    }

    getStyle() {
        return Object.assign({
            display: "flex",
            width: "100%",
            fontWeight: fonts.fontWeight.semibold,
            fontSize: "1.875em",
            lineHeight: 1.3
        }, this.options.style)
    }
}