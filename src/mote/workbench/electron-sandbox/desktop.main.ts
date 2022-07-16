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
import { BrowserStorageService } from 'vs/workbench/services/storage/browser/storageService';
import { onUnexpectedError } from "vs/base/common/errors";
import { IStorageService } from "vs/platform/storage/common/storage";
import { WorkspaceService } from "mote/workbench/services/workspace/browser/workspaceService";
import { IWorkspaceContextService } from "mote/platform/workspace/common/workspace";
import { NativeWindow } from "./window";

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
		console.log('Open desktop');

		// Init services and wait for DOM to be ready in parallel
		const [services] = await Promise.all([this.initServices(), domContentLoaded()]);

		// Create Workbench
		const workbench = new Workbench(document.body, undefined, services.serviceCollection, services.logService);

		// Startup
		const instantiationService = workbench.startup();

		// Window
		this._register(instantiationService.createInstance(NativeWindow));
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

		const storageService = await this.createStorageService(logService);
		// Storage
		serviceCollection.set(IStorageService, storageService);

		const workspaceService = await this.createWorkspaceService();
		serviceCollection.set(IWorkspaceContextService, workspaceService);

		return { serviceCollection, logService };
	}

	private async createStorageService(logService: ILogService) {
		const storageService = new BrowserStorageService({ id: 'mote' }, { currentProfile: '' } as any, logService);

		try {
			await storageService.initialize();
		} catch (error) {
			onUnexpectedError(error);
			logService.error(error);

			return storageService;
		}

		return storageService;
	}

	private async createWorkspaceService() {
		const workspaceService = new WorkspaceService();
		await workspaceService.initialize();
		return workspaceService;
	}

}


export function main(configuration: INativeWindowConfiguration): Promise<void> {
	const workbench = new DesktopMain(configuration);

	return workbench.open();
}
