import * as nls from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { ColorDefaults, ColorExtensions, ColorIdentifier, IColorRegistry } from 'mote/platform/theme/common/colorRegistry';
import { ThemedStyles } from 'mote/base/common/themes';
import { Color } from 'vs/base/common/color';

const colorRegistry = Registry.as<IColorRegistry>(ColorExtensions.ColorContribution);

export function registerColor(id: string, defaults: ColorDefaults | null, description: string): ColorIdentifier {
	return colorRegistry.registerColor(id, migrateColorDefaults(defaults)!, description);
}

export const foreground = colorRegistry.registerColor('foreground', { dark: '#CCCCCC', light: '#616161', hcDark: '#FFFFFF', hcLight: '#292929' }, 'Overall foreground color. This color is only used if not overridden by a component.');
export const regularTextColor = colorRegistry.registerColor('text.regular.color', { dark: '#ffffffcf', light: '#37352f' }, 'regularTextColor');
export const mediumTextColor = colorRegistry.registerColor('text.medium.color', { dark: '#ffffffa6', light: '#37352fa6' }, 'regularTextColor');
export const lightTextColor = colorRegistry.registerColor('text.light.color', { dark: '#ffffff26', light: '#37352f26' }, '');
export const regularDividerColor = colorRegistry.registerColor('divider.regular.color', { light: '', dark: '' }, '');

export const sidebarBackground = colorRegistry.registerColor('sidebarBackground', { ...ThemedStyles.sidebarBackground }, 'sidebarBackground');

export const editorBackground = colorRegistry.registerColor('editor.background', { light: '#fffffe', dark: '#1E1E1E', hcDark: Color.black, hcLight: Color.white }, 'editor.background');

export const contextViewBackground = colorRegistry.registerColor('contextview.background', { light: '#ffffff', dark: '#303031' }, '');

export const listFocusBackground = registerColor('list.focusBackground', { dark: '#474c50', light: ThemedStyles.buttonHoveredBackground.light, hcDark: null, hcLight: null }, nls.localize('listFocusBackground', "List/Tree background color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));

export const inputBackground = registerColor('input.background', { dark: '', light: '#ffffff' }, '');

export const selectBackground = colorRegistry.registerColor('dropdown.background', { dark: '#3C3C3C', light: Color.white, hcDark: Color.black, hcLight: Color.white }, nls.localize('dropdownBackground', "Dropdown background."));
export const selectForeground = colorRegistry.registerColor('dropdown.foreground', { dark: '#F0F0F0', light: null, hcDark: Color.white, hcLight: foreground }, nls.localize('dropdownForeground', "Dropdown foreground."));

/**
 * Menu colors
 */
export const menuForeground = colorRegistry.registerColor('menu.foreground', { dark: selectForeground, light: foreground, hcDark: selectForeground, hcLight: selectForeground }, nls.localize('menuForeground', "Foreground color of menu items."));
export const menuBackground = colorRegistry.registerColor('menu.background', { dark: selectBackground, light: selectBackground, hcDark: selectBackground, hcLight: selectBackground }, nls.localize('menuBackground', "Background color of menu items."));


export const mediumIconColor = colorRegistry.registerColor('icon.medium.color', { light: '#37352f73', dark: '#ffffff71' }, 'mediumIconColor');
export const iconBackground = colorRegistry.registerColor('icon.background', { light: '#d0d0cf', dark: '#898989' }, '');

export const buttonHoverBackground = colorRegistry.registerColor('button.hoverBackground', { ...ThemedStyles.buttonHoveredBackground, }, 'buttonHoverBackground');
export const outlineButtonBorder = colorRegistry.registerColor('button.outline.border', { light: '#37352f29', dark: '' }, '');
//#region SidebarPart



//#endregion

function migrateColorDefaults(o: any): null | ColorDefaults {
	if (o === null) {
		return o;
	}
	if (typeof o.hcLight === 'undefined') {
		if (o.hcDark === null || typeof o.hcDark === 'string') {
			o.hcLight = o.hcDark;
		} else {
			o.hcLight = o.light;
		}
	}
	return o as ColorDefaults;
}
