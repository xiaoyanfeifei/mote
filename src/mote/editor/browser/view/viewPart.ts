import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ViewEventHandler } from 'mote/editor/common/viewEventHandler';

export abstract class ViewPart extends ViewEventHandler {

	constructor(
		protected context: ViewContext
	) {
		super();

		this.context.addEventHandler(this);
	}

	public override dispose(): void {
		this.context.removeEventHandler(this);
		super.dispose();
	}

	public abstract prepareRender(): void;
	public abstract render(): void;

}
