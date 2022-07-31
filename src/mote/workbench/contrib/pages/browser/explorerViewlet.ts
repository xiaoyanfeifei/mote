import { ThemedStyles } from 'mote/base/common/themes';
import { IThemeService } from 'mote/platform/theme/common/themeService';
import { ViewPaneContainer } from 'mote/workbench/browser/parts/views/viewPaneContainer';
import { Extensions, IViewContainersRegistry, IViewDescriptor, IViewDescriptorService, IViewsRegistry, ViewContainer, ViewContainerLocation } from "mote/workbench/common/views";
import { IWorkbenchLayoutService } from 'mote/workbench/services/layout/browser/layoutService';

import { localize } from 'vs/nls';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { Registry } from 'vs/platform/registry/common/platform';
import { FILES_VIEWLET_ID } from '../common/files';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'mote/workbench/common/contribution';
import { EmptyView } from './views/emptyView';
import { ExplorerView } from './views/explorerView';
import { IWorkspaceContextService } from 'mote/platform/workspace/common/workspace';
import { IContextViewService } from 'mote/platform/contextview/browser/contextView';
import { WorkspacesController } from 'mote/workbench/contrib/pages/browser/views/workspacesController';

const viewsRegistry = Registry.as<IViewsRegistry>(Extensions.ViewsRegistry);
const viewContainerRegistry = Registry.as<IViewContainersRegistry>(Extensions.ViewContainersRegistry);

export class ExplorerViewPaneContainer extends ViewPaneContainer {

	private workspacesController!: WorkspacesController;

	constructor(
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@ILogService logService: ILogService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IContextViewService private readonly contextViewService: IContextViewService,
		@IWorkspaceContextService private readonly contextService: IWorkspaceContextService,
	) {
		super(FILES_VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, layoutService, logService, instantiationService, themeService, viewDescriptorService);

	}

	override create(parent: HTMLElement): void {
		super.create(parent);
		parent.classList.add('explorer-viewlet');
	}

	override renderHeader(parent: HTMLElement) {
		this.workspacesController = new WorkspacesController(parent, this.contextViewService, this.contextService, this.instantiationService);
		return true;
	}

	override getTitle() {
		const spaceStore = this.contextService.getSpaceStore();
		return spaceStore.getSpaceName() || 'Untitled Space';
	}
}

export class ExplorerViewletViewsContribution extends Disposable implements IWorkbenchContribution {

	constructor() {
		super();
		this.registerView();
	}

	private registerView() {

		const viewDescriptors = viewsRegistry.getViews(EXPLORER_VIEW_CONTAINER);

		const viewDescriptorsToRegister: IViewDescriptor[] = [];
		const viewDescriptorsToDeregister: IViewDescriptor[] = [];

		const explorerViewDescriptor = this.createExplorerViewDescriptor();
		const registeredExplorerViewDescriptor = viewDescriptors.find(v => v.id === explorerViewDescriptor.id);
		const emptyViewDescriptor = this.createEmptyViewDescriptor();
		const registeredEmptyViewDescriptor = viewDescriptors.find(v => v.id === emptyViewDescriptor.id);

		// for empty state
		if (registeredExplorerViewDescriptor) {
			viewDescriptorsToDeregister.push(registeredExplorerViewDescriptor);
		}
		if (!registeredEmptyViewDescriptor) {
			//viewDescriptorsToRegister.push(emptyViewDescriptor);
			viewDescriptorsToRegister.push(explorerViewDescriptor);
		}

		if (viewDescriptorsToRegister.length) {
			viewsRegistry.registerViews(viewDescriptorsToRegister, EXPLORER_VIEW_CONTAINER);
		}
		if (viewDescriptorsToDeregister.length) {
			viewsRegistry.deregisterViews(viewDescriptorsToDeregister, EXPLORER_VIEW_CONTAINER);
		}
	}

	private createEmptyViewDescriptor(): IViewDescriptor {
		return {
			id: EmptyView.ID,
			name: 'No Folder Opened', //EmptyView.NAME,
			//containerIcon: explorerViewIcon,
			ctorDescriptor: new SyncDescriptor(EmptyView),
			order: 1,
			canToggleVisibility: true,
		};
	}

	private createExplorerViewDescriptor(): IViewDescriptor {
		return {
			id: ExplorerView.ID,
			name: localize('folders', "Folders"),
			//containerIcon: explorerViewIcon,
			ctorDescriptor: new SyncDescriptor(ExplorerView),
			order: 1,
			canToggleVisibility: false,
		};
	}
}



/**
 * Explorer viewlet container.
 */
export const EXPLORER_VIEW_CONTAINER: ViewContainer = viewContainerRegistry.registerViewContainer({
	id: FILES_VIEWLET_ID,
	title: localize('workspace', "Workspace"),
	ctorDescriptor: new SyncDescriptor(ExplorerViewPaneContainer),
}, ViewContainerLocation.Sidebar, { isDefault: true });
