import * as dom from 'vs/base/browser/dom';
import { EditableHandler } from 'mote/editor/browser/controller/editableHandler';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ViewController } from 'mote/editor/browser/view/viewController';
import BlockStore from 'mote/editor/common/store/blockStore';
import { segmentsToElement } from 'mote/editor/common/textSerialize';
import { createFastDomNode, FastDomNode } from 'vs/base/browser/fastDomNode';
import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IVisibleLine } from 'mote/editor/browser/view/viewLayer';

export class EmptyViewLine extends Disposable {

	private domNode: FastDomNode<HTMLElement> = createFastDomNode(document.createElement('div'));

	public readonly onClick = this._register(dom.createEventEmitter(this.domNode.domNode, 'click')).event;


	constructor(
		private readonly viewController: ViewController,
	) {
		super();
		this.domNode.setClassName('view-line');
		this.domNode.domNode.style.cursor = 'pointer';
		this.onClick((e) => this.viewController.enter());
	}

	renderLine() {
		this.domNode.domNode.innerText = 'Click to continue';
	}

	getDomNode() {
		return this.domNode.domNode;
	}
}

export class ViewLine implements IVisibleLine {
	public static readonly CLASS_NAME = 'view-line';

	private domNode: HTMLElement | null = null;

	constructor(
		private readonly viewContext: ViewContext,
		private readonly viewController: ViewController,
		@IInstantiationService private instantiationService: IInstantiationService,
	) {

	}

	layoutLine(lineNumber: number): void {
		throw new Error('Method not implemented.');
	}

	onContentChanged(): void {
		throw new Error('Method not implemented.');
	}

	public getDomNode(): HTMLElement | null {
		return this.domNode;
	}

	public setDomNode(domNode: HTMLElement) {
		this.domNode = domNode;
	}

	public renderLine(lineNumber: number, store: BlockStore) {

		const block = new ViewBlock(lineNumber, this.viewContext, this.viewController);
		block.setValue(store);
		this.domNode = block.getDomNode().domNode;
		this.domNode.className = 'view-line';
		this.domNode.style.minHeight = '1em';

		return true;
	}
}

class ViewBlock {

	private editableHandler: EditableHandler;

	constructor(
		lineNumber: number,
		viewContext: ViewContext,
		viewController: ViewController
	) {
		this.editableHandler = new EditableHandler(lineNumber, viewContext, viewController, { placeholder: 'Type to continue' });
		if (viewController.getSelection().lineNumber === lineNumber) {
			this.editableHandler.focusEditable();
		}
	}

	setValue(store: BlockStore) {
		const html = segmentsToElement(store.getTitleStore().getValue()).join('');
		this.editableHandler.setValue(html);
	}

	getDomNode() {
		return this.editableHandler.editable;
	}
}