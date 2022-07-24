import { Registry } from 'vs/platform/registry/common/platform';
import { ColorExtensions, IColorRegistry } from 'mote/platform/theme/common/colorRegistry';
import { ThemedStyles } from 'mote/base/browser/ui/themes';

const colorRegistry = Registry.as<IColorRegistry>(ColorExtensions.ColorContribution);

//#region

export const foreground = colorRegistry.registerColor('foreground', { dark: '#CCCCCC', light: '#616161', hcDark: '#FFFFFF', hcLight: '#292929' }, 'Overall foreground color. This color is only used if not overridden by a component.');
export const regularTextColor = colorRegistry.registerColor('regularTextColor', { ...ThemedStyles.regularTextColor }, 'regularTextColor');
export const sidebarBackground = colorRegistry.registerColor('sidebarBackground', { ...ThemedStyles.sidebarBackground }, 'sidebarBackground');

//#endregion
