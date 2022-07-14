/* eslint-disable code-no-unexternalized-strings */
import { ListItem } from "mote/base/browser/ui/list/list";
import { IAsyncDataSource } from "mote/base/browser/ui/tree/tree";
import { createElement } from "mote/base/jsx/createElement";
import SVGIcon from "mote/base/ui/svgicon/svgicon";
import { ThemedStyles } from "mote/base/ui/themes";
import { EditOperation } from "mote/editor/common/core/editOperation";
import { Transaction } from "mote/editor/common/core/transaction";
import BlockStore from "mote/editor/common/store/blockStore";
import SpaceStore from "mote/editor/common/store/spaceStore";
import { ICommandService } from "mote/platform/commands/common/commands";
import { TreeRender, TreeView } from "mote/workbench/browser/parts/views/treeView";
import { IViewPaneOptions, ViewPane } from "mote/workbench/browser/parts/views/viewPane";
import { ITreeItem, TreeItemCollapsibleState } from "mote/workbench/common/treeView";
import { append, $ } from "vs/base/browser/dom";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { NameFromStore } from "./outliner";

export class ExplorerView extends ViewPane {

	static readonly ID: string = 'workbench.explorer.pageView';

	constructor(
		options: IViewPaneOptions,
		@ILogService logService: ILogService,
		@ICommandService private readonly commandService: ICommandService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super(options, logService);
	}

	override renderBody(container: HTMLElement) {
		super.renderBody(container);
		const that = this;

		const spaceStore = new SpaceStore({
			table: "space",
			id: "1",
		}, { userId: "123" });

		const renderer = new class implements TreeRender<ITreeItem> {
			render(element: HTMLElement, value: ITreeItem) {
				const pageStore = new BlockStore(
					{ table: "page", id: value.id },
					"123",
				);
				const titleStore = pageStore.getPropertyStore("title");
				const icon = SVGIcon({ name: "page", style: { fill: ThemedStyles.mediumIconColor.dark } });
				const child = new NameFromStore(titleStore);
				const item = new ListItem(element, { enableClick: true });
				item.child = child.element;
				item.icon = icon as any;
				item.create();

				item.onDidClick((e) => {
					that.commandService.executeCommand("openPage", { id: value.id });
				});
			}

		};

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
		const treeView = this.instantiationService.createInstance(TreeView, dataSource, renderer);
		treeView.show(container);

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
				treeView.refresh();
			}, spaceStore.userId);
		});
		container.append(domNode);
	}
}
