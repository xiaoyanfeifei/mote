
import { createElement } from "mote/base/jsx/createElement";
import { getSingletonServiceDescriptors } from "vs/platform/instantiation/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { InstantiationService } from "vs/platform/instantiation/common/instantiationService";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";
import { ILogService } from "vs/platform/log/common/log";

export class Workbench {
	protected parent: HTMLElement;
    protected logService!: ILogService;
    
    constructor(
		parent: HTMLElement,
		private readonly serviceCollection: ServiceCollection,
	) {
		this.parent = parent;
        //super(parent);
    }

    startup() {
        console.log("[Workbench] startup...");

        try {
			// Services
			const instantiationService = this.initServices(this.serviceCollection);

			instantiationService.invokeFunction(accessor => {
				// Init the logService at first
				this.logService = accessor.get(ILogService);

				this.renderWorkbench(instantiationService);
            })
        } catch (error) {
			throw error; // rethrow because this is a critical issue we cannot handle properly here
        }

    }

    private initServices(serviceCollection: ServiceCollection) {

		// Layout Service
		//serviceCollection.set(IWorkbenchLayoutService, this);

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
		for (let [id, descriptor] of contributedServices) {
			console.log(`set contribution ${id}`);
			serviceCollection.set(id, descriptor);
		}


		const instantiationService = new InstantiationService(serviceCollection, true);

        return instantiationService;
    }

	private renderWorkbench(instantiationService: IInstantiationService) {
		this.parent.appendChild(this.render());
	}

    render() {
        return (
            <div>
                Hello World
            </div>
        )
    }
}