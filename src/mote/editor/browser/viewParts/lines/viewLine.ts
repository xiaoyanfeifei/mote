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
import { CSSProperties } from 'mote/base/browser/jsx/style';
import { setStyles } from 'mote/base/browser/jsx/createElement';
import fonts from 'mote/base/browser/ui/fonts';

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
		// TODO move this part to contrib, block should register by registry
		const type = store.getType() || 'text';
		let viewBlock: ViewBlock;
		switch (type) {
			case 'header':
				viewBlock = new HeaderBlock(lineNumber, this.viewContext, this.viewController);
				break;
			case 'quote':
				viewBlock = new QuoteBlock(lineNumber, this.viewContext, this.viewController);
				break;
			default:
				viewBlock = new ViewBlock(lineNumber, this.viewContext, this.viewController);
		}
		viewBlock.setValue(store);
		this.domNode = viewBlock.getDomNode().domNode;
		this.domNode.className = 'view-line';

		return true;
	}
}

abstract class BaseBlock {
	private editableHandler: EditableHandler;

	constructor(
		lineNumber: number,
		viewContext: ViewContext,
		viewController: ViewController
	) {
		this.editableHandler = this.renderPersisted(lineNumber, viewContext, viewController);
		this.editableHandler.editable.domNode.style.minHeight = '1em';
		if (viewController.getSelection().lineNumber === lineNumber) {
			this.editableHandler.focusEditable();
		}

		const style = this.getStyle();
		if (style) {
			this.editableHandler.applyStyles(style);
		}
	}

	abstract renderPersisted(lineNumber: number, viewContext: ViewContext, viewController: ViewController): EditableHandler;

	protected getStyle(): void | CSSProperties {

	}

	setValue(store: BlockStore) {
		const html = segmentsToElement(store.getTitleStore().getValue()).join('');
		this.editableHandler.setValue(html);
	}

	getDomNode() {
		return this.editableHandler.editable;
	}
}

class ViewBlock extends BaseBlock {

	override renderPersisted(
		lineNumber: number,
		viewContext: ViewContext,
		viewController: ViewController
	): EditableHandler {
		return new EditableHandler(lineNumber, viewContext, viewController, { placeholder: 'Type to continue' });
	}

	override getStyle(): CSSProperties {
		return {
			padding: '3px 2px',
		};
	}
}

class HeaderBlock extends ViewBlock {
	override getStyle(): CSSProperties {
		return Object.assign({
			display: 'flex',
			width: '100%',
			fontWeight: fonts.fontWeight.semibold,
			fontSize: '1.875em',
			lineHeight: 1.3
		}, {});
	}
}

class QuoteBlock extends ViewBlock {

	private container!: FastDomNode<HTMLDivElement>;

	override renderPersisted(
		lineNumber: number,
		viewContext: ViewContext,
		viewController: ViewController
	) {
		const editableHandler = super.renderPersisted(lineNumber, viewContext, viewController);
		this.container = createFastDomNode(document.createElement('div'));
		this.container.domNode.style.padding = '3px 2px';
		this.container.appendChild(editableHandler.editable);
		return editableHandler;
	}

	override getDomNode() {
		return this.container;
	}

	override getStyle() {
		return Object.assign({
			borderLeft: '3px solid currentColor',
			paddingLeft: '0.9em',
			paddingRight: '0.9em'
		}, {});
	}
}
