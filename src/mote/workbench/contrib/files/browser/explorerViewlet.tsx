import { ListItem } from "mote/base/browser/ui/list/list";
import { IAsyncDataSource } from "mote/base/browser/ui/tree/tree";
import { createElement } from "mote/base/jsx/createElement";
import SVGIcon from "mote/base/ui/svgicon/svgicon";
import { ThemedStyles } from "mote/base/ui/themes";
import { IThemeService } from "mote/platform/theme/common/themeService";
import { TreeRender, TreeView } from "mote/workbench/browser/parts/views/treeView";
import { ViewPaneContainer } from "mote/workbench/browser/parts/views/viewPaneContainer";
import { ITreeItem, TreeItemCollapsibleState } from "mote/workbench/common/treeView";
import { Extensions, IViewContainersRegistry, IViewsRegistry, ViewContainer, ViewContainerLocation } from "mote/workbench/common/views";
import { IWorkbenchLayoutService } from "mote/workbench/services/layout/browser/layoutService";
import SpaceStore from "mote/editor/common/store/spaceStore";
import { append , $} from "vs/base/browser/dom";
import { localize } from "vs/nls";
import { SyncDescriptor } from "vs/platform/instantiation/common/descriptors";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { Registry } from "vs/platform/registry/common/platform";
import { FILES_VIEWLET_ID } from "../common/files";
import { NameFromStore, } from "./views/outliner";
import { ICommandService } from "mote/platform/commands/common/commands";
import BlockStore from "mote/editor/common/store/blockStore";
import { Transaction } from "mote/editor/common/core/transaction";
import { EditOperation } from "mote/editor/common/core/editOperation";

const viewsRegistry = Registry.as<IViewsRegistry>(Extensions.ViewsRegistry);
const viewContainerRegistry = Registry.as<IViewContainersRegistry>(Extensions.ViewContainersRegistry);

export class ExplorerViewPaneContainer extends ViewPaneContainer {
    constructor(
        @IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
        @ILogService logService: ILogService,
        @IInstantiationService instantiationService: IInstantiationService,
        @IThemeService themeService: IThemeService,
        @ICommandService private readonly commandService: ICommandService,
    ) {
        super(FILES_VIEWLET_ID, layoutService, logService, instantiationService, themeService);
    }

    override create(parent: HTMLElement): void {
		super.create(parent);
		parent.classList.add('explorer-viewlet');
        parent.style.backgroundColor = ThemedStyles.sidebarBackground.dark;
        const body = append(parent, $('.pane-body'));
        this.renderBody(body);
	}

    renderBody(container: HTMLElement) {
        const that = this;
        container.style.paddingTop = "14px";
        const spaceStore = new SpaceStore({
            table: "space",
            id: "1",
        }, {userId: "123"});

        const renderer = new class implements TreeRender<ITreeItem> {
            render(element: HTMLElement, value: ITreeItem) {
                const pageStore = new BlockStore(
                    {table: "page", id: value.id},
                    "123",
                )
                const titleStore = pageStore.getPropertyStore("title");
                const icon = <SVGIcon name="page" style={{fill: ThemedStyles.mediumIconColor.dark}}/>
                const child = new NameFromStore(titleStore);
                const item = new ListItem(element, {enableClick: true});
                item.child = child.element;
                item.icon = icon;
                item.create();

                item.onDidClick((e)=>{
                    that.commandService.executeCommand("openPage", {id: value.id});
                });
            }
            
        }

        const dataSource = new class implements IAsyncDataSource<ITreeItem, ITreeItem> {
            hasChildren(element: ITreeItem): boolean {
                return true;
            }
            getChildren(element: ITreeItem): Promise<Iterable<ITreeItem>> {
                
                const items = spaceStore.getPagesStores().map(store=>{
                    const item: ITreeItem = {
                        id: store.id,
                        handle: "",
                        collapsibleState: TreeItemCollapsibleState.Collapsed
                    };
                    return item;
                });
                return Promise.resolve(items);
            }
            
        }
        const treeView = this.instantiationService.createInstance(TreeView, dataSource, renderer);
        treeView.show(container);

        //const addNewPage = new Button(container, {});
        const domNode = $(".list-item");
        const icon = <SVGIcon name="plus" style={{fill: ThemedStyles.mediumIconColor.dark}}/>
        const child = document.createTextNode("Add new page");
        const addPageBtn = new ListItem(domNode, {enableClick: true});
        addPageBtn.child = child as any;
        addPageBtn.icon = icon;
        addPageBtn.create();
        addPageBtn.onDidClick((e)=>{
            Transaction.createAndCommit((transaction)=>{
                let child = EditOperation.createBlockStore("page", transaction);
                   
                child = EditOperation.appendToParent(
                    spaceStore.getPagesStore(), child, transaction).child as BlockStore;
                that.commandService.executeCommand("openPage", {id: child.id});
                treeView.refresh();
            }, spaceStore.userId)
        });
        container.append(domNode);
    }

}

export class ExplorerViewlet {

}

export class ExplorerViewletViewsContribution {

}

/**
 * Explorer viewlet container.
 */
export const EXPLORER_VIEW_CONTAINER: ViewContainer = viewContainerRegistry.registerViewContainer({
    id: FILES_VIEWLET_ID,
    title: localize('explore', "Explorer"),
    ctorDescriptor: new SyncDescriptor(ExplorerViewPaneContainer),
}, ViewContainerLocation.Sidebar, {isDefault: true});