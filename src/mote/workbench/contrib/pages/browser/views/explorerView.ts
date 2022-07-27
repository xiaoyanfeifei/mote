/* eslint-disable code-no-unexternalized-strings */
import { ListItem } from "mote/base/browser/ui/list/list";
import { IAsyncDataSource } from "mote/base/browser/ui/tree/tree";
import SVGIcon from 'mote/base/browser/ui/svgicon/svgicon';
import { ThemedStyles } from "mote/base/browser/ui/themes";
import { EditOperation } from "mote/editor/common/core/editOperation";
import { Transaction } from "mote/editor/common/core/transaction";
import BlockStore from "mote/editor/common/store/blockStore";
import SpaceStore from "mote/editor/common/store/spaceStore";
import { ICommandService } from "mote/platform/commands/common/commands";
import { IViewPaneOptions, ViewPane } from "mote/workbench/browser/parts/views/viewPane";
import { ITreeItem, TreeItemCollapsibleState } from "mote/workbench/common/treeView";
import { $, reset } from "vs/base/browser/dom";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { NameFromStore } from './outliner';
import { CachedListVirtualDelegate, IListContextMenuEvent, IListRenderer, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { List } from 'vs/base/browser/ui/list/listWidget';
import { ITreeContextMenuEvent } from 'vs/base/browser/ui/tree/tree';
import { IContextMenuService } from 'mote/platform/contextview/browser/contextView';
import { IAction } from 'vs/base/common/actions';

class BlockListVirtualDelegate extends CachedListVirtualDelegate<BlockStore> implements IListVirtualDelegate<BlockStore> {

	protected estimateHeight(element: BlockStore): number {
		return 31;
	}

	hasDynamicHeight(element: BlockStore) {
		return true;
	}

	getTemplateId(element: BlockStore): string {
		return 'sidebar-outliner';
	}

};

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
		const icon = SVGIcon({ name: "page", style: { fill: ThemedStyles.mediumIconColor.dark } });
		const child = new NameFromStore(titleStore);
		const item = new ListItem(container, { enableClick: true });
		item.child = child.element;
		item.icon = icon as any;
		item.create();

		reset(templateData);

		templateData.appendChild(container);

		item.onDidClick((e) => {
			this.commandService.executeCommand("openPage", { id: element.id, userId: element.userId });
		});

	}
	disposeTemplate(templateData: any): void {

	}


}

export class ExplorerView extends ViewPane {

	static readonly ID: string = 'workbench.explorer.pageView';

	private view!: List<BlockStore>;
	private spaceStore!: SpaceStore;

	constructor(
		options: IViewPaneOptions,
		@ILogService logService: ILogService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@ICommandService private readonly commandService: ICommandService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super(options, logService, contextMenuService);
	}

	override renderBody(container: HTMLElement) {
		super.renderBody(container);
		const that = this;

		const userId = 'guest';

		const spaceStore = new SpaceStore({
			table: 'space',
			id: '1',
		}, { userId: userId });
		this.spaceStore = spaceStore;

		const dataSource = new class implements IAsyncDataSource<ITreeItem, ITreeItem> {
			hasChildren(element: ITreeItem): boolean {
				return true;
			}
			getChildren(element: ITreeItem): Promise<Iterable<ITreeItem>> {

				const items = spaceStore.getPagesStores().map(store => {
					const item: ITreeItem = {
						id: store.id,
						handle: "",
						collapsibleState: TreeItemCollapsibleState.Collapsed
					};
					return item;
				});
				return Promise.resolve(items);
			}

		};

		const treeView = new List(userId, container, new BlockListVirtualDelegate(), [new BlockListRenderer(this.commandService)], { horizontalScrolling: true });
		treeView.splice(0, treeView.length, spaceStore.getPagesStores());
		this.view = treeView;

		this._register(this.view.onContextMenu((e) => this.onContextMenu(e)));

		//const addNewPage = new Button(container, {});
		const domNode = $(".list-item");
		const icon = SVGIcon({ name: "plus", style: { fill: ThemedStyles.mediumIconColor.dark } });
		const child = document.createTextNode("Add new page");
		const addPageBtn = new ListItem(domNode, { enableClick: true });
		addPageBtn.child = child as any;
		addPageBtn.icon = icon as any;
		addPageBtn.create();
		addPageBtn.onDidClick((e) => {
			Transaction.createAndCommit((transaction) => {
				let child = EditOperation.createBlockStore("page", transaction);

				child = EditOperation.appendToParent(
					spaceStore.getPagesStore(), child, transaction).child as BlockStore;
				that.commandService.executeCommand("openPage", { id: child.id });
				transaction.postSubmitCallbacks.push(() => this.refresh());
			}, spaceStore.userId);
		});
		container.append(domNode);
	}

	private refresh() {
		this.view.splice(0, this.view.length, this.spaceStore.getPagesStores());
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
		this.view.layout(height - 27, width);
	}
}
