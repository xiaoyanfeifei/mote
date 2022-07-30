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
import { ICommandService } from 'mote/platform/commands/common/commands';
import { IWorkspaceContextService } from 'mote/platform/workspace/common/workspace';

const viewsRegistry = Registry.as<IViewsRegistry>(Extensions.ViewsRegistry);
const viewContainerRegistry = Registry.as<IViewContainersRegistry>(Extensions.ViewContainersRegistry);

export class ExplorerViewPaneContainer extends ViewPaneContainer {
	constructor(
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@ILogService logService: ILogService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@ICommandService private readonly commandService: ICommandService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IWorkspaceContextService private readonly contextService: IWorkspaceContextService,
	) {
		super(FILES_VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, layoutService, logService, instantiationService, themeService, viewDescriptorService);
	}

	override create(parent: HTMLElement): void {
		super.create(parent);
		parent.classList.add('explorer-viewlet');
		//parent.style.backgroundColor = ThemedStyles.sidebarBackground.dark;
	}

	override renderHeader(parent: HTMLElement) {
		const title = this.getTitle();

		parent.style.height = '45px';
		parent.style.alignItems = 'center';
		parent.style.display = 'flex';

		const iconContainer = document.createElement('div');
		iconContainer.style.borderRadius = '3px';
		iconContainer.style.height = '18px';
		iconContainer.style.width = '18px';
		iconContainer.style.backgroundColor = 'rgb(137, 137, 137)';
		iconContainer.style.alignItems = 'center';
		iconContainer.style.justifyContent = 'center';
		iconContainer.style.display = 'flex';
		iconContainer.style.marginRight = '8px';

		const icon = document.createElement('div');
		icon.style.lineHeight = '1';
		icon.innerText = title[0];

		iconContainer.appendChild(icon);

		const spaceContainer = document.createElement('div');
		spaceContainer.innerText = title;

		parent.appendChild(iconContainer);
		parent.appendChild(spaceContainer);
		return true;
	}

	override getTitle() {
		const spaceStore = this.contextService.getSpaceStore();
		return spaceStore.getSpaceName() || 'Untitled Space';
	}
}

export class ExplorerViewlet {

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
