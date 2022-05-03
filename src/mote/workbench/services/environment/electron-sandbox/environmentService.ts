/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PerformanceMark } from 'vs/base/common/performance';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IColorScheme, INativeWindowConfiguration, IOSConfiguration, IPath, IPathsToWaitFor } from 'mote/platform/window/common/window';
import { IEnvironmentService, INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { refineServiceDecorator } from 'vs/platform/instantiation/common/instantiation';
import { AbstractNativeEnvironmentService } from 'vs/platform/environment/common/environmentService';
import { memoize } from 'vs/base/common/decorators';
import { URI } from 'vs/base/common/uri';
import { Schemas } from 'vs/base/common/network';
import { join } from 'vs/base/common/path';
import { IProductService } from 'vs/platform/product/common/productService';

export const INativeWorkbenchEnvironmentService = refineServiceDecorator<IEnvironmentService, INativeWorkbenchEnvironmentService>(IEnvironmentService);

/**
 * A subclass of the `IWorkbenchEnvironmentService` to be used only in native
 * environments (Windows, Linux, macOS) but not e.g. web.
 */
export interface INativeWorkbenchEnvironmentService extends IBrowserWorkbenchEnvironmentService, INativeEnvironmentService {

	// --- Window
	readonly window: {
		id: number;
		colorScheme: IColorScheme;
		maximized?: boolean;
		accessibilitySupport?: boolean;
		isInitialStartup?: boolean;
		isCodeCaching?: boolean;
		perfMarks: PerformanceMark[];
	};

	// --- Main
	readonly mainPid: number;
	readonly os: IOSConfiguration;
	readonly machineId: string;

	// --- Paths
	readonly execPath: string;
	readonly backupPath?: string;

	// --- Development
	readonly crashReporterDirectory?: string;
	readonly crashReporterId?: string;

	// --- Editors to --wait
	readonly filesToWait?: IPathsToWaitFor;
}

export class NativeWorkbenchEnvironmentService extends AbstractNativeEnvironmentService implements INativeWorkbenchEnvironmentService {

	@memoize
	get mainPid() { return this.configuration.mainPid; }

	@memoize
	get machineId() { return this.configuration.machineId!; }

	@memoize
	get remoteAuthority() { return null as any }

	@memoize
	get execPath() { return null as any }

	@memoize
	get backupPath() { return null as any }

	@memoize
	get window() {
		return {
			id: this.configuration.windowId,
			colorScheme: null as any,
			maximized: this.configuration.maximized,
			accessibilitySupport: this.configuration.accessibilitySupport,
			perfMarks: this.configuration.perfMarks,
			isInitialStartup: true,
			isCodeCaching: typeof this.configuration.codeCachePath === 'string'
		};
	}

	@memoize
	override get userRoamingDataHome(): URI { return this.appSettingsHome.with({ scheme: Schemas.userData }); }

	@memoize
	get logFile(): URI { return URI.file(join(this.logsPath, `renderer${this.configuration.windowId}.log`)); }

	@memoize
	get extHostLogsPath(): URI { return URI.file(join(this.logsPath, `exthost${this.configuration.windowId}`)); }

	@memoize
	get webviewExternalEndpoint(): string { return `${Schemas.vscodeWebview}://{{uuid}}`; }

	@memoize
	get skipReleaseNotes(): boolean { return !!this.args['skip-release-notes']; }

	@memoize
	get skipWelcome(): boolean { return !!this.args['skip-welcome']; }

	@memoize
	get logExtensionHostCommunication(): boolean { return !!this.args.logExtensionHostCommunication; }

	@memoize
	get extensionEnabledProposedApi(): string[] | undefined {
		if (Array.isArray(this.args['enable-proposed-api'])) {
			return this.args['enable-proposed-api'];
		}

		if ('enable-proposed-api' in this.args) {
			return [];
		}

		return undefined;
	}

	@memoize
	get os(): IOSConfiguration { return this.configuration.os; }

	@memoize
	get filesToOpenOrCreate(): IPath[] | undefined { return undefined }

	@memoize
	get filesToDiff(): IPath[] | undefined { return undefined; }

	@memoize
	get filesToWait(): IPathsToWaitFor | undefined { return undefined }

	constructor(
		private readonly configuration: INativeWindowConfiguration,
		productService: IProductService
	) {
		super(configuration, { homeDir: configuration.homeDir, tmpDir: configuration.tmpDir, userDataDir: configuration.userDataDir }, productService);
	}
}
