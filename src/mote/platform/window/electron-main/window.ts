import { IDisposable } from 'vs/base/common/lifecycle';
import { INativeWindowConfiguration } from 'mote/platform/window/common/window';
import { BrowserWindow } from 'electron';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';

export interface IAppWindow extends IDisposable {

	onWillLoad(arg0: (e: any) => void): any;


	readonly id: number;
	readonly win: BrowserWindow | null; /* `null` after being disposed */

	readonly isReady: boolean;

	load(config: INativeWindowConfiguration, options?: { isReload?: boolean }): void;
	reload(cli?: NativeParsedArgs): void;

	send(channel: string, ...args: any[]): void;

	close(): void;
}

export const enum LoadReason {

	/**
	 * The window is loaded for the first time.
	 */
	INITIAL = 1,

	/**
	 * The window is loaded into a different workspace context.
	 */
	LOAD,

	/**
	 * The window is reloaded.
	 */
	RELOAD
}

export const enum UnloadReason {

	/**
	 * The window is closed.
	 */
	CLOSE = 1,

	/**
	 * All windows unload because the application quits.
	 */
	QUIT,

	/**
	 * The window is reloaded.
	 */
	RELOAD,

	/**
	 * The window is loaded into a different workspace context.
	 */
	LOAD
}
