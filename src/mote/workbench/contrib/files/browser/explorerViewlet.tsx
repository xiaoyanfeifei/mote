import { ViewPaneContainer } from "mote/workbench/browser/parts/views/viewPaneContainer";
import { Extensions, IViewContainersRegistry, IViewsRegistry, ViewContainer, ViewContainerLocation } from "mote/workbench/common/views";
import { IWorkbenchLayoutService } from "mote/workbench/services/layout/browser/layoutService";
import { append , $} from "vs/base/browser/dom";
import { localize } from "vs/nls";
import { SyncDescriptor } from "vs/platform/instantiation/common/descriptors";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { Registry } from "vs/platform/registry/common/platform";
import { FILES_VIEWLET_ID } from "../common/files";
import { Outliner } from "./views/outliner";

const viewsRegistry = Registry.as<IViewsRegistry>(Extensions.ViewsRegistry);
const viewContainerRegistry = Registry.as<IViewContainersRegistry>(Extensions.ViewContainersRegistry);

export class ExplorerViewPaneContainer extends ViewPaneContainer {
    constructor(
        @IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
        @ILogService logService: ILogService,
        @IInstantiationService instantiationService: IInstantiationService,
    ) {
        super(FILES_VIEWLET_ID, layoutService, logService, instantiationService);
    }

    override create(parent: HTMLElement): void {
		super.create(parent);
		parent.classList.add('explorer-viewlet');
        const body = append(parent, $('.pane-body'));
        this.renderBody(body);
	}

    renderBody(container: HTMLElement) {
        container.style.paddingTop = "14px";
        const outliner = new Outliner();
        outliner.create(container);
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