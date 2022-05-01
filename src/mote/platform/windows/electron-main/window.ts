import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { FileAccess } from "mote/base/common/network";
import { INativeWindowConfiguration } from "mote/platform/window/common/window";
import { IAppWindow } from "mote/platform/window/electron-main/window";
import { Disposable } from "vs/base/common/lifecycle";

interface ILoadOptions {
	isReload?: boolean;
	disableExtensions?: boolean;
}

const enum ReadyState {

	/**
	 * This window has not loaded anything yet
	 * and this is the initial state of every
	 * window.
	 */
	NONE,

	/**
	 * This window is navigating, either for the
	 * first time or subsequent times.
	 */
	NAVIGATING,

	/**
	 * This window has finished loading and is ready
	 * to forward IPC requests to the web contents.
	 */
	READY
}

export class AppWindow extends Disposable implements IAppWindow {

    //#region Properties

	private _id: number;
	get id(): number { return this._id; }

	private _win: BrowserWindow;
	get win(): BrowserWindow | null { return this._win; }

    constructor() {
        super();

        //#region create browser window
        {
            const options: BrowserWindowConstructorOptions & { experimentalDarkMode: boolean } = {
                experimentalDarkMode: true
            }

            this._win = new BrowserWindow(options);
            this._id = this._win.id;
            this._win.webContents.openDevTools();
        }
    }
    
    load(config: INativeWindowConfiguration, options: ILoadOptions = Object.create(null)): void {
       // this.logService.info(`window#load: attempt to load window (id: ${this._id})`);

        // Update configuration values based on our window context
		// and set it into the config object URL for usage.
		//this.updateConfiguration(config, options);

        const url = FileAccess.asBrowserUri(
            'mote/app/electron-browser/workbench/workbench.html', require
        ).toString();

        // Load URL
		this._win.loadURL(url);
    }
}