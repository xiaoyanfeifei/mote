import { nativeTheme } from "electron";
import { INativeWindowConfiguration } from "mote/platform/window/common/window";
import { IAppWindow } from "mote/platform/window/electron-main/window";
import { distinct } from "vs/base/common/arrays";
import { Disposable } from "vs/base/common/lifecycle";
import { IProcessEnvironment } from "vs/base/common/platform";
import { NativeParsedArgs } from "vs/platform/environment/common/argv";
import { IEnvironmentMainService } from "vs/platform/environment/electron-main/environmentMainService";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import product from "vs/platform/product/common/product";
import { AppWindow } from "./window";
import { IOpenConfiguration, IWindowsMainService } from "./windows";

interface IOpenBrowserWindowOptions {
	readonly userEnv?: IProcessEnvironment;
	readonly cli?: NativeParsedArgs;
}

export class WindowsMainService extends Disposable implements IWindowsMainService {
	constructor(
		@ILogService private readonly logService: ILogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IEnvironmentMainService private readonly environmentMainService: IEnvironmentMainService,
	) {
		super();
	}

	open(openConfig: IOpenConfiguration): IAppWindow[] {

		const { windows: usedWindows } = this.doOpen(openConfig);

		// Make sure to pass focus to the most relevant of the windows if we open multiple
		if (usedWindows.length > 1) {

		}
		return usedWindows;
	}

	private doOpen(
		openConfig: IOpenConfiguration
	) {

		// Keep track of used windows and remember
		// if files have been opened in one of them
		const usedWindows: IAppWindow[] = [];
		let filesOpenedInWindow: IAppWindow | undefined = undefined;
		function addUsedWindow(window: IAppWindow, openedFiles?: boolean): void {
			usedWindows.push(window);

			if (openedFiles) {
				filesOpenedInWindow = window;
				//filesToOpen = undefined; // reset `filesToOpen` since files have been opened
			}
		}

		addUsedWindow(this.openInBrowserWindow({}));

		return { windows: distinct(usedWindows) }
	}

	private openInBrowserWindow(options: IOpenBrowserWindowOptions): IAppWindow {
		console.log("this.environmentMainService.userHome", this.environmentMainService.tmpDir.fsPath);

		// Build up the window configuration from provided options, config and environment
		const configuration: INativeWindowConfiguration = {
			// Inherit CLI arguments from environment and/or
			// the specific properties from this launch if provided
			...this.environmentMainService.args,
			...options.cli,
			windowId: -1,

			homeDir: this.environmentMainService.userHome.fsPath,
			tmpDir: this.environmentMainService.tmpDir.fsPath,
			userDataDir: this.environmentMainService.userDataPath,

			mainPid: process.pid,
			appRoot: this.environmentMainService.appRoot,
			//perfMarks: [],
			userEnv: { ...options.userEnv },

			product,
			//os: { release: release(), hostname: hostname() },
			colorScheme: {
				dark: nativeTheme.shouldUseDarkColors,
				highContrast: nativeTheme.shouldUseInvertedColorScheme || nativeTheme.shouldUseHighContrastColors
			}
		};

		let window: IAppWindow | undefined;

		if (!window) {
			const createdWindow = window = this.instantiationService.createInstance(AppWindow);
		}

		this.doOpenInBrowserWindow(window!, configuration, options);

		return window;
	}

	private doOpenInBrowserWindow(window: IAppWindow, configuration: INativeWindowConfiguration, options: IOpenBrowserWindowOptions) {
		// Load it
		window.load(configuration);
	}
}
