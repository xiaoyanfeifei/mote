import { Disposable, DisposableStore } from "vs/base/common/lifecycle";
import { Emitter, Event } from 'vs/base/common/event';
import { $ } from 'vs/base/browser/dom';
import * as DOM from 'vs/base/browser/dom';
import { IHoverService } from "mote/workbench/services/hover/browser/hover";
import { IViewDescriptorService } from "mote/workbench/common/views";
import { ITreeItem, TreeItemCollapsibleState } from "mote/workbench/common/treeView";
import { AsyncDataTree } from "mote/base/browser/ui/tree/asyncDataTree";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IAsyncDataSource } from "mote/base/browser/ui/tree/tree";
import { IListMouseEvent } from "vs/base/browser/ui/list/list";
import { DomEmitter } from "vs/base/browser/event";
import { ICommandService } from "mote/platform/commands/common/commands";

class Root implements ITreeItem {
    id = "root"
    label = { label: 'root' };
    handle = '0';
    parentHandle?: string | undefined = undefined;
    collapsibleState = TreeItemCollapsibleState.Expanded;
    children?: ITreeItem[] | undefined = undefined;
    
}

class Tree extends AsyncDataTree<ITreeItem, ITreeItem> {}

export interface TreeRender<T> {
    render(container: HTMLElement, element: T);
}

export class TreeView extends Disposable {

    private focused: boolean = false;
	private domNode!: HTMLElement;
    private treeContainer!: HTMLElement;
    private _container: HTMLElement | undefined;

    private tree: Tree | undefined;

    private root: ITreeItem;

    private readonly disposables: DisposableStore = new DisposableStore();

    constructor(
        private dataSource: IAsyncDataSource<ITreeItem, ITreeItem>,
        private renderer: TreeRender<ITreeItem>,
        @IHoverService private readonly hoverService: IHoverService,
        //@IViewDescriptorService private readonly viewDescriptorService: IViewDescriptorService,
        @IInstantiationService private readonly instantiationService: IInstantiationService,
        @ICommandService private readonly commandService: ICommandService,
    ){
        super();

        this.root = new Root();
        this.create();
        
    }

    show(container: HTMLElement): void {
		this._container = container;
		DOM.append(container, this.domNode);
	}

    private create() {
        this.domNode = DOM.$('.tree-explorer-viewlet-tree-view');
        this.treeContainer = DOM.append(this.domNode, DOM.$('.customview-tree'));
        const focusTracker = this._register(DOM.trackFocus(this.domNode));
		this._register(focusTracker.onDidFocus(() => this.focused = true));
		this._register(focusTracker.onDidBlur(() => this.focused = false));
        this.createTree();
    }

    private async createTree() {
        if (this.dataSource.hasChildren(this.root)) {
            const children = await this.dataSource.getChildren(this.root);
            
            for (const child of children) {
                const domNode = $(".list-item");
                this.renderer.render(domNode, child);
                this.treeContainer.append(domNode);
            
            }
        }
        
    }

    async expand(item: ITreeItem): Promise<void> {
        
    }
}