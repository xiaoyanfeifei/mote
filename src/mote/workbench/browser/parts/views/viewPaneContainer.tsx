import { IThemeService } from "mote/platform/theme/common/themeService";
import { Component } from "mote/workbench/common/component";
import { IView, IViewPaneContainer } from "mote/workbench/common/views";
import { IWorkbenchLayoutService } from "mote/workbench/services/layout/browser/layoutService";
import { IPaneViewOptions } from "vs/base/browser/ui/splitview/paneview";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";

export interface IViewPaneContainerOptions extends IPaneViewOptions {
	mergeViewWithContainerWhenSingleView: boolean;
}


export class ViewPaneContainer extends Component implements IViewPaneContainer {

    constructor(
        id: string,
        @IWorkbenchLayoutService protected layoutService: IWorkbenchLayoutService,
		@ILogService protected logService: ILogService,
		@IInstantiationService protected instantiationService: IInstantiationService,
        @IThemeService themeService: IThemeService,
    ) {
        super(id, themeService);
    }
    
    getView(viewId: string): IView | undefined {
        throw new Error("Method not implemented.");
    }

    create(parent: HTMLElement): void {
        this.logService.debug("[ViewPaneContainer]#create");
    }
    
}