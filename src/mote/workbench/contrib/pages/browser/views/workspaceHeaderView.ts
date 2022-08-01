import * as nls from 'vs/nls';
import { registerIcon } from 'mote/platform/theme/common/iconRegistry';
import { Codicon } from 'vs/base/common/codicons';
import { ThemeIcon } from 'mote/platform/theme/common/themeService';
import { $, append } from 'vs/base/browser/dom';
import { Disposable } from 'vs/base/common/lifecycle';

const workspacesPickerIcon = registerIcon('workspace-picker', Codicon.foldDown, nls.localize('viewPaneContainerCollapsedIcon', 'Icon for a collapsed view pane container.'));


export class WorkspaceHeaderView extends Disposable {

	constructor() {
		super();
	}

	create(parent: HTMLElement, title: string) {
		const iconContainer = this.createIcon(title);
		const spaceContainer = this.createSpace(title);

		parent.appendChild(iconContainer);
		parent.appendChild(spaceContainer);
	}

	createSpace(title: string) {
		const spaceContainer = document.createElement('div');
		spaceContainer.style.display = 'flex';
		spaceContainer.style.justifyContent = 'center';
		spaceContainer.style.alignItems = 'center';

		const spaceName = document.createElement('div');
		spaceName.style.marginRight = '6px';
		spaceName.innerText = title;
		spaceContainer.appendChild(spaceName);

		append(spaceContainer, $(ThemeIcon.asCSSSelector(workspacesPickerIcon)));

		return spaceContainer;
	}

	createIcon(title: string) {
		const iconContainer = document.createElement('div');
		iconContainer.style.borderRadius = '3px';
		iconContainer.style.height = '18px';
		iconContainer.style.width = '18px';
		iconContainer.style.backgroundColor = 'rgb(137, 137, 137)';
		iconContainer.style.alignItems = 'center';
		iconContainer.style.justifyContent = 'center';
		iconContainer.style.display = 'flex';
		iconContainer.style.marginRight = '8px';

		const icon = document.createElement('div');
		icon.style.lineHeight = '1';
		icon.innerText = title[0];

		iconContainer.appendChild(icon);

		return iconContainer;
	}
}
