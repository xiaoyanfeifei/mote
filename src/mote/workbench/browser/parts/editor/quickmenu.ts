import { Button } from "mote/base/browser/ui/button/button";
import { CSSProperties } from "mote/base/jsx"
import { setStyles } from "mote/base/jsx/createElement";
import { ThemedStyles } from "mote/base/ui/themes"
import { Segment } from "mote/editor/common/core/segment";
import { $ } from "vs/base/browser/dom";

class ActionButtonFactory {

    static getBorderRight = () => {
        return {
            marginRight: 1,
            boxShadow: `1px 0 0 ${ThemedStyles.regularDividerColor.dark}`
        }
    }

    static getButtonStyle = (): CSSProperties => {
        return Object.assign({
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            whiteSpace: "nowrap" as any,
            height: "100%"
        }, this.getBorderRight())
    }

    public static buildWithTextDecoration(container: HTMLElement, textDecoration: string, label: string) {
        const child = $("span");
        child.style.textDecoration = textDecoration;
        child.textContent = label;
        return this.build(container, child);
    }

    public static build(container: HTMLElement, child: HTMLElement | string) {
        const button = new Button(container, {style: this.getButtonStyle()});
        button.setChildren(child);
        button.onDidClick(()=>{
            //Segment.update({})
        });
        return button;
    }
}

export class QuickMenu {

    private _element: HTMLElement;

    constructor() {

        this._element = $("div.quick-menu");
        setStyles(this._element, this.getStyle());

        const boldBtn = ActionButtonFactory.build(this._element, "B");

        const italicElement = $("span");
        italicElement.style.fontStyle = "italic";
        italicElement.textContent = "I";
        const italicBtn = ActionButtonFactory.build(this._element, italicElement);

        const underlineBtn = ActionButtonFactory.buildWithTextDecoration(this._element, "underline", "U");
        const strikeThoughBtn = ActionButtonFactory.buildWithTextDecoration(this._element, "line-through", "ab");
    }

    public create() {

    }

    public get element() {
        return this._element;
    }

    getStyle() {
        return {
            display: "inline-flex",
            alignItems: "stretch",
            height: "32px",
            background: ThemedStyles.popoverBackground.dark,
            //overflow: "hidden",
            fontSize: "14px",
            lineHeight: "1.2",
            borderRadius: "3px",
            boxShadow: ThemedStyles.mediumBoxShadow.dark,
        }
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