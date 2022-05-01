import { IDisposable } from "vs/base/common/lifecycle";
import { INativeWindowConfiguration } from "mote/platform/window/common/window";

export interface IAppWindow extends IDisposable {
    
    load(config: INativeWindowConfiguration, options?: { isReload?: boolean }): void;
}