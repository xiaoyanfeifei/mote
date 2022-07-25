import { ViewController } from 'mote/editor/browser/view/viewController';
import RecordStore from 'mote/editor/common/store/recordStore';
import { ViewEventHandler } from 'mote/editor/common/viewEventHandler';

export class ViewContext {

	constructor(
		public readonly contentStore: RecordStore,
		private readonly controller: ViewController
	) {

	}

	public addEventHandler(eventHandler: ViewEventHandler): void {
		this.controller.addViewEventHandler(eventHandler);
	}

	public removeEventHandler(eventHandler: ViewEventHandler): void {
		this.controller.removeViewEventHandler(eventHandler);
	}
}
