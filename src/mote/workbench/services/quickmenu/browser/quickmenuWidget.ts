import { Button } from "mote/base/browser/ui/button/button";
import { CSSProperties } from "mote/base/jsx";
import { setStyles } from "mote/base/jsx/createElement";
import { ThemedStyles } from "mote/base/ui/themes";
import { Segment } from "mote/editor/common/core/segment";
import { getSelectionFromRange, TextSelectionMode } from "mote/editor/common/core/selection";
import { TextSelectionState } from "mote/editor/common/editorState";
import BlockStore from "mote/editor/common/store/blockStore";
import { $ } from "vs/base/browser/dom";
import { Emitter, Event as BaseEvent } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";

interface IActionButtonOptions {
    type: string;
    label: string;
    tooltip?: string | HTMLElement;
    style?: CSSProperties;
}

class ActionButton extends Disposable {
    private _onDidClick = this._register(new Emitter<string>());
	get onDidClick(): BaseEvent<string> { return this._onDidClick.event; }

    private btn: Button;

    constructor(container: HTMLElement,  options: IActionButtonOptions) {
        super();
        const child = $("span");
        child.innerText = options.label;
        setStyles(child, options.style);

        this.btn = new Button(container, {style: this.getButtonStyle()});
        this.btn.setChildren(child);
    
        this.btn.onDidClick((e)=>{
            this._onDidClick.fire(options.type);
        })
    }

    getBorderRight = () => {
        return {
            marginRight: 1,
            boxShadow: `1px 0 0 ${ThemedStyles.regularDividerColor.dark}`
        }
    }

    getButtonStyle = (): CSSProperties => {
        return Object.assign({
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            whiteSpace: "nowrap" as any,
            height: "100%"
        }, this.getBorderRight())
    }
}

export const QuickMenuHeight = 32;


export class QuickMenuWidget {
    private _element: HTMLElement;

    private selectState!: TextSelectionState;

    constructor() {
        this._element = $("div.quick-menu");
        setStyles(this._element, this.getStyle());

        const boldBtn = new ActionButton(this._element, {
            type: "b",
            label: "B"
        });
        boldBtn.onDidClick(this.handleAnnotationClick);

        const italicBtn = new ActionButton(this._element, {
            type: "i",
            style: {fontStyle: "italic"},
            label: "I"
        });
        italicBtn.onDidClick(this.handleAnnotationClick);
        
        const underlineBtn = new ActionButton(this._element, {
            type: "_",
            style: {textDecoration: "underline"},
            label: "U"
        });
        underlineBtn.onDidClick(this.handleAnnotationClick);

        const strikeThoughBtn = new ActionButton(this._element, {
            type: "s",
            style: {textDecoration: "line-through"},
            label: "ab"
        });
        strikeThoughBtn.onDidClick(this.handleAnnotationClick);
    }

    private handleAnnotationClick = (type: string) => {
        Segment.update(this.selectState, [type]);
    }

    configure(value: TextSelectionState) {
        this.selectState = value;
    }

    get element() {
        return this._element;
    }

    getStyle() {
        return {
            display: "inline-flex",
            alignItems: "stretch",
            height: `${QuickMenuHeight}px`,
            background: ThemedStyles.popoverBackground.dark,
            //overflow: "hidden",
            fontSize: "14px",
            lineHeight: "1.2",
            borderRadius: "3px",
            boxShadow: ThemedStyles.mediumBoxShadow.dark,
        }
    }
}