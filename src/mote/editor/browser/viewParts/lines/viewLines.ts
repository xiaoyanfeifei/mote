import 'vs/css!./viewLines';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ViewController } from 'mote/editor/browser/view/viewController';
import { IVisibleLinesHost } from 'mote/editor/browser/view/viewLayer';
import { ViewPart } from 'mote/editor/browser/view/viewPart';
import { EmptyViewLine, ViewLine } from 'mote/editor/browser/viewParts/lines/viewLine';
import { ViewLinesChangedEvent, ViewLinesDeletedEvent, ViewLinesInsertedEvent } from 'mote/editor/common/viewEvents';
import { ViewportData } from 'mote/editor/common/viewLayout/viewLinesViewportData';
import { clearNode } from 'vs/base/browser/dom';
import { createFastDomNode, FastDomNode } from 'vs/base/browser/fastDomNode';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { StoreUtils } from 'mote/platform/store/common/storeUtils';

export class ViewLines extends ViewPart implements IVisibleLinesHost<ViewLine> {

	private domNode: FastDomNode<HTMLElement>;

	private lines: ViewLine[] = [];

	constructor(
		context: ViewContext,
		private readonly viewController: ViewController,
		linesContent: FastDomNode<HTMLElement>,
		@IInstantiationService private instantiationService: IInstantiationService,
	) {
		super(context);

		this.domNode = createFastDomNode(document.createElement('div'));
		this.domNode.setClassName('view-lines');
		this.domNode.setAttribute('data-root', '');
		this.domNode.domNode.style.width = '900px';

		this._register(this.context.contentStore.onDidUpdate(() => {
			this.renderLines({});
		}));
	}

	public getDomNode(): FastDomNode<HTMLElement> {
		return this.domNode;
	}

	public createVisibleLine(): ViewLine {
		return this.instantiationService.createInstance(ViewLine, this.context, this.viewController);
	}

	public prepareRender(): void {

	}
	public render(): void {
		throw new Error('Method not implemented.');
	}

	public renderLines(viewportData: ViewportData) {
		const pageIds: string[] = this.context.contentStore.getValue() || [];
		clearNode(this.domNode.domNode);
		pageIds.forEach((pageId, idx) => {
			const blockStore = StoreUtils.createStoreForPageId(pageId, this.context.contentStore);
			const viewLine = this.createVisibleLine();
			this.lines[idx] = viewLine;
			viewLine.renderLine(idx, blockStore);
			if (viewLine.getDomNode()) {
				this.domNode.appendChild(viewLine.getDomNode()!);
			}
			this._register(blockStore.onDidUpdate((e) => {
				const viewLineNode = this.lines[idx].getDomNode()!.domNode;

				const viewLine = this.createVisibleLine();
				this.lines[idx] = viewLine;
				viewLine.renderLine(idx, blockStore);

				const childNode = viewLine.getDomNode();
				if (childNode) {
					this.domNode.domNode.replaceChild(childNode.domNode, viewLineNode);
				}
			}));

		});
		if (pageIds.length === 0) {
			const line = new EmptyViewLine(this.viewController);
			line.renderLine();
			this.domNode.domNode.appendChild(line.getDomNode());
		}
	}

	//#region view events handler

	public override onLinesInserted(e: ViewLinesInsertedEvent): boolean {
		return true;
	}

	public override onLinesDeleted(e: ViewLinesDeletedEvent): boolean {
		return true;
	}

	public override onLinesChanged(e: ViewLinesChangedEvent): boolean {
		return true;
	}

	//#endregion
}
