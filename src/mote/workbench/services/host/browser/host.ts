import { IWorkspaceToOpen } from 'mote/platform/window/common/window';

export interface IHostService {

	//#region Window

	/**
	 * Opens an empty window. The optional parameter allows to define if
	 * a new window should open or the existing one change to an empty.
	 */
	//openWindow(options?: IOpenEmptyWindowOptions): Promise<void>;

	/**
	 * Opens the provided array of openables in a window with the provided options.
	 */
	openWindow(toOpen: IWorkspaceToOpen, options?: any): Promise<void>;

	/**
	 * Switch between fullscreen and normal window.
	 */
	toggleFullScreen(): Promise<void>;

	//#endregion

	//#region Lifecycle

	/**
	 * Restart the entire application.
	 */
	restart(): Promise<void>;

	/**
	 * Reload the currently active window.
	 */
	reload(options?: { disableExtensions?: boolean }): Promise<void>;

	/**
	 * Attempt to close the active window.
	 */
	close(): Promise<void>;

	//#endregion
}
