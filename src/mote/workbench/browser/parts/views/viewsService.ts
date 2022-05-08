import { IPaneComposite } from "mote/workbench/common/panecomposite";
import { IView, IViewsService, ViewContainer, ViewContainerLocation } from "mote/workbench/common/views";
import { IWorkbenchLayoutService, Parts } from "mote/workbench/services/layout/browser/layoutService";
import { IPaneCompositePartService } from "mote/workbench/services/panecomposite/browser/panecomposite";
import { Disposable, DisposableStore, toDisposable } from "vs/base/common/lifecycle";
import { isString } from "vs/base/common/types";
import { registerSingleton } from "vs/platform/instantiation/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { Registry } from "vs/platform/registry/common/platform";
import { PaneComposite, PaneCompositeDescriptor, PaneCompositeExtensions, PaneCompositeRegistry } from "../../panecomposite";
import { ViewPaneContainer } from "./viewPaneContainer";

export class ViewsService extends Disposable implements IViewsService {
    

	declare readonly _serviceBrand: undefined;

	//private readonly viewDisposable: Map<IViewDescriptor, IDisposable>;
	private readonly viewPaneContainers: Map<string, ViewPaneContainer>;

    constructor(
		//@IViewDescriptorService private readonly viewDescriptorService: IViewDescriptorService,
		@IPaneCompositePartService private readonly paneCompositeService: IPaneCompositePartService,
		//@IContextKeyService private readonly contextKeyService: IContextKeyService,
		@IWorkbenchLayoutService private readonly layoutService: IWorkbenchLayoutService
	) {
		super();

        this.viewPaneContainers = new Map<string, ViewPaneContainer>();
    }

    private async openComposite(compositeId: string, location: ViewContainerLocation, focus?: boolean): Promise<IPaneComposite | undefined> {
		return this.paneCompositeService.openPaneComposite(compositeId, location, focus);
	}

	private getComposite(compositeId: string, location: ViewContainerLocation): { id: string; name: string } | undefined {
		return this.paneCompositeService.getPaneComposite(compositeId, location);
	}

    isViewContainerVisible(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    openViewContainer(id: string, focus?: boolean): Promise<IPaneComposite | null> {
        throw new Error("Method not implemented.");
    }
    closeViewContainer(id: string): void {
        throw new Error("Method not implemented.");
    }
    isViewVisible(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    openView<T extends IView>(id: string, focus?: boolean): Promise<T | null> {
        throw new Error("Method not implemented.");
    }
    closeView(id: string): void {
        throw new Error("Method not implemented.");
    }

    public registerPaneComposite(viewContainer: ViewContainer, viewContainerLocation: ViewContainerLocation): void {
		const that = this;
		class PaneContainer extends PaneComposite {
			constructor(
				@ILogService logService: ILogService,
				//@ITelemetryService telemetryService: ITelemetryService,
				//@IWorkspaceContextService contextService: IWorkspaceContextService,
				//@IStorageService storageService: IStorageService,
				@IInstantiationService instantiationService: IInstantiationService,
				//@IThemeService themeService: IThemeService,
				//@IContextMenuService contextMenuService: IContextMenuService,
				//@IExtensionService extensionService: IExtensionService,
			) {
				super(viewContainer.id, logService, instantiationService);
			}

			protected createViewPaneContainer(element: HTMLElement): ViewPaneContainer {
				const viewPaneContainerDisposables = this._register(new DisposableStore());

				// Use composite's instantiation service to get the editor progress service for any editors instantiated within the composite
				const viewPaneContainer = that.createViewPaneContainer(element, viewContainer, viewContainerLocation, viewPaneContainerDisposables, this.instantiationService);


				return viewPaneContainer;
			}
		}

		Registry.as<PaneCompositeRegistry>(getPaneCompositeExtension(viewContainerLocation)).registerPaneComposite(PaneCompositeDescriptor.create(
			PaneContainer,
			viewContainer.id,
			viewContainer.title,
			undefined,
			viewContainer.order,
			viewContainer.requestedIndex,
			undefined
		));
	}

	private deregisterPaneComposite(viewContainer: ViewContainer, viewContainerLocation: ViewContainerLocation): void {
		Registry.as<PaneCompositeRegistry>(getPaneCompositeExtension(viewContainerLocation)).deregisterPaneComposite(viewContainer.id);
	}

    private createViewPaneContainer(element: HTMLElement, viewContainer: ViewContainer, viewContainerLocation: ViewContainerLocation, disposables: DisposableStore, instantiationService: IInstantiationService): ViewPaneContainer {
		const viewPaneContainer: ViewPaneContainer = (instantiationService as any).createInstance(viewContainer.ctorDescriptor!.ctor, ...(viewContainer.ctorDescriptor!.staticArguments || []));

		this.viewPaneContainers.set(viewPaneContainer.getId(), viewPaneContainer);
		disposables.add(toDisposable(() => this.viewPaneContainers.delete(viewPaneContainer.getId())));
        /*
		disposables.add(viewPaneContainer.onDidAddViews(views => this.onViewsAdded(views)));
		disposables.add(viewPaneContainer.onDidChangeViewVisibility(view => this.onViewsVisibilityChanged(view, view.isBodyVisible())));
		disposables.add(viewPaneContainer.onDidRemoveViews(views => this.onViewsRemoved(views)));
		disposables.add(viewPaneContainer.onDidFocusView(view => this.focusedViewContextKey.set(view.id)));
		disposables.add(viewPaneContainer.onDidBlurView(view => {
			if (this.focusedViewContextKey.get() === view.id) {
				this.focusedViewContextKey.reset();
			}
		}));
        */
		return viewPaneContainer;
	}
}

function getPaneCompositeExtension(viewContainerLocation: ViewContainerLocation): string {
	switch (viewContainerLocation) {
		case ViewContainerLocation.AuxiliaryBar:
			return PaneCompositeExtensions.Auxiliary;
		case ViewContainerLocation.Panel:
			return PaneCompositeExtensions.Panels;
		case ViewContainerLocation.Sidebar:
		default:
			return PaneCompositeExtensions.Viewlets;
	}
}

export function getPartByLocation(viewContainerLocation: ViewContainerLocation): Parts.AUXILIARYBAR_PART | Parts.SIDEBAR_PART | Parts.PANEL_PART {
	switch (viewContainerLocation) {
		case ViewContainerLocation.AuxiliaryBar:
			return Parts.AUXILIARYBAR_PART;
		case ViewContainerLocation.Panel:
			return Parts.PANEL_PART;
		case ViewContainerLocation.Sidebar:
		default:
			return Parts.SIDEBAR_PART;
	}
}

registerSingleton(IViewsService, ViewsService);