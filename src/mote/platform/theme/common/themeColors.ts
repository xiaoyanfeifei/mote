import * as nls from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { ColorExtensions, IColorRegistry } from 'mote/platform/theme/common/colorRegistry';
import { ThemedStyles } from 'mote/base/common/themes';
import { Color } from 'vs/base/common/color';

const colorRegistry = Registry.as<IColorRegistry>(ColorExtensions.ColorContribution);

//#region

export const foreground = colorRegistry.registerColor('foreground', { dark: '#CCCCCC', light: '#616161', hcDark: '#FFFFFF', hcLight: '#292929' }, 'Overall foreground color. This color is only used if not overridden by a component.');
export const regularTextColor = colorRegistry.registerColor('regularTextColor', { ...ThemedStyles.regularTextColor }, 'regularTextColor');
export const sidebarBackground = colorRegistry.registerColor('sidebarBackground', { ...ThemedStyles.sidebarBackground }, 'sidebarBackground');


export const selectBackground = colorRegistry.registerColor('dropdown.background', { dark: '#3C3C3C', light: Color.white, hcDark: Color.black, hcLight: Color.white }, nls.localize('dropdownBackground', "Dropdown background."));
export const selectForeground = colorRegistry.registerColor('dropdown.foreground', { dark: '#F0F0F0', light: null, hcDark: Color.white, hcLight: foreground }, nls.localize('dropdownForeground', "Dropdown foreground."));

/**
 * Menu colors
 */
export const menuForeground = colorRegistry.registerColor('menu.foreground', { dark: selectForeground, light: foreground, hcDark: selectForeground, hcLight: selectForeground }, nls.localize('menuForeground', "Foreground color of menu items."));
export const menuBackground = colorRegistry.registerColor('menu.background', { dark: selectBackground, light: selectBackground, hcDark: selectBackground, hcLight: selectBackground }, nls.localize('menuBackground', "Background color of menu items."));


//#endregion
