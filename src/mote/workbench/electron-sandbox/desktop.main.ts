import { INativeWindowConfiguration } from "mote/platform/window/common/window";
import { domContentLoaded } from "vs/base/browser/dom";
import { Disposable } from "vs/base/common/lifecycle";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";
import { Workbench } from "mote/workbench/browser/workbench";
import { INativeWorkbenchEnvironmentService, NativeWorkbenchEnvironmentService } from "mote/workbench/services/environment/electron-sandbox/environmentService";
import { IProductService } from "vs/platform/product/common/productService";
import product from "vs/platform/product/common/product";
import { LoggerChannelClient, LogLevelChannelClient } from "vs/platform/log/common/logIpc";
import { ILoggerService, ILogService, LogLevel } from "vs/platform/log/common/log";
import { isCI } from "vs/base/common/platform";
import { safeStringify } from "vs/base/common/objects";
import { IMainProcessService } from "vs/platform/ipc/electron-sandbox/services";
import { ElectronIPCMainProcessService } from "vs/platform/ipc/electron-sandbox/mainProcessService";
import { NativeLogService } from "mote/workbench/services/log/electron-sandbox/logService";

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
		const workbench = new Workbench(document.body, services.serviceCollection);

		// Startup
		const instantiationService = workbench.startup();
	}

    private async initServices() {
		const serviceCollection = new ServiceCollection();

		// Main Process
		const mainProcessService = this._register(new ElectronIPCMainProcessService(this.configuration.windowId));
		serviceCollection.set(IMainProcessService, mainProcessService);

		// Product
		const productService: IProductService = { _serviceBrand: undefined, ...product };
		serviceCollection.set(IProductService, productService);

		// Environment
		const environmentService = new NativeWorkbenchEnvironmentService(this.configuration, productService);
		serviceCollection.set(INativeWorkbenchEnvironmentService, environmentService);

		// Logger
		const logLevelChannelClient = new LogLevelChannelClient(mainProcessService.getChannel('logLevel'));
		const loggerService = new LoggerChannelClient(LogLevel.Debug, logLevelChannelClient.onDidChangeLogLevel, mainProcessService.getChannel('logger'));
		serviceCollection.set(ILoggerService, loggerService);

		// Log
		const logService = this._register(new NativeLogService(`renderer${this.configuration.windowId}`, LogLevel.Debug, loggerService, logLevelChannelClient, environmentService));
		serviceCollection.set(ILogService, logService);
		logService.setLevel(LogLevel.Debug);
		if (isCI) {
			logService.info('workbench#open()'); // marking workbench open helps to diagnose flaky integration/smoke tests
		}
		if (logService.getLevel() === LogLevel.Trace) {
			logService.trace('workbench#open(): with configuration', safeStringify(this.configuration));
		}

        return {serviceCollection};
    }

}


export function main(configuration: INativeWindowConfiguration): Promise<void> {
	const workbench = new DesktopMain(configuration);

	return workbench.open();
}