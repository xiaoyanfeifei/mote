import { IMenuLike } from 'mote/base/browser/ui/menu/menu';
import { IContextViewService } from 'mote/platform/contextview/browser/contextView';
import { BrowserContextViewBasedService } from 'mote/platform/contextview/browser/contextViewBasedService';
import { IWorkspaceContextService } from 'mote/platform/workspace/common/workspace';
import { WorkspaceHeaderView } from 'mote/workbench/contrib/pages/browser/views/workspaceHeaderView';
import { WorkspacesPicker } from 'mote/workbench/contrib/pages/browser/views/workspacesPicker';
import { addDisposableListener, EventType } from 'vs/base/browser/dom';
import { Gesture, EventType as TouchEventType } from 'vs/base/browser/touch';
import { IMenuOptions } from 'vs/base/browser/ui/menu/menu';
import { IAction, Separator } from 'vs/base/common/actions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

export class WorkspacesController extends BrowserContextViewBasedService {

	static readonly HEIGHT = 45;

	private headerView: WorkspaceHeaderView;

	constructor(
		private readonly container: HTMLElement,
		@IContextViewService contextViewService: IContextViewService,
		@IWorkspaceContextService private readonly workspaceService: IWorkspaceContextService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super(null as any, contextViewService);

		container.style.height = '45px';
		container.style.alignItems = 'center';
		container.style.display = 'flex';
		container.style.cursor = 'pointer';

		this.headerView = new WorkspaceHeaderView();
		this.headerView.create(container, this.getTitle());

		this._register(Gesture.addTarget(container));

		[EventType.CLICK, TouchEventType.Tap].forEach(eventType => {
			this._register(addDisposableListener(container, eventType, e => this.onDidClick()));
		});
		this.configure({ blockMouse: false });
	}

	createMenu(container: HTMLElement, actions: readonly IAction[], options: IMenuOptions): IMenuLike {
		return new WorkspacesPicker(container, this.workspaceService);
	}

	onDidClick() {
		this.showContextMenu({
			getActions: () => [new Separator()],
			getAnchor: () => this.container
		});
	}

	getTitle() {
		const spaceStore = this.workspaceService.getSpaceStore();
		return spaceStore.getSpaceName() || 'Untitled Space';
	}
}
