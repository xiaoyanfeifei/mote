import { CSSProperties } from 'mote/base/browser/jsx/style';
import { Button } from 'mote/base/browser/ui/button/button';
import { IMenuLike } from 'mote/base/browser/ui/menu/menu';
import { ThemedStyles } from 'mote/base/common/themes';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { IWorkspaceContextService } from 'mote/platform/workspace/common/workspace';

interface ILayoutInfo {
	maxHeight: number;
	width: number;
	arrowSize: number;
	arrowOffset: number;
	inputHeight: number;
}

class PickerFooter {

	protected readonly domNode: HTMLDivElement;

	constructor(parent: HTMLElement,) {
		this.domNode = document.createElement('div');
		this.domNode.style.paddingTop = '6px';
		this.domNode.style.paddingBottom = '6px';
		this.domNode.style.boxShadow = 'rgb(255 255 255 / 9%) 0px -1px 0px';

		this.domNode.appendChild(this.createAction('Join or create workspace'));
		parent.append(this.domNode);
	}

	private createAction(name: string) {
		const container = document.createElement('div');

		const span = document.createElement('span');
		span.innerText = name;

		const actionContainer = document.createElement('div');
		actionContainer.style.minHeight = '28px';
		actionContainer.style.marginLeft = '12px';
		actionContainer.style.marginRight = '12px';
		actionContainer.style.alignItems = 'center';
		actionContainer.style.display = 'flex';
		actionContainer.appendChild(span);

		const btn = new Button(container, {
			style: {
				marginLeft: '4px',
				marginRight: '4px'
			}
		});
		btn.setChildren(actionContainer);
		return container;
	}
}

export class WorkspacesPicker extends Disposable implements IMenuLike {

	private _onDidBlur = this._register(new Emitter<void>());
	readonly onDidBlur = this._onDidBlur.event;

	private _onDidCancel = this._register(new Emitter<void>({ onFirstListenerAdd: () => this.cancelHasListener = true }));
	readonly onDidCancel = this._onDidCancel.event;
	private cancelHasListener = false;

	protected readonly domNode: HTMLDivElement;
	protected arrow!: HTMLDivElement;
	protected treeContainer!: HTMLDivElement;
	protected layoutInfo!: ILayoutInfo;

	constructor(
		parent: HTMLElement,
		@IWorkspaceContextService private readonly workspaceService: IWorkspaceContextService,
	) {
		super();

		this.domNode = document.createElement('div');
		parent.appendChild(this.domNode);

		const spaceStores = this.workspaceService.getSpaceStores();
		spaceStores.forEach((spaceStore) => {
			const spaceName = spaceStore.getSpaceName() || 'Untitled Space';
			this.renderWorkspace(this.domNode, spaceName);
		});

		new PickerFooter(this.domNode);
	}
	getContainer(): HTMLElement {
		return this.domNode;
	}

	private renderWorkspace(element: HTMLElement, title: string) {
		const container = document.createElement('div');
		container.style.display = 'flex';
		container.style.padding = '4px 14px';
		container.style.lineHeight = '120%';
		container.style.marginBottom = '1px';
		container.style.height = '48px';
		container.style.alignItems = 'center';

		container.appendChild(this.createIcon(title));
		container.appendChild(this.createWorkspaceDesc(title));


		const btn = new Button(element, { style: this.getButtonStyle() });
		btn.setChildren(container);
	}

	private createIcon(label: string) {
		const iconContainer = document.createElement('div');
		iconContainer.style.borderRadius = '3px';
		iconContainer.style.height = '32px';
		iconContainer.style.width = '32px';
		iconContainer.style.backgroundColor = 'rgb(137, 137, 137)';
		iconContainer.style.alignItems = 'center';
		iconContainer.style.justifyContent = 'center';
		iconContainer.style.display = 'flex';
		iconContainer.style.marginRight = '8px';

		const icon = document.createElement('div');
		icon.style.lineHeight = '1';
		icon.innerText = label[0];

		iconContainer.appendChild(icon);

		return iconContainer;
	}

	private createWorkspaceDesc(title: string) {
		const workspaceDesc = document.createElement('span');
		workspaceDesc.innerText = title;
		workspaceDesc.style.display = 'flex';
		workspaceDesc.style.alignItems = 'center';
		return workspaceDesc;
	}

	getBorderRight = () => {
		return {
			marginRight: 1,
			boxShadow: `1px 0 0 ${ThemedStyles.regularDividerColor.dark}`
		};
	};

	getButtonStyle = (): CSSProperties => {
		return Object.assign({
			display: 'flex',
			alignItems: 'center',
			padding: '0 8px',
			whiteSpace: 'nowrap' as any,
			height: '100%'
		}, this.getBorderRight());
	};
}
