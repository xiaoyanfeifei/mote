import { IViewContainersRegistry, IViewDescriptor, IViewDescriptorService, IViewsRegistry, ViewContainer, ViewContainerLocation, Extensions as ViewExtensions } from "mote/workbench/common/views";
import { Emitter, Event } from "vs/base/common/event";
import { Disposable, DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { registerSingleton } from "vs/platform/instantiation/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { Registry } from "vs/platform/registry/common/platform";
import { ViewContainerModel } from "../common/viewContainerModel";

interface ICachedViewContainerInfo {
	containerId: string;
}

export class ViewDescriptorService extends Disposable implements IViewDescriptorService {
    declare readonly _serviceBrand: undefined;

    private readonly _onDidChangeContainer: Emitter<{ views: IViewDescriptor[]; from: ViewContainer; to: ViewContainer }> = this._register(new Emitter<{ views: IViewDescriptor[]; from: ViewContainer; to: ViewContainer }>());
	readonly onDidChangeContainer: Event<{ views: IViewDescriptor[]; from: ViewContainer; to: ViewContainer }> = this._onDidChangeContainer.event;

	private readonly _onDidChangeLocation: Emitter<{ views: IViewDescriptor[]; from: ViewContainerLocation; to: ViewContainerLocation }> = this._register(new Emitter<{ views: IViewDescriptor[]; from: ViewContainerLocation; to: ViewContainerLocation }>());
	readonly onDidChangeLocation: Event<{ views: IViewDescriptor[]; from: ViewContainerLocation; to: ViewContainerLocation }> = this._onDidChangeLocation.event;

	private readonly _onDidChangeContainerLocation: Emitter<{ viewContainer: ViewContainer; from: ViewContainerLocation; to: ViewContainerLocation }> = this._register(new Emitter<{ viewContainer: ViewContainer; from: ViewContainerLocation; to: ViewContainerLocation }>());
	readonly onDidChangeContainerLocation: Event<{ viewContainer: ViewContainer; from: ViewContainerLocation; to: ViewContainerLocation }> = this._onDidChangeContainerLocation.event;

	private readonly viewContainerModels: Map<ViewContainer, { viewContainerModel: ViewContainerModel; disposable: IDisposable }>;

    private readonly viewsRegistry: IViewsRegistry;
	private readonly viewContainersRegistry: IViewContainersRegistry;

    private cachedViewInfo: Map<string, ICachedViewContainerInfo>;
	private cachedViewContainerInfo: Map<string, ViewContainerLocation>;

    private readonly _onDidChangeViewContainers = this._register(new Emitter<{ added: ReadonlyArray<{ container: ViewContainer; location: ViewContainerLocation }>; removed: ReadonlyArray<{ container: ViewContainer; location: ViewContainerLocation }> }>());
	readonly onDidChangeViewContainers = this._onDidChangeViewContainers.event;
	get viewContainers(): ReadonlyArray<ViewContainer> { return this.viewContainersRegistry.all; }

    constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
        super();

		this.viewContainerModels = new Map<ViewContainer, { viewContainerModel: ViewContainerModel; disposable: IDisposable }>();

		this.cachedViewContainerInfo = new Map();
		this.cachedViewInfo = new Map();

        this.viewContainersRegistry = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry);
		this.viewsRegistry = Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry);
    }

    getDefaultViewContainer(location: ViewContainerLocation): ViewContainer | undefined {
		return this.viewContainersRegistry.getDefaultViewContainer(location);
	}

	getViewContainerById(id: string): ViewContainer | null {
		return this.viewContainersRegistry.get(id) || null;
	}
    
    getViewContainerLocation(viewContainer: ViewContainer): ViewContainerLocation {
		//const location = this.cachedViewContainerInfo.get(viewContainer.id);
		//return location !== undefined ? location : this.getDefaultViewContainerLocation(viewContainer);
        return this.getDefaultViewContainerLocation(viewContainer);
	}

    getDefaultViewContainerLocation(viewContainer: ViewContainer): ViewContainerLocation {
		return this.viewContainersRegistry.getViewContainerLocation(viewContainer);
	}

	getViewContainerModel(container: ViewContainer): ViewContainerModel {
		return this.getOrRegisterViewContainerModel(container);
	}

	getViewDescriptorById(viewId: string): IViewDescriptor | null {
		return this.viewsRegistry.getView(viewId);
	}

	getDefaultContainerById(viewId: string): ViewContainer | null {
		return this.viewsRegistry.getViewContainer(viewId) ?? null;
	}

	private getViewsByContainer(viewContainer: ViewContainer): IViewDescriptor[] {
		const result = this.viewsRegistry.getViews(viewContainer).filter(viewDescriptor => {
			const cachedContainer = this.cachedViewInfo.get(viewDescriptor.id)?.containerId || viewContainer.id;
			return cachedContainer === viewContainer.id;
		});

		for (const [viewId, containerInfo] of this.cachedViewInfo.entries()) {
			if (!containerInfo || containerInfo.containerId !== viewContainer.id) {
				continue;
			}

			if (this.viewsRegistry.getViewContainer(viewId) === viewContainer) {
				continue;
			}

			const viewDescriptor = this.getViewDescriptorById(viewId);
			if (viewDescriptor) {
				result.push(viewDescriptor);
			}
		}

		return result;
	}

	private getOrRegisterViewContainerModel(viewContainer: ViewContainer): ViewContainerModel {
		let viewContainerModel = this.viewContainerModels.get(viewContainer)?.viewContainerModel;

		if (!viewContainerModel) {
			const disposables = new DisposableStore();
			viewContainerModel = disposables.add(this.instantiationService.createInstance(ViewContainerModel, viewContainer));

			//this.onDidChangeActiveViews({ added: viewContainerModel.activeViewDescriptors, removed: [] });
			//viewContainerModel.onDidChangeActiveViewDescriptors(changed => this.onDidChangeActiveViews(changed), this, disposables);

			this.viewContainerModels.set(viewContainer, { viewContainerModel: viewContainerModel, disposable: disposables });
			
			// Add views that were registered prior to this view container
			const viewsToRegister = this.getViewsByContainer(viewContainer)
				.filter(view => {
					const container = this.getDefaultContainerById(view.id);
					return container == viewContainer
				});
			if (viewsToRegister.length) {
				this.addViews(viewContainer, viewsToRegister);
			}
		}

		return viewContainerModel;
	}

	private addViews(container: ViewContainer, views: IViewDescriptor[]): void {
		this.getViewContainerModel(container).add(views.map(view => {
			return {
				viewDescriptor: view,
				//collapsed: visibilityState === ViewVisibilityState.Default ? undefined : false,
				//visible: visibilityState === ViewVisibilityState.Default ? undefined : true
			};
		}));
	}
}

registerSingleton(IViewDescriptorService, ViewDescriptorService);