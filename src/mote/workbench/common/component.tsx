import { IThemeService, Themable } from "mote/platform/theme/common/themeService";
import { Disposable } from "vs/base/common/lifecycle";

export class Component extends Themable {
    constructor(
		private readonly id: string,
        themeService: IThemeService,
    ) {
        super(themeService);
    }

    getId(): string {
		return this.id;
	}
}