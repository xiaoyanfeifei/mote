import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ViewEventHandler } from 'mote/editor/common/viewEventHandler';

export abstract class ViewPart extends ViewEventHandler {

	constructor(
		protected context: ViewContext
	) {
		super();
	}
}
