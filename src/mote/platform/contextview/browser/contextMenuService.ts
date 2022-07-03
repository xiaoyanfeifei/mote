import { IContextMenuDelegate } from "mote/base/browser/contextmenu";
import { Emitter } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IContextMenuService } from "./contextView";

export class BrowserContextMenuService extends Disposable implements IContextMenuService {
    declare readonly _serviceBrand: undefined;

    private readonly _onDidShowContextMenu = new Emitter<void>();
	readonly onDidShowContextMenu = this._onDidShowContextMenu.event;

	private readonly _onDidHideContextMenu = new Emitter<void>();
	readonly onDidHideContextMenu = this._onDidHideContextMenu.event;

    showContextMenu(delegate: IContextMenuDelegate): void {
        
    }
}