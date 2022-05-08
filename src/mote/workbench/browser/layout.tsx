import { Disposable } from "vs/base/common/lifecycle";
import { IWorkbenchLayoutService, Parts } from "mote/workbench/services/layout/browser/layoutService";
import { IDimension } from "vs/base/browser/dom";
import { Part } from "./part";
import { Emitter, Event } from "vs/base/common/event";
import { ILogService } from "vs/platform/log/common/log";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IPaneCompositePartService } from "../services/panecomposite/browser/panecomposite";
import { DeferredPromise, Promises } from "vs/base/common/async";
import { ViewContainerLocation } from "../common/views";
import { FILES_VIEWLET_ID } from "../contrib/files/common/files";

export abstract class Layout extends Disposable implements IWorkbenchLayoutService {

	declare readonly _serviceBrand: undefined;

    private readonly _onDidLayout = this._register(new Emitter<IDimension>());
	readonly onDidLayout = this._onDidLayout.event;

    //#region Properties

	readonly hasContainer = true;
	readonly container = document.createElement('div');

	private _dimension!: IDimension;
	get dimension(): IDimension { return this._dimension; }

	offset?: { top: number; } | undefined;
    
    //#endregion

    private readonly parts = new Map<string, Part>();

	protected logService!: ILogService;

	private paneCompositeService!: IPaneCompositePartService;

    constructor(
		protected readonly parent: HTMLElement
	) {
		super();
	}

	isVisible(part: Parts): boolean {
		return true;
	}

	setPartHidden(hidden: boolean, part: Parts.BANNER_PART | Parts.ACTIVITYBAR_PART | Parts.SIDEBAR_PART | Parts.PANEL_PART | Parts.AUXILIARYBAR_PART | Parts.EDITOR_PART): void {
		//throw new Error("Method not implemented.");
	}

	protected initLayout(accessor: ServicesAccessor): void {
		
		this.paneCompositeService = accessor.get(IPaneCompositePartService);
	}

  
    focus(): void {
        throw new Error("Method not implemented.");
    }

    registerPart(part: Part): void {
		console.log("[Layout] registerPart", part);
		this.parts.set(part.getId(), part);
	}

	protected getPart(key: Parts): Part {
		const part = this.parts.get(key);
		if (!part) {
			throw new Error(`Unknown part ${key}`);
		}

		return part;
	}

    protected createWorkbenchLayout(): void {
        const sideBar = this.getPart(Parts.SIDEBAR_PART);

        this.container.prepend(sideBar.getContainer()!);
    }

	private readonly whenReadyPromise = new DeferredPromise<void>();
	protected readonly whenReady = this.whenReadyPromise.p;

	private readonly whenRestoredPromise = new DeferredPromise<void>();
	readonly whenRestored = this.whenRestoredPromise.p;
	private restored = false;

	isRestored(): boolean {
		return this.restored;
	}

	protected restoreParts(): void {

		// distinguish long running restore operations that
		// are required for the layout to be ready from those
		// that are needed to signal restoring is done
		const layoutReadyPromises: Promise<unknown>[] = [];
		const layoutRestoredPromises: Promise<unknown>[] = [];

		// Restore Sidebar
		layoutReadyPromises.push((async () => {
			const viewlet = await this.paneCompositeService.openPaneComposite(FILES_VIEWLET_ID, ViewContainerLocation.Sidebar);
			if (!viewlet) {
				//await this.paneCompositeService.openPaneComposite(this.viewDescriptorService.getDefaultViewContainer(ViewContainerLocation.Sidebar)?.id, ViewContainerLocation.Sidebar); // fallback to default viewlet as needed
			}

			this.logService.debug("[Layout] did restore SideBar viewlet")
		})());

		// Await for promises that we recorded to update
		// our ready and restored states properly.
		Promises.settled(layoutReadyPromises).finally(() => {
			this.whenReadyPromise.complete();

			Promises.settled(layoutRestoredPromises).finally(() => {
				this.restored = true;
				this.whenRestoredPromise.complete();
			});
		});
	}
}