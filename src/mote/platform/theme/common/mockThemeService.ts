import { Color } from "vs/base/common/color";
import { Emitter, Event } from "vs/base/common/event";
import { ColorScheme } from "./theme";
import { IColorTheme, IThemeService } from "./themeService";

export class MockColorTheme implements IColorTheme {

	public readonly label = 'test';

	constructor(
		private colors: { [id: string]: string } = {},
		public type = ColorScheme.DARK,
		public readonly semanticHighlighting = false
	) { }

	getColor(color: string, useDefault?: boolean): Color | undefined {
		let value = this.colors[color];
		if (value) {
			return Color.fromHex(value);
		}
		return undefined;
	}

	defines(color: string): boolean {
		throw new Error('Method not implemented.');
	}

	get tokenColorMap(): string[] {
		return [];
	}
}

export class MockThemeService implements IThemeService {

	declare readonly _serviceBrand: undefined;
	_colorTheme: IColorTheme;
	_onThemeChange = new Emitter<IColorTheme>();

	constructor(theme = new MockColorTheme()) {
		this._colorTheme = theme;
	}

	getColorTheme(): IColorTheme {
		return this._colorTheme;
	}

	setTheme(theme: IColorTheme) {
		this._colorTheme = theme;
		this.fireThemeChange();
	}

	fireThemeChange() {
		this._onThemeChange.fire(this._colorTheme);
	}

	public get onDidColorThemeChange(): Event<IColorTheme> {
		return this._onThemeChange.event;
	}
}
