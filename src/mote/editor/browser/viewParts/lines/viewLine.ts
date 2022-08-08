import * as dom from 'vs/base/browser/dom';
import { EditableHandler, EditableHandlerOptions } from 'mote/editor/browser/controller/editableHandler';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ViewController } from 'mote/editor/browser/view/viewController';
import BlockStore from 'mote/platform/store/common/blockStore';
import { segmentsToElement } from 'mote/editor/common/textSerialize';
import { createFastDomNode, FastDomNode } from 'vs/base/browser/fastDomNode';
import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IVisibleLine } from 'mote/editor/browser/view/viewLayer';
import { CSSProperties } from 'mote/base/browser/jsx/style';
import fonts from 'mote/base/browser/ui/fonts';
import { CheckBox } from 'mote/base/browser/ui/checkbox/checkbox';
import { IThemeService, Themable } from 'mote/platform/theme/common/themeService';
import { lightTextColor } from 'mote/platform/theme/common/themeColors';

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

	private domNode: FastDomNode<HTMLElement> | null = null;

	constructor(
		private readonly viewContext: ViewContext,
		private readonly viewController: ViewController,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {

	}

	layoutLine(lineNumber: number): void {
		throw new Error('Method not implemented.');
	}

	onContentChanged(): void {
		throw new Error('Method not implemented.');
	}

	public getDomNode(): FastDomNode<HTMLElement> | null {
		return this.domNode;
	}

	public setDomNode(domNode: FastDomNode<HTMLElement>) {
		this.domNode = domNode;
	}

	public renderLine(lineNumber: number, store: BlockStore) {
		// TODO move this part to contrib, block should register by registry
		const type = store.getType() || 'text';
		const viewBlockMap = {
			'header': HeaderBlock,
			'heading2': Heading2Block,
			'heading3': Heading3Block,
			'quote': QuoteBlock,
			'todo': TodoBlock,
			'text': ViewBlock,
			'image': ViewBlock,
		};
		const factory = viewBlockMap[type];
		const viewBlock: ViewBlock = (this.instantiationService as any).createInstance(
			factory, lineNumber, this.viewContext, this.viewController, {});
		viewBlock.setValue(store);
		this.domNode = viewBlock.getDomNode();
		this.domNode.setClassName('view-line');
		this.domNode.setAttribute('data-index', lineNumber.toString());

		return true;
	}
}

abstract class BaseBlock extends Themable {
	private editableHandler: EditableHandler;

	constructor(
		lineNumber: number,
		viewContext: ViewContext,
		viewController: ViewController,
		protected readonly options: EditableHandlerOptions,
		@IThemeService themeService: IThemeService,
	) {
		super(themeService);
		this.editableHandler = this.renderPersisted(lineNumber, viewContext, viewController);
		this.editableHandler.editable.domNode.style.minHeight = '1em';
		if (viewController.getSelection().lineNumber === lineNumber) {
			this.editableHandler.focusEditable();
		}

		const style = this.getStyle();
		if (style) {
			this.editableHandler.applyStyles(style);
		}
		this.editableHandler.style({ textFillColor: this.themeService.getColorTheme().getColor(lightTextColor)! });
	}

	abstract renderPersisted(lineNumber: number, viewContext: ViewContext, viewController: ViewController): EditableHandler;

	protected getStyle(): void | CSSProperties {

	}

	setValue(store: BlockStore) {
		const html = segmentsToElement(store.getTitleStore().getValue()).join('');
		this.editableHandler.setValue(html);
		this.editableHandler.setEnabled(store.canEdit());
	}

	getDomNode() {
		return this.editableHandler.editable;
	}
}

export class ViewBlock extends BaseBlock {

	override renderPersisted(
		lineNumber: number,
		viewContext: ViewContext,
		viewController: ViewController,
	): EditableHandler {
		return new EditableHandler(lineNumber, viewContext, viewController, { placeholder: this.getPlaceholder(), forcePlaceholder: this.options?.forcePlaceholder });
	}

	getPlaceholder() {
		if (this.options) {
			return this.options.placeholder ?? 'Type to continue';
		}
		return 'Type to continue';
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

	override getPlaceholder() {
		return 'Heading 1';
	}
}

class Heading2Block extends ViewBlock {
	override getStyle(): CSSProperties {
		return Object.assign({
			display: 'flex',
			width: '100%',
			fontWeight: fonts.fontWeight.semibold,
			fontSize: '1.5em',
			lineHeight: 1.3
		}, {});
	}

	override getPlaceholder() {
		return 'Heading 2';
	}
}

class Heading3Block extends ViewBlock {
	override getStyle(): CSSProperties {
		return Object.assign({
			display: 'flex',
			width: '100%',
			fontWeight: fonts.fontWeight.semibold,
			fontSize: '1.25em',
			lineHeight: 1.3
		}, {});
	}

	override getPlaceholder() {
		return 'Heading 3';
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

class TodoBlock extends ViewBlock {

	private container!: FastDomNode<HTMLDivElement>;

	private checkbox!: CheckBox;

	override renderPersisted(
		lineNumber: number,
		viewContext: ViewContext,
		viewController: ViewController
	) {
		const editableHandler = super.renderPersisted(lineNumber, viewContext, viewController);
		editableHandler.editable.domNode.style.width = '100%';

		this.container = createFastDomNode(document.createElement('div'));
		this.container.domNode.style.padding = '3px 2px';
		this.container.domNode.style.display = 'flex';

		this.checkbox = new CheckBox(this.container.domNode);
		this._register(this.checkbox.onDidClick(() => {
			const checked = this.checkbox.hasChecked();
			viewController.select({ startIndex: 0, endIndex: 0, lineNumber: lineNumber });
			viewController.updateProperties({ checked: checked ? 'true' : 'false' });
		}));

		this.container.appendChild(editableHandler.editable);
		return editableHandler;
	}

	override setValue(store: BlockStore): void {
		super.setValue(store);

		const properties = store.getProperties();
		const checked = properties.checked === 'true';
		this.checkbox.checked(checked);
	}

	override getDomNode() {
		return this.container;
	}
}
