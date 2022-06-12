import { HoverPosition } from "vs/base/browser/ui/hover/hoverWidget";
import { Widget } from "vs/base/browser/ui/widget";
import { Emitter, Event } from "vs/base/common/event";
import { IHoverOptions } from "./hover";

export class HoverWidget extends Widget { 

    private _isDisposed: boolean = false;
	private _hoverPosition: HoverPosition;
	private _forcePosition: boolean = false;
	private _x: number = 0;
	private _y: number = 0;

	get isDisposed(): boolean { return this._isDisposed; }

    private readonly _onDispose = this._register(new Emitter<void>());
	get onDispose(): Event<void> { return this._onDispose.event; }
    
    constructor(
		options: IHoverOptions,
    ) {
        super();

        this._hoverPosition = options.hoverPosition ?? HoverPosition.ABOVE;
    }
}