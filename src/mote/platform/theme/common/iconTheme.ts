import { getIconRegistry, IconContribution, IconDefinition } from 'mote/platform/theme/common/iconRegistry';
import { IProductIconTheme, ThemeIcon } from 'mote/platform/theme/common/themeService';


export class IconTheme implements IProductIconTheme {

	getIcon(iconContribution: IconContribution): IconDefinition | undefined {
		const iconRegistry = getIconRegistry();
		let definition = iconContribution.defaults;
		while (ThemeIcon.isThemeIcon(definition)) {
			const c = iconRegistry.getIcon(definition.id);
			if (!c) {
				return undefined;
			}
			definition = c.defaults;
		}
		return definition;
	}

}
