import { app, dialog } from "electron";
import { InstantiationService } from "vs/platform/instantiation/common/instantiationService";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";
import { MoteApplication } from "./app";

class MoteMain {

    main(): void {
		try {
			this.startup();
		} catch (error) {
			console.error(error.message);
			app.exit(1);
		}
	}

    private async startup(): Promise<void> {
        const [instantiationService] = this.createServices();

        // Startup
		await instantiationService.invokeFunction(async accessor => {
            console.log("startup...");

            return instantiationService.createInstance(MoteApplication).startup();
        });
    }

    private createServices() {
        const services = new ServiceCollection();
        return [new InstantiationService(services, true)];
    }
}

// Main Startup
const mote = new MoteMain();
mote.main();