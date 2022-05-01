import { IWindowsMainService, OpenContext } from "mote/platform/windows/electron-main/windows";
import { WindowsMainService } from "mote/platform/windows/electron-main/windowsMainService";
import { Disposable } from "vs/base/common/lifecycle";
import { SyncDescriptor } from "vs/platform/instantiation/common/descriptors";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";

export class MoteApplication extends Disposable {

    private windowsMainService: IWindowsMainService | undefined;
    
    constructor(
        @IInstantiationService private readonly mainInstantiationService: IInstantiationService,
    ) {
        super();
    }

    async startup(): Promise<void> {

        // Services
		const appInstantiationService = await this.initServices();

        // Open Windows
		const windows = appInstantiationService.invokeFunction(
			accessor => this.openFirstWindow(accessor)
		);
    }

    private async initServices() {
        const services = new ServiceCollection();

        // Windows
		services.set(IWindowsMainService, new SyncDescriptor(WindowsMainService));

        return this.mainInstantiationService.createChild(services);
    }

    private openFirstWindow(accessor: ServicesAccessor) {
        const windowsMainService = this.windowsMainService = accessor.get(IWindowsMainService);

        return windowsMainService.open({
            context: OpenContext.DESKTOP
        });
    }
}