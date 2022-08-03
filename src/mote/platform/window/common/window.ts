import { IPartsSplash } from 'mote/platform/theme/common/themeService';
import { URI } from 'vs/base/common/uri';
import { ISandboxConfiguration } from 'vs/base/parts/sandbox/common/sandboxTypes';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';

export interface IWindowConfiguration {

}

export interface IOSConfiguration {
	readonly release: string;
	readonly hostname: string;
}

export interface IColorScheme {
	readonly dark: boolean;
	readonly highContrast: boolean;
}

export interface IOSConfiguration {
	readonly release: string;
	readonly hostname: string;
}

export interface INativeWindowConfiguration extends NativeParsedArgs, ISandboxConfiguration {
	mainPid: number;

	machineId?: string;

	homeDir: string;
	tmpDir: string;
	userDataDir: string;

	partsSplash?: IPartsSplash;

	fullscreen?: boolean;
	maximized?: boolean;
	accessibilitySupport?: boolean;
	colorScheme: IColorScheme;
	autoDetectHighContrast?: boolean;

	os: IOSConfiguration;
}

export interface IBaseWindowOpenable {
	label?: string;
}

export interface IWorkspaceToOpen extends IBaseWindowOpenable {
	readonly workspaceUri: URI;
}
