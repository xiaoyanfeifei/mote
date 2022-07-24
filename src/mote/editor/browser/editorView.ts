import { EditableHandler } from 'mote/editor/browser/controller/editableHandler';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ICommandDelegate, ViewController } from 'mote/editor/browser/view/viewController';
import { ViewPart } from 'mote/editor/browser/view/viewPart';
import { ViewLines } from 'mote/editor/browser/viewParts/lines/viewLines';
import RecordStore from 'mote/editor/common/store/recordStore';
import { ViewEventHandler } from 'mote/editor/common/viewEventHandler';
import { createFastDomNode, FastDomNode } from 'vs/base/browser/fastDomNode';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

export class EditorView extends ViewEventHandler {
	private readonly viewParts: ViewPart[];

	private readonly viewLines: ViewLines;

	// Dom nodes
	public readonly domNode: FastDomNode<HTMLElement>;
	private readonly linesContent: FastDomNode<HTMLElement>;

	constructor(
		commandDelegate: ICommandDelegate,
		contentStore: RecordStore,
		@IInstantiationService private instantiationService: IInstantiationService,
	) {
		super();

		this.domNode = createFastDomNode(document.createElement('div'));

		// These two dom nodes must be constructed up front, since references are needed in the layout provider (scrolling & co.)
		this.linesContent = createFastDomNode(document.createElement('div'));
		this.linesContent.setClassName('lines-content' + ' monaco-editor-background');
		this.linesContent.domNode.style.paddingLeft = this.getSafePaddingLeftCSS(96);
		this.linesContent.domNode.style.paddingRight = this.getSafePaddingRightCSS(96);

		const context = new ViewContext(contentStore);

		const viewController = new ViewController(contentStore, commandDelegate);

		this.viewParts = [];

		this.viewLines = this.instantiationService.createInstance(ViewLines, context, viewController, this.linesContent);


		this.linesContent.appendChild(this.viewLines.getDomNode());
		this.domNode.appendChild(this.linesContent);

		this.viewLines.renderText();
	}

	getSafePaddingLeftCSS(padding: number) {
		return `calc(${padding}px + env(safe-area-inset-left))`;
	}

	getSafePaddingRightCSS(padding: number) {
		return `calc(${padding}px + env(safe-area-inset-right))`;
	}
}
