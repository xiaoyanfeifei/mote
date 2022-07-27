import { ColorScheme } from 'mote/platform/theme/common/theme';
import { IColorTheme, IThemeService } from 'mote/platform/theme/common/themeService';
import { Event, Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IHostColorSchemeService } from 'mote/platform/theme/common/hostColorSchemeService';

export class BrowserThemeService extends Disposable implements IThemeService {

	declare _serviceBrand: undefined;

	private readonly _onDidColorThemeChange: Emitter<IColorTheme> = this._register(new Emitter<IColorTheme>());
	onDidColorThemeChange: Event<IColorTheme> = this._onDidColorThemeChange.event;

	private currentColorTheme!: IColorTheme;

	private colorThemeRegistry: Map<ColorScheme, IColorTheme>;

	constructor(
		@IHostColorSchemeService private readonly hostColorSchemeService: IHostColorSchemeService,
	) {
		super();
		this.colorThemeRegistry = new Map();
		this.hostColorSchemeService.onDidChangeColorScheme(() => this.handlePreferredSchemeUpdated());
	}

	private installPreferredSchemeListener() {
		this.hostColorSchemeService.onDidChangeColorScheme(() => this.handlePreferredSchemeUpdated());
	}

	private handlePreferredSchemeUpdated() {
		const scheme = this.getPreferredColorScheme();
		return this.applyPreferredColorTheme(scheme);
	}

	private getPreferredColorScheme(): ColorScheme {
		if (this.hostColorSchemeService.highContrast) {
			return this.hostColorSchemeService.dark ? ColorScheme.HIGH_CONTRAST_DARK : ColorScheme.HIGH_CONTRAST_LIGHT;
		}

		return this.hostColorSchemeService.dark ? ColorScheme.DARK : ColorScheme.LIGHT;
	}

	private async applyPreferredColorTheme(type: ColorScheme) {
		this.currentColorTheme = this.colorThemeRegistry.get(type)!;
	}


	getColorTheme(): IColorTheme {
		return this.currentColorTheme;
	}

}

