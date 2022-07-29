import { ListItem } from 'mote/base/browser/ui/list/list';
import SVGIcon from 'mote/base/browser/ui/svgicon/svgicon';
import { ThemedStyles } from 'mote/base/common/themes';
import { EditOperation } from 'mote/editor/common/core/editOperation';
import { Transaction } from 'mote/editor/common/core/transaction';
import BlockStore from 'mote/editor/common/store/blockStore';
import SpaceStore from 'mote/editor/common/store/spaceStore';
import { ICommandService } from 'mote/platform/commands/common/commands';
import { IViewPaneOptions, ViewPane } from 'mote/workbench/browser/parts/views/viewPane';
import { $, reset } from 'vs/base/browser/dom';
import { ILogService } from 'vs/platform/log/common/log';
import { NameFromStore } from './outliner';
import { CachedListVirtualDelegate, IListContextMenuEvent, IListRenderer, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { List } from 'vs/base/browser/ui/list/listWidget';
import { IContextMenuService } from 'mote/platform/contextview/browser/contextView';
import { IAction } from 'vs/base/common/actions';
import { IWorkspaceContextService } from 'mote/platform/workspace/common/workspace';

const OUTLINER_HEIGHT = 31;

class BlockListVirtualDelegate extends CachedListVirtualDelegate<BlockStore> implements IListVirtualDelegate<BlockStore> {

	protected estimateHeight(element: BlockStore): number {
		return OUTLINER_HEIGHT;
	}

	hasDynamicHeight(element: BlockStore) {
		return false;
	}

	getTemplateId(element: BlockStore): string {
		return 'sidebar-outliner';
	}

}

class BlockListRenderer implements IListRenderer<BlockStore, any> {
	templateId: string = 'sidebar-outliner';

	constructor(
		private readonly commandService: ICommandService
	) {

	}

	renderTemplate(container: HTMLElement) {
		return container;
	}

	renderElement(element: BlockStore, index: number, templateData: HTMLElement, height: number | undefined): void {
		const container = document.createElement('div');
		const titleStore = element.getTitleStore();
		const icon = SVGIcon({ name: 'page', style: { fill: ThemedStyles.mediumIconColor.dark } });
		const child = new NameFromStore(titleStore);
		const item = new ListItem(container, { enableClick: true });
		item.child = child.element;
		item.icon = icon as any;
		item.create();

		reset(templateData);

		templateData.appendChild(container);

		item.onDidClick((e) => {
			this.commandService.executeCommand('openPage', { id: element.id, userId: element.userId });
		});

	}
	disposeTemplate(templateData: any): void {

	}


}

export class ExplorerView extends ViewPane {

	static readonly ID: string = 'workbench.explorer.pageView';

	private view!: List<BlockStore>;
	private spaceStore!: SpaceStore;

	private viewContainer!: HTMLDivElement;

	private height!: number;
	private width!: number;

	constructor(
		options: IViewPaneOptions,
		@ILogService logService: ILogService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@ICommandService private readonly commandService: ICommandService,
		@IWorkspaceContextService private readonly contextService: IWorkspaceContextService,
	) {
		super(options, logService, contextMenuService);
	}

	override renderBody(container: HTMLElement) {
		super.renderBody(container);
		const that = this;

		const spaceStore = this.contextService.getSpaceStore();
		this.spaceStore = spaceStore;

		this.viewContainer = document.createElement('div');

		const treeView = new List(spaceStore.userId, this.viewContainer, new BlockListVirtualDelegate(), [new BlockListRenderer(this.commandService)], { horizontalScrolling: true });
		treeView.splice(0, treeView.length, spaceStore.getPagesStores());
		this.view = treeView;

		this._register(this.view.onContextMenu((e) => this.onContextMenu(e)));

		const domNode = $('.list-item');
		domNode.style.display = 'flex';
		const icon = SVGIcon({ name: 'plus', style: { fill: ThemedStyles.mediumIconColor.dark } });
		const child = document.createTextNode('Add new page');
		const addPageBtn = new ListItem(domNode, { enableClick: true });
		addPageBtn.child = child as any;
		addPageBtn.icon = icon as any;
		addPageBtn.create();
		addPageBtn.onDidClick((e) => {
			Transaction.createAndCommit((transaction) => {
				let child = EditOperation.createBlockStore('page', transaction, 'page');

				child = EditOperation.appendToParent(
					spaceStore.getPagesStore(), child, transaction).child as BlockStore;
				that.commandService.executeCommand('openPage', { id: child.id });
				transaction.postSubmitCallbacks.push(() => this.refresh());
			}, spaceStore.userId);
		});
		container.append(this.viewContainer);
		container.append(domNode);
	}

	private refresh() {
		this.view.splice(0, this.view.length, this.spaceStore.getPagesStores());
		this.layoutOutliner();
	}

	private async onContextMenu(e: IListContextMenuEvent<BlockStore>) {
		const anchor = e.anchor;
		const pageStore = e.element;
		if (!pageStore) {
			return;
		}
		const parentStore = pageStore.recordStoreParentStore;
		if (!parentStore) {
			return;
		}

		const actions: IAction[] = [];

		actions.push({
			id: 'page.pin',
			label: 'Pin',
			tooltip: '',
			run: () => { },
			class: '',
			enabled: true,
			dispose: () => { }
		});

		actions.push({
			id: 'page.delete',
			label: 'Delete',
			tooltip: '',
			run: () => {
				Transaction.createAndCommit((transaction) => {
					EditOperation.removeChild(parentStore, pageStore, transaction);
					transaction.postSubmitCallbacks.push(() => this.refresh());
				}, pageStore.userId);

			},
			class: '',
			enabled: true,
			dispose: () => { }
		});



		this.contextMenuService.showContextMenu({
			getAnchor: () => anchor,
			getActions: () => actions,
		});
	}

	override layoutBody(height: number, width: number) {
		super.layoutBody(height, width);
		this.width = width;
		this.height = height;
		this.layoutOutliner();
	}

	private layoutOutliner() {
		const height = Math.min(this.view.length * OUTLINER_HEIGHT, this.height - 150);
		this.viewContainer.style.height = `${height}px`;
		this.view.layout(height + 20, this.width);
	}
}
