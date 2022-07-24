import { EditableHandler } from 'mote/editor/browser/controller/editableHandler';
import { ICommandDelegate, ViewController } from 'mote/editor/browser/view/viewController';
import { ViewPart } from 'mote/editor/browser/view/viewPart';
import { ViewEventHandler } from 'mote/editor/common/viewEventHandler';
import { createFastDomNode, FastDomNode } from 'vs/base/browser/fastDomNode';

export class EditorView extends ViewEventHandler {
	private readonly viewParts: ViewPart[];

	private readonly editableHandler: EditableHandler;

	// Dom nodes
	public readonly domNode: FastDomNode<HTMLElement>;

	constructor(
		commandDelegate: ICommandDelegate,
	) {
		super();

		this.domNode = createFastDomNode(document.createElement('div'));

		const viewController = new ViewController(commandDelegate);

		this.viewParts = [];

		// Keyboard handler
		this.editableHandler = new EditableHandler(viewController);
		this.viewParts.push(this.editableHandler);
	}
}
