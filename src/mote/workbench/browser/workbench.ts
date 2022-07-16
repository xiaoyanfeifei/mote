import 'mote/workbench/browser/style';
import { getSingletonServiceDescriptors } from "vs/platform/instantiation/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { InstantiationService } from "vs/platform/instantiation/common/instantiationService";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";
import { ILogService } from "vs/platform/log/common/log";
import { IWorkbenchLayoutService, Parts } from "mote/workbench/services/layout/browser/layoutService";
import { Layout } from "./layout";
import { onUnexpectedError } from "vs/base/common/errors";
import { IViewsService, ViewContainerLocation } from "../common/views";
import { ViewsService } from "./parts/views/viewsService";
import { EXPLORER_VIEW_CONTAINER } from "../contrib/pages/browser/explorerViewlet";
import { IThemeService } from "mote/platform/theme/common/themeService";
import { MockThemeService } from "mote/platform/theme/common/mockThemeService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { Registry } from "vs/platform/registry/common/platform";
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from "../common/contribution";
import { IWorkbenchOptions } from 'vs/workbench/browser/workbench';
import { BrowserThemeService } from 'mote/platform/theme/browser/browserThemeService';

export class Workbench extends Layout {

	constructor(
		parent: HTMLElement,
		private readonly options: IWorkbenchOptions | undefined,
		private readonly serviceCollection: ServiceCollection,
		logService: ILogService
	) {
		super(parent);
		this.logService = logService;
	}

	startup() {
		this.logService.info('[Workbench] startup...');

		try {
			// Services
			const instantiationService = this.initServices(this.serviceCollection);

			instantiationService.invokeFunction(accessor => {
				// Init the logService at first
				this.logService = accessor.get(ILogService);

				accessor.get(IViewsService);

				// Layout
				this.initLayout(accessor);

				// Registries
				Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).start(accessor);

				// Render Workbench
				this.renderWorkbench(instantiationService);

				// Workbench Layout
				this.createWorkbenchLayout();

				// Layout
				this.layout();

				// Restore
				this.restore();
			});

			return instantiationService;
		} catch (error) {
			throw error; // rethrow because this is a critical issue we cannot handle properly here
		}

	}

	private initServices(serviceCollection: ServiceCollection) {

		// Layout Service
		serviceCollection.set(IWorkbenchLayoutService, this);

		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		//
		// NOTE: Please do NOT register services here. Use `registerSingleton()`
		//       from `workbench.common.main.ts` if the service is shared between
		//       native and web or `workbench.sandbox.main.ts` if the service
		//       is native only.
		//
		//       DO NOT add services to `workbench.desktop.main.ts`, always add
		//       to `workbench.sandbox.main.ts` to support our Electron sandbox
		//
		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		// All Contributed Services which register by registerSingleton
		const contributedServices = getSingletonServiceDescriptors();
		for (const [id, descriptor] of contributedServices) {
			this.logService.debug('create service:', descriptor.ctor.name);
			serviceCollection.set(id, descriptor);
		}

		// Add mock service
		//serviceCollection.set(IThemeService, new BrowserThemeService());

		const instantiationService = new InstantiationService(serviceCollection, true);

		return instantiationService;
	}

	private renderWorkbench(instantiationService: IInstantiationService) {

		// Create Parts
		[
			{ id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', 'left'], options: {} },
			{ id: Parts.EDITOR_PART, role: 'main', classes: ['editor'], options: {} }
		].forEach(({ id, role, classes, options }) => {
			const partContainer = this.createPart(id, role, classes);
			console.log(`[Workbench] create part: ${id}`);
			this.getPart(id).create(partContainer, options);
		});

		// Add Workbench to DOM
		this.parent.appendChild(this.container);
	}

	private createPart(id: string, role: string, classes: string[]): HTMLElement {
		const part = document.createElement(role === 'status' ? 'footer' /* Use footer element for status bar #98376 */ : 'div');
		part.classList.add('part', ...classes);
		part.id = id;
		part.setAttribute('role', role);
		if (role === 'status') {
			part.setAttribute('aria-live', 'off');
		}

		return part;
	}

	private restore(): void {
		// Ask each part to restore
		try {
			this.restoreParts();
		} catch (error) {
			onUnexpectedError(error);
		}
	}
}
