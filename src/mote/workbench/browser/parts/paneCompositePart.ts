import { IPaneComposite } from "mote/workbench/common/panecomposite";
import { ViewContainerLocation } from "mote/workbench/common/views";
import { IPaneCompositePartService } from "mote/workbench/services/panecomposite/browser/panecomposite";
import { Disposable } from "vs/base/common/lifecycle";
import { assertIsDefined } from "vs/base/common/types";
import { registerSingleton } from "vs/platform/instantiation/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { PaneCompositeDescriptor } from "../panecomposite";
import { SidebarPart } from "./sidebar/sidebarPart";

export interface IPaneCompositePart {

    /**
	 * Opens a viewlet with the given identifier and pass keyboard focus to it if specified.
	 */
	openPaneComposite(id: string | undefined, focus?: boolean): Promise<IPaneComposite | undefined>;
}

export class PaneCompositeParts extends Disposable implements IPaneCompositePartService {
    declare readonly _serviceBrand: undefined;

    private paneCompositeParts = new Map<ViewContainerLocation, IPaneCompositePart>();

    constructor(
        @ILogService private logService: ILogService,
        @IInstantiationService instantiationService: IInstantiationService
    ) {
		super();

        const sideBarPart = instantiationService.createInstance(SidebarPart);

        this.paneCompositeParts.set(ViewContainerLocation.Sidebar, sideBarPart);
    }

    openPaneComposite(id: string | undefined, viewContainerLocation: ViewContainerLocation, focus?: boolean): Promise<IPaneComposite | undefined> {
        this.logService.debug(`[PaneCompositeParts]#openPaneComposite <${id}>`);
		return this.getPartByLocation(viewContainerLocation).openPaneComposite(id, focus);
    }

    getPaneComposite(id: string, viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor | undefined {
        throw new Error("Method not implemented.");
    }

    private getPartByLocation(viewContainerLocation: ViewContainerLocation): IPaneCompositePart {
		const part = this.paneCompositeParts.get(viewContainerLocation);
		if (!part) {
			console.log("viewContainerLocation", viewContainerLocation);
			console.log("paneCompositeParts", this.paneCompositeParts);
		}
		return assertIsDefined(part);
	}
    
}

registerSingleton(IPaneCompositePartService, PaneCompositeParts);