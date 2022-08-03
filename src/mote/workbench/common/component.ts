import { IThemeService, Themable } from 'mote/platform/theme/common/themeService';

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
