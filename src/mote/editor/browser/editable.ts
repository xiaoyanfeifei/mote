import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { $ } from "vs/base/browser/dom";
import { CSSProperties } from "mote/base/jsx";
import { setStyles } from "mote/base/jsx/createElement";
import { Widget } from "vs/base/browser/ui/widget";
import { nodeToString } from "../common/textSerialize";
import { Emitter, Event } from "vs/base/common/event";

interface EditableOptions {
    placeholder?: string;
}

export class Editable extends Widget {
    private input: HTMLElement;

    private _onDidChange = this._register(new Emitter<string>());
	public readonly onDidChange: Event<string> = this._onDidChange.event;

    constructor(container: HTMLElement, options: EditableOptions) {
        super();

        this.input = $("");
        this.input.contentEditable = "true";
        if (options.placeholder) {
            this.input.setAttribute("placeholder", options.placeholder);
        }

        this.oninput(this.input, ()=>this.onValueChange());

        container.append(this.input);
    }

    public get value(): string {
		return nodeToString(this.input);
	}

    public set value(newValue: string) {
        this.input.innerHTML = newValue;
        console.log("input, innner:", newValue);
    }

    private onValueChange() {
        this._onDidChange.fire(this.value);
    }

    style(value: CSSProperties) {
        setStyles(this.input, value);
    }
}