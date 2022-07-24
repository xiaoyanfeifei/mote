import { Disposable } from 'vs/base/common/lifecycle';
import * as viewEvents from 'mote/editor/common/viewEvents';


export class ViewEventHandler extends Disposable {
	private _shouldRender: boolean = true;

	public shouldRender(): boolean {
		return this._shouldRender;
	}

	public forceShouldRender(): void {
		this._shouldRender = true;
	}

	protected setShouldRender(): void {
		this._shouldRender = true;
	}

	public onDidRender(): void {
		this._shouldRender = false;
	}

	// --- begin event handlers

	public handleEvents(events: viewEvents.ViewEvent[]): void {

	}
}
