import { ipcMain } from "electron";
import { ILifecycleMainService } from "mote/platform/lifecycle/electron-main/lifecycleMainService";
import { IWindowsMainService, OpenContext } from "mote/platform/windows/electron-main/windows";
import { WindowsMainService } from "mote/platform/windows/electron-main/windowsMainService";
import { onUnexpectedError, setUnexpectedErrorHandler } from "vs/base/common/errors";
import { Disposable } from "vs/base/common/lifecycle";
import { SyncDescriptor } from "vs/platform/instantiation/common/descriptors";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";
import { ILogService } from "vs/platform/log/common/log";

export class MoteApplication extends Disposable {

    private windowsMainService: IWindowsMainService | undefined;
    
    constructor(
        @ILogService private readonly logService: ILogService,
        //@ILifecycleMainService private readonly lifecycleMainService: ILifecycleMainService,
        @IInstantiationService private readonly mainInstantiationService: IInstantiationService,
    ) {
        super();

        this.registerListeners();
    }

    private registerListeners(): void {
        // We handle uncaught exceptions here to prevent electron from opening a dialog to the user
		setUnexpectedErrorHandler(error => this.onUnexpectedError(error));
		process.on('uncaughtException', error => onUnexpectedError(error));
		process.on('unhandledRejection', (reason: unknown) => onUnexpectedError(reason));

        // Dispose on shutdown
		//this.lifecycleMainService.onWillShutdown(() => this.dispose());
        
        ipcMain.handle('vscode:fetchShellEnv', event => {

		});
    }

    async startup(): Promise<void> {

        // Services
		const appInstantiationService = await this.initServices();

        // Open Windows
		const windows = appInstantiationService.invokeFunction(
			accessor => this.openFirstWindow(accessor)
		);
    }

    private onUnexpectedError(error: Error): void {
		if (error) {

			// take only the message and stack property
			const friendlyError = {
				message: `[uncaught exception in main]: ${error.message}`,
				stack: error.stack
			};

			// handle on client side
			//this.windowsMainService?.sendToFocused('vscode:reportError', JSON.stringify(friendlyError));
		}

		this.logService.error(`[uncaught exception in main]: ${error}`);
		if (error.stack) {
			this.logService.error(error.stack);
		}
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