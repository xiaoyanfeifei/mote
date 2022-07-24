import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ViewController } from 'mote/editor/browser/view/viewController';
import { ViewPart } from 'mote/editor/browser/view/viewPart';
import { EmptyViewLine, ViewLine } from 'mote/editor/browser/viewParts/lines/viewLine';
import BlockStore from 'mote/editor/common/store/blockStore';
import RecordStore from 'mote/editor/common/store/recordStore';
import { getBlockByStore } from 'mote/workbench/contrib/blocks/browser/blocks';
import { clearNode } from 'vs/base/browser/dom';
import { createFastDomNode, FastDomNode } from 'vs/base/browser/fastDomNode';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

export class ViewLines extends ViewPart {

	private domNode: FastDomNode<HTMLElement>;

	private lines: ViewLine[] = [];

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
	}

	public getDomNode(): FastDomNode<HTMLElement> {
		return this.domNode;
	}

	public createVisibleLine(): ViewLine {
		return this.instantiationService.createInstance(ViewLine, this.context, this.viewController);
	}

	public renderText() {
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

	private createStoreForPageId = (id: string, contentStore: RecordStore) => {
		return BlockStore.createChildStore(contentStore, {
			table: 'block',
			id: id
		});
	};
}
