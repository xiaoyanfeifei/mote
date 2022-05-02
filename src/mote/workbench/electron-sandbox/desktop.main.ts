import { INativeWindowConfiguration } from "mote/platform/window/common/window";
import { domContentLoaded } from "vs/base/browser/dom";
import { Disposable } from "vs/base/common/lifecycle";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";

export class DesktopMain extends Disposable {
	constructor(
		private readonly configuration: INativeWindowConfiguration
	) {
		super();
		this.init();
	}

    private init(): void {
        
    }

    async open(): Promise<void> {
		console.log("Open desktop");

		// Init services and wait for DOM to be ready in parallel
		const [services] = await Promise.all([this.initServices(), domContentLoaded()]);

		// Create Workbench
		//const workbench = new Workbench(document.body, services.serviceCollection);

		// Startup
		//const instantiationService = workbench.startup();
	}

    private async initServices() {
		const serviceCollection = new ServiceCollection();
    }

}


export function main(configuration: INativeWindowConfiguration): Promise<void> {
	const workbench = new DesktopMain(configuration);

	return workbench.open();
}