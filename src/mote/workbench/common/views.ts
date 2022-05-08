import { flatten } from "vs/base/common/arrays";
import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { getOrSet } from "vs/base/common/map";
import { SyncDescriptor } from "vs/platform/instantiation/common/descriptors";
import { createDecorator } from "vs/platform/instantiation/common/instantiation";
import { Registry } from "vs/platform/registry/common/platform";
import { IPaneComposite } from "./panecomposite";

export namespace Extensions {
	export const ViewContainersRegistry = 'workbench.registry.view.containers';
	export const ViewsRegistry = 'workbench.registry.view';
}

export const enum ViewContainerLocation {
	Sidebar,
	Panel,
	AuxiliaryBar
}

type OpenCommandActionDescriptor = {
	readonly id: string;
	readonly title?: string;
	readonly mnemonicTitle?: string;
	readonly order?: number;
	//readonly keybindings?: IKeybindings & { when?: ContextKeyExpression };
};

interface ViewOrderDelegate {
	getOrder(group?: string): number | undefined;
}

export interface IViewContainerDescriptor {

	/**
	 * The id of the view container
	 */
	readonly id: string;

	/**
	 * The title of the view container
	 */
	readonly title: string;

	/**
	 * Icon representation of the View container
	 */
	//readonly icon?: ThemeIcon | URI;

	/**
	 * Order of the view container.
	 */
	readonly order?: number;

	/**
	 * IViewPaneContainer Ctor to instantiate
	 */
	readonly ctorDescriptor: SyncDescriptor<IViewPaneContainer>;

	/**
	 * Descriptor for open view container command
	 * If not provided, view container info (id, title) is used.
	 *
	 * Note: To prevent registering open command, use `donotRegisterOpenCommand` flag while registering the view container
	 */
	readonly openCommandActionDescriptor?: OpenCommandActionDescriptor;

	/**
	 * Storage id to use to store the view container state.
	 * If not provided, it will be derived.
	 */
	readonly storageId?: string;

	/**
	 * If enabled, view container is not shown if it has no active views.
	 */
	readonly hideIfEmpty?: boolean;

	/**
	 * Id of the extension that contributed the view container
	 */
	//readonly extensionId?: ExtensionIdentifier;

	readonly alwaysUseContainerInfo?: boolean;

	readonly viewOrderDelegate?: ViewOrderDelegate;

	readonly rejectAddedViews?: boolean;

	requestedIndex?: number;
}

export interface ViewContainer extends IViewContainerDescriptor { }

export interface IViewContainersRegistry {
	/**
	 * An event that is triggered when a view container is registered.
	 */
	//readonly onDidRegister: Event<{ viewContainer: ViewContainer; viewContainerLocation: ViewContainerLocation }>;

	/**
	 * An event that is triggered when a view container is deregistered.
	 */
	//readonly onDidDeregister: Event<{ viewContainer: ViewContainer; viewContainerLocation: ViewContainerLocation }>;

	/**
	 * All registered view containers
	 */
	readonly all: ViewContainer[];

	/**
	 * Registers a view container to given location.
	 * No op if a view container is already registered.
	 *
	 * @param viewContainerDescriptor descriptor of view container
	 * @param location location of the view container
	 *
	 * @returns the registered ViewContainer.
	 */
	registerViewContainer(viewContainerDescriptor: IViewContainerDescriptor, location: ViewContainerLocation, options?: { isDefault?: boolean; donotRegisterOpenCommand?: boolean }): ViewContainer;

	/**
	 * Deregisters the given view container
	 * No op if the view container is not registered
	 */
	deregisterViewContainer(viewContainer: ViewContainer): void;

	/**
	 * Returns the view container with given id.
	 *
	 * @returns the view container with given id.
	 */
	get(id: string): ViewContainer | undefined;

	/**
	 * Returns all view containers in the given location
	 */
	getViewContainers(location: ViewContainerLocation): ViewContainer[];

	/**
	 * Returns the view container location
	 */
	getViewContainerLocation(container: ViewContainer): ViewContainerLocation;

	/**
	 * Return the default view container from the given location
	 */
	getDefaultViewContainer(location: ViewContainerLocation): ViewContainer | undefined;
}

export interface IView {

	readonly id: string;

	focus(): void;

	isVisible(): boolean;

	isBodyVisible(): boolean;

	setExpanded(expanded: boolean): boolean;

	//getProgressIndicator(): IProgressIndicator | undefined;
}

export const IViewsService = createDecorator<IViewsService>('viewsService');
export interface IViewsService {

	readonly _serviceBrand: undefined;

	// View Container APIs
	//readonly onDidChangeViewContainerVisibility: Event<{ id: string; visible: boolean; location: ViewContainerLocation }>;
	isViewContainerVisible(id: string): boolean;
	openViewContainer(id: string, focus?: boolean): Promise<IPaneComposite | null>;
	closeViewContainer(id: string): void;
	//getVisibleViewContainer(location: ViewContainerLocation): ViewContainer | null;
	//getActiveViewPaneContainerWithId(viewContainerId: string): IViewPaneContainer | null;

	// View APIs
	//readonly onDidChangeViewVisibility: Event<{ id: string; visible: boolean }>;
	isViewVisible(id: string): boolean;
	openView<T extends IView>(id: string, focus?: boolean): Promise<T | null>;
	closeView(id: string): void;
	//getActiveViewWithId<T extends IView>(id: string): T | null;
	//getViewWithId<T extends IView>(id: string): T | null;
	//getViewProgressIndicator(id: string): IProgressIndicator | undefined;
}

export interface IViewPaneContainer {
    getView(viewId: string): IView | undefined;
}

interface RelaxedViewContainer extends ViewContainer {

	openCommandActionDescriptor?: OpenCommandActionDescriptor;
}

class ViewContainersRegistryImpl extends Disposable implements IViewContainersRegistry {

	private readonly _onDidRegister = this._register(new Emitter<{ viewContainer: ViewContainer; viewContainerLocation: ViewContainerLocation }>());
	readonly onDidRegister: Event<{ viewContainer: ViewContainer; viewContainerLocation: ViewContainerLocation }> = this._onDidRegister.event;

	private readonly _onDidDeregister = this._register(new Emitter<{ viewContainer: ViewContainer; viewContainerLocation: ViewContainerLocation }>());
	readonly onDidDeregister: Event<{ viewContainer: ViewContainer; viewContainerLocation: ViewContainerLocation }> = this._onDidDeregister.event;

	private readonly viewContainers: Map<ViewContainerLocation, ViewContainer[]> = new Map<ViewContainerLocation, ViewContainer[]>();
	private readonly defaultViewContainers: ViewContainer[] = [];

	get all(): ViewContainer[] {
		return flatten([...this.viewContainers.values()]);
	}
	
	registerViewContainer(viewContainerDescriptor: IViewContainerDescriptor, viewContainerLocation: ViewContainerLocation, options?: { isDefault?: boolean | undefined; donotRegisterOpenCommand?: boolean | undefined; }): ViewContainer {
		const existing = this.get(viewContainerDescriptor.id);
		if (existing) {
			return existing;
		}

		const viewContainer: RelaxedViewContainer = viewContainerDescriptor;
		viewContainer.openCommandActionDescriptor = options?.donotRegisterOpenCommand ? undefined : (viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id });
		const viewContainers = getOrSet(this.viewContainers, viewContainerLocation, []);
		viewContainers.push(viewContainer);
		if (options?.isDefault) {
			this.defaultViewContainers.push(viewContainer);
		}
		this._onDidRegister.fire({ viewContainer, viewContainerLocation });
		return viewContainer;
	}

	deregisterViewContainer(viewContainer: ViewContainer): void {
		for (const viewContainerLocation of this.viewContainers.keys()) {
			const viewContainers = this.viewContainers.get(viewContainerLocation)!;
			const index = viewContainers?.indexOf(viewContainer);
			if (index !== -1) {
				viewContainers?.splice(index, 1);
				if (viewContainers.length === 0) {
					this.viewContainers.delete(viewContainerLocation);
				}
				this._onDidDeregister.fire({ viewContainer, viewContainerLocation });
				return;
			}
		}
	}

	get(id: string): ViewContainer | undefined {
		return this.all.filter(viewContainer => viewContainer.id === id)[0];
	}

	getViewContainers(location: ViewContainerLocation): ViewContainer[] {
		return [...(this.viewContainers.get(location) || [])];
	}

	getViewContainerLocation(container: ViewContainer): ViewContainerLocation {
		return [...this.viewContainers.keys()].filter(location => this.getViewContainers(location).filter(viewContainer => viewContainer?.id === container.id).length > 0)[0];
	}

	getDefaultViewContainer(location: ViewContainerLocation): ViewContainer | undefined {
		return this.defaultViewContainers.find(viewContainer => this.getViewContainerLocation(viewContainer) === location);
	}
	
}


export interface IViewsRegistry {

}

export const IViewDescriptorService = createDecorator<IViewDescriptorService>('viewDescriptorService');

export interface IViewDescriptorService {
	readonly _serviceBrand: undefined;

	// ViewContainers
	readonly viewContainers: ReadonlyArray<ViewContainer>;
}

Registry.add(Extensions.ViewContainersRegistry, new ViewContainersRegistryImpl());