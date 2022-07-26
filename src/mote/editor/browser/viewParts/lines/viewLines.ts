import 'vs/css!./viewLines';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ViewController } from 'mote/editor/browser/view/viewController';
import { IVisibleLinesHost, RenderedLinesCollection } from 'mote/editor/browser/view/viewLayer';
import { ViewPart } from 'mote/editor/browser/view/viewPart';
import { EmptyViewLine, ViewLine } from 'mote/editor/browser/viewParts/lines/viewLine';
import BlockStore from 'mote/editor/common/store/blockStore';
import RecordStore from 'mote/editor/common/store/recordStore';
import { ViewLinesChangedEvent, ViewLinesDeletedEvent, ViewLinesInsertedEvent } from 'mote/editor/common/viewEvents';
import { ViewportData } from 'mote/editor/common/viewLayout/viewLinesViewportData';
import { clearNode } from 'vs/base/browser/dom';
import { createFastDomNode, FastDomNode } from 'vs/base/browser/fastDomNode';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

export class ViewLines extends ViewPart implements IVisibleLinesHost<ViewLine> {

	private domNode: FastDomNode<HTMLElement>;

	private lines: ViewLine[] = [];
	private lineCollection: RenderedLinesCollection<ViewLine>;

	constructor(
		context: ViewContext,
		private readonly viewController: ViewController,
		private readonly linesContent: FastDomNode<HTMLElement>,
		@IInstantiationService private instantiationService: IInstantiationService,
	) {
		super(context);

		this.domNode = createFastDomNode(document.createElement('div'));
		this.domNode.setClassName('view-lines');
		this.domNode.setAttribute('data-root', '');

		this.lineCollection = new RenderedLinesCollection<ViewLine>(() => this.createVisibleLine());
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
			const blockStore = this.createStoreForPageId(pageId, this.context.contentStore);
			const viewLine = this.createVisibleLine();
			this.lines[idx] = viewLine;
			viewLine.renderLine(idx, blockStore);
			if (viewLine.getDomNode()) {
				this.domNode.domNode.appendChild(viewLine.getDomNode()!);
			}
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
		for (let i = e.fromLineNumber; i < e.fromLineNumber + e.count; i++) {
			const viewLine = this.lines[i];

		}
		return true;
	}

	//#endregion

	private createStoreForPageId = (id: string, contentStore: RecordStore) => {
		return BlockStore.createChildStore(contentStore, {
			table: 'block',
			id: id
		});
	};
}
