import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { createDecorator } from "vs/platform/instantiation/common/instantiation";

export const enum WorkbenchState {
	EMPTY = 1,
	FOLDER,
	WORKSPACE
}

export interface IWorkspacePage {

    /**
	 * The associated URI for this workspace page.
	 */
	readonly uri: URI;

    /**
	 * The name of this workspace page. Defaults to
	 * the basename of its [uri-path](#Uri.path)
	 */
	readonly name: string;

    /**
     * The id of this workspace page.
     */
    readonly id: string;
}

export interface IWorkspace {
    /**
	 * the unique identifier of the workspace.
	 */
	readonly id: string;

    /**
	 * Pages in the workspace.
	 */
	readonly pages: IWorkspacePage[];
}

export const IWorkspaceContextService = createDecorator<IWorkspaceContextService>('contextService');

export interface IWorkspaceContextService {

    readonly _serviceBrand: undefined;

	/**
	 * An event which fires on workbench state changes.
	 */
	readonly onDidChangeWorkbenchState: Event<WorkbenchState>;

	/**
	 * An event which fires on workspace name changes.
	 */
	readonly onDidChangeWorkspaceName: Event<void>;

    /**
	 * An event which fires on workspace folders change.
	 */
	readonly onDidChangeWorkspacePages: Event<void>;

    /**
	 * Provides access to the workspace object the window is running with.
	 * Use `getCompleteWorkspace` to get complete workspace object.
	 */
	getWorkspace(): IWorkspace;
}