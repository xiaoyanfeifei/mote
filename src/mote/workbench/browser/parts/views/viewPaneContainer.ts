import { IThemeService } from "mote/platform/theme/common/themeService";
import { Component } from "mote/workbench/common/component";
import { IAddedViewDescriptorRef, IView, IViewContainerModel, IViewDescriptor, IViewDescriptorRef, IViewDescriptorService, IViewPaneContainer, ViewContainer, ViewContainerLocation } from "mote/workbench/common/views";
import { IWorkbenchLayoutService } from "mote/workbench/services/layout/browser/layoutService";
import { Dimension } from "vs/base/browser/dom";
import { Orientation } from "vs/base/browser/ui/sash/sash";
import { IPaneViewOptions, PaneView } from "vs/base/browser/ui/splitview/paneview";
import { combinedDisposable, IDisposable } from "vs/base/common/lifecycle";
import { assertIsDefined } from "vs/base/common/types";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IViewPaneOptions, ViewPane } from "./viewPane";

export interface IViewPaneContainerOptions extends IPaneViewOptions {
	mergeViewWithContainerWhenSingleView: boolean;
}

interface IViewPaneItem {
	pane: ViewPane;
	disposable: IDisposable;
}

const enum DropDirection {
	UP,
	DOWN,
	LEFT,
	RIGHT
}

type BoundingRect = { top: number; left: number; bottom: number; right: number };


export class ViewPaneContainer extends Component implements IViewPaneContainer {

	readonly viewContainer: ViewContainer;
	private lastFocusedPane: ViewPane | undefined;
	private lastMergedCollapsedPane: ViewPane | undefined;
	private paneItems: IViewPaneItem[] = [];
	private paneview?: PaneView;

	private didLayout = false;
	private dimension: Dimension | undefined;

	protected readonly viewContainerModel: IViewContainerModel;

	get panes(): ViewPane[] {
		return this.paneItems.map(i => i.pane);
	}

	get views(): IView[] {
		return this.panes;
	}

	get length(): number {
		return this.paneItems.length;
	}

	constructor(
		id: string,
		private options: IViewPaneContainerOptions,
		@IWorkbenchLayoutService protected layoutService: IWorkbenchLayoutService,
		@ILogService protected logService: ILogService,
		@IInstantiationService protected instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@IViewDescriptorService protected viewDescriptorService: IViewDescriptorService,
	) {
		super(id, themeService);

		const container = this.viewDescriptorService.getViewContainerById(id);
		if (!container) {
			throw new Error('Could not find container');
		}

		this.viewContainer = container;
		this.viewContainerModel = this.viewDescriptorService.getViewContainerModel(container);
	}

	create(parent: HTMLElement): void {
		this.logService.debug("[ViewPaneContainer]#create");

		this.paneview = this._register(new PaneView(parent, this.options));

		this._register(this.viewContainerModel.onDidAddVisibleViewDescriptors(added => this.onDidAddViewDescriptors(added)));
		this._register(this.viewContainerModel.onDidRemoveVisibleViewDescriptors(removed => this.onDidRemoveViewDescriptors(removed)));
		const addedViews: IAddedViewDescriptorRef[] = this.viewContainerModel.visibleViewDescriptors.map((viewDescriptor, index) => {
			const size = this.viewContainerModel.getSize(viewDescriptor.id);
			const collapsed = this.viewContainerModel.isCollapsed(viewDescriptor.id);
			return ({ viewDescriptor, index, size, collapsed });
		});
		if (addedViews.length) {
			this.onDidAddViewDescriptors(addedViews);
		}
	}

	private get orientation(): Orientation {
		switch (this.viewDescriptorService.getViewContainerLocation(this.viewContainer)) {
			case ViewContainerLocation.Sidebar:
			case ViewContainerLocation.AuxiliaryBar:
				return Orientation.VERTICAL;
			case ViewContainerLocation.Panel:
			//return this.layoutService.getPanelPosition() === Position.BOTTOM ? Orientation.HORIZONTAL : Orientation.VERTICAL;
		}

		return Orientation.VERTICAL;
	}

	layout(dimension: Dimension): void {
		if (this.paneview) {
			if (this.paneview.orientation !== this.orientation) {
				this.paneview.flipOrientation(dimension.height, dimension.width);
			}

			this.paneview.layout(dimension.height, dimension.width);
		}

		this.dimension = dimension;
		if (this.didLayout) {
			this.saveViewSizes();
		} else {
			this.didLayout = true;
			this.restoreViewSizes();
		}
	}

	private saveViewSizes() {

	}

	private restoreViewSizes() {

	}

	protected createView(viewDescriptor: IViewDescriptor, options: IViewPaneOptions): ViewPane {
		return (this.instantiationService as any).createInstance(viewDescriptor.ctorDescriptor.ctor, ...(viewDescriptor.ctorDescriptor.staticArguments || []), options) as ViewPane;
	}

	protected onDidAddViewDescriptors(added: IAddedViewDescriptorRef[]): ViewPane[] {
		const panesToAdd: { pane: ViewPane; size: number; index: number }[] = [];

		for (const { viewDescriptor, collapsed, index, size } of added) {
			const pane = this.createView(viewDescriptor,
				{
					id: viewDescriptor.id,
					title: viewDescriptor.name,
					//fromExtensionId: (viewDescriptor as Partial<ICustomViewDescriptor>).extensionId,
					expanded: !collapsed
				});

			pane.render();

			panesToAdd.push({ pane, size: size || pane.minimumSize, index });
		}

		this.addPanes(panesToAdd);
		//this.restoreViewSizes();

		const panes: ViewPane[] = [];
		for (const { pane } of panesToAdd) {
			//pane.setVisible(this.isVisible());
			panes.push(pane);
		}
		return panes;
	}

	private onDidRemoveViewDescriptors(removed: IViewDescriptorRef[]): void {
		removed = removed.sort((a, b) => b.index - a.index);
		const panesToRemove: ViewPane[] = [];
		for (const { index } of removed) {
			//const [disposable] = this.viewDisposables.splice(index, 1);
			//disposable.dispose();
			panesToRemove.push(this.panes[index]);
		}
		//this.removePanes(panesToRemove);

		for (const pane of panesToRemove) {
			//pane.setVisible(false);
		}
	}

	addPanes(panes: { pane: ViewPane; size: number; index?: number }[]): void {
		for (const { pane: pane, size, index } of panes) {
			this.addPane(pane, size, index);
		}
	}

	private addPane(pane: ViewPane, size: number, index = this.paneItems.length - 1) {

		const disposable = combinedDisposable(pane,);
		const paneItem: IViewPaneItem = { pane, disposable };

		this.paneItems.splice(index, 0, paneItem);
		assertIsDefined(this.paneview).addPane(pane, size, index);
	}


	getView(viewId: string): IView | undefined {
		throw new Error("Method not implemented.");
	}



}
