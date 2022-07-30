import { IconContribution, IconDefinition } from 'mote/platform/theme/common/iconRegistry';
import { Codicon, CSSIcon } from 'vs/base/common/codicons';
import { Color } from 'vs/base/common/color';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ColorIdentifier } from './colorRegistry';
import { ColorScheme } from './theme';

export const IThemeService = createDecorator<IThemeService>('themeService');

export interface ThemeColor {
	id: string;
}

export namespace ThemeColor {
	export function isThemeColor(obj: any): obj is ThemeColor {
		return obj && typeof obj === 'object' && typeof (<ThemeColor>obj).id === 'string';
	}
}

export function themeColorFromId(id: ColorIdentifier) {
	return { id };
}

// theme icon
export interface ThemeIcon {
	readonly id: string;
	readonly color?: ThemeColor;
}

export namespace ThemeIcon {
	export function isThemeIcon(obj: any): obj is ThemeIcon {
		return obj && typeof obj === 'object' && typeof (<ThemeIcon>obj).id === 'string' && (typeof (<ThemeIcon>obj).color === 'undefined' || ThemeColor.isThemeColor((<ThemeIcon>obj).color));
	}

	const _regexFromString = new RegExp(`^\\$\\((${CSSIcon.iconNameExpression}(?:${CSSIcon.iconModifierExpression})?)\\)$`);

	export function fromString(str: string): ThemeIcon | undefined {
		const match = _regexFromString.exec(str);
		if (!match) {
			return undefined;
		}
		const [, name] = match;
		return { id: name };
	}

	export function fromId(id: string): ThemeIcon {
		return { id };
	}

	export function modify(icon: ThemeIcon, modifier: 'disabled' | 'spin' | undefined): ThemeIcon {
		let id = icon.id;
		const tildeIndex = id.lastIndexOf('~');
		if (tildeIndex !== -1) {
			id = id.substring(0, tildeIndex);
		}
		if (modifier) {
			id = `${id}~${modifier}`;
		}
		return { id };
	}

	export function getModifier(icon: ThemeIcon): string | undefined {
		const tildeIndex = icon.id.lastIndexOf('~');
		if (tildeIndex !== -1) {
			return icon.id.substring(tildeIndex + 1);
		}
		return undefined;
	}

	export function isEqual(ti1: ThemeIcon, ti2: ThemeIcon): boolean {
		return ti1.id === ti2.id && ti1.color?.id === ti2.color?.id;
	}

	export function asThemeIcon(codicon: Codicon, color?: string): ThemeIcon {
		return { id: codicon.id, color: color ? themeColorFromId(color) : undefined };
	}

	export const asClassNameArray: (icon: ThemeIcon) => string[] = CSSIcon.asClassNameArray;
	export const asClassName: (icon: ThemeIcon) => string = CSSIcon.asClassName;
	export const asCSSSelector: (icon: ThemeIcon) => string = CSSIcon.asCSSSelector;
}

export interface IColorTheme {

	readonly type: ColorScheme;

	readonly label: string;

	/**
	 * Resolves the color of the given color identifier. If the theme does not
	 * specify the color, the default color is returned unless <code>useDefault</code> is set to false.
	 * @param color the id of the color
	 * @param useDefault specifies if the default color should be used. If not set, the default is used.
	 */
	getColor(color: ColorIdentifier, useDefault?: boolean): Color | undefined;

	/**
	 * Returns whether the theme defines a value for the color. If not, that means the
	 * default color will be used.
	 */
	defines(color: ColorIdentifier): boolean;

	/**
	 * Returns the token style for a given classification. The result uses the <code>MetadataConsts</code> format
	 */
	//getTokenStyleMetadata(type: string, modifiers: string[], modelLanguage: string): ITokenStyle | undefined;

	/**
	 * Defines whether semantic highlighting should be enabled for the theme.
	 */
	readonly semanticHighlighting: boolean;
}


export interface IProductIconTheme {
	/**
	 * Resolves the definition for the given icon as defined by the theme.
	 *
	 * @param iconContribution The icon
	 */
	getIcon(iconContribution: IconContribution): IconDefinition | undefined;
}

export interface IThemeService {
	readonly _serviceBrand: undefined;

	getColorTheme(): IColorTheme;

	readonly onDidColorThemeChange: Event<IColorTheme>;

	getProductIconTheme(): IProductIconTheme;

	readonly onDidProductIconThemeChange: Event<IProductIconTheme>;
}


/**
 * Utility base class for all themable components.
 */
export class Themable extends Disposable {
	protected theme: IColorTheme;

	constructor(
		protected themeService: IThemeService
	) {
		super();

		this.theme = themeService.getColorTheme();

		// Hook up to theme changes
		this._register(this.themeService.onDidColorThemeChange(theme => this.onThemeChange(theme)));
	}

	protected onThemeChange(theme: IColorTheme): void {
		this.theme = theme;

		this.updateStyles();
	}

	protected updateStyles(): void {
		// Subclasses to override
	}

	protected getColor(id: string, modify?: (color: Color, theme: IColorTheme) => Color): string | null {
		let color = this.theme.getColor(id);

		if (color && modify) {
			color = modify(color, this.theme);
		}

		return color ? color.toString() : null;
	}
}

export interface IPartsSplash {
	baseTheme: string;
	colorInfo: {
		background: string;
		foreground: string | undefined;
		editorBackground: string | undefined;
		titleBarBackground: string | undefined;
		activityBarBackground: string | undefined;
		sideBarBackground: string | undefined;
		statusBarBackground: string | undefined;
		statusBarNoFolderBackground: string | undefined;
		windowBorder: string | undefined;
	};
	layoutInfo: {
		sideBarSide: string;
		editorPartMinWidth: number;
		titleBarHeight: number;
		activityBarWidth: number;
		sideBarWidth: number;
		statusBarHeight: number;
		windowBorder: boolean;
		windowBorderRadius: string | undefined;
	} | undefined;
}
