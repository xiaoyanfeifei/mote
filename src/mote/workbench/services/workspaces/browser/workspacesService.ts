import { Transaction } from 'mote/editor/common/core/transaction';
import RecordCacheStore from 'mote/editor/common/store/recordCacheStore';
import SpaceRootStore from 'mote/editor/common/store/spaceRootStore';
import SpaceStore from 'mote/editor/common/store/spaceStore';
import { IWorkspace, IWorkspaceContextService, WorkbenchState } from 'mote/platform/workspace/common/workspace';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { EditOperation } from 'mote/editor/common/core/editOperation';
import { generateUuid } from 'vs/base/common/uuid';
import { Lodash } from 'mote/base/common/lodash';
import { IRemoteService } from 'mote/workbench/services/remote/common/remote';
import { IUserService } from 'mote/workbench/services/user/common/user';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import Severity from 'vs/base/common/severity';
import { localize } from 'vs/nls';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IEditorService } from 'mote/workbench/services/editor/common/editorService';
import { LoginInput } from 'mote/workbench/contrib/login/browser/loginInput';
import { IUserProfile } from 'mote/platform/user/common/user';

export class WorkspaceService extends Disposable implements IWorkspaceContextService {
	_serviceBrand: undefined;

	private readonly _onDidChangeWorkbenchState: Emitter<WorkbenchState> = this._register(new Emitter<WorkbenchState>());
	public readonly onDidChangeWorkbenchState: Event<WorkbenchState> = this._onDidChangeWorkbenchState.event;

	private readonly _onDidChangeWorkspaceName: Emitter<void> = this._register(new Emitter<void>());
	public readonly onDidChangeWorkspaceName: Event<void> = this._onDidChangeWorkspaceName.event;

	private readonly _onDidChangeWorkspacePages: Emitter<void> = this._register(new Emitter<void>());
	public readonly onDidChangeWorkspacePages: Event<void> = this._onDidChangeWorkspacePages.event;

	private readonly _onDidChangeWorkspace: Emitter<void> = this._register(new Emitter<void>());
	public readonly onDidChangeWorkspace: Event<void> = this._onDidChangeWorkspace.event;

	/**
	 * Support multiple user in same time
	 */
	private spaceRootStores: SpaceRootStore[];
	private currentSpaceId!: string;

	constructor(
		@IStorageService storageService: IStorageService,
		@ILogService logService: ILogService,
		@IRemoteService remoteService: IRemoteService,
		@IUserService private readonly userService: IUserService,
		@IDialogService private readonly dialogService: IDialogService,
		@IEditorService private readonly editorService: IEditorService,
	) {
		super();

		const userId = userService.currentProfile ? userService.currentProfile.id : 'local';

		RecordCacheStore.Default.storageService = storageService;
		RecordCacheStore.Default.logService = logService;
		RecordCacheStore.Default.remoteService = remoteService;

		this.spaceRootStores = [];

		this._register(userService.onDidChangeCurrentProfile((profile) => this.onProfileChange(profile)));

		if (!userService.currentProfile) {
			editorService.openEditor(new LoginInput());
			return;
		}

		const userIdSet = [userService.currentProfile.id, 'local'];

		userIdSet.forEach((userId) => {
			const spaceRootStore = new SpaceRootStore(userId);
			this._register(spaceRootStore.onDidChange(() => {
				this._onDidChangeWorkspace.fire();
			}));
			this.spaceRootStores.push(spaceRootStore);
		});
	}

	onProfileChange(profile: IUserProfile | undefined) {
		if (!profile) {
			this.spaceRootStores = [];
			this.editorService.openEditor(new LoginInput());
			this._onDidChangeWorkspace.fire();
			return;
		}
		const spaceRootStore = new SpaceRootStore(profile.id);
		this._register(spaceRootStore.onDidChange(() => {
			this._onDidChangeWorkspace.fire();
		}));
		this.spaceRootStores.push(spaceRootStore);
		this._onDidChangeWorkspace.fire();
	}

	getSpaceStores(): SpaceStore[] {
		return this.spaceRootStores.flatMap(store => store.getSpaceStores());
	}

	getSpaceStore(): SpaceStore | undefined {
		const spaceStores = this.getSpaceStores();
		if (spaceStores.length > 0) {
			if (this.currentSpaceId) {
				const idx = Lodash.findIndex(spaceStores, (store) => store.id === this.currentSpaceId);
				if (idx >= 0) {
					return spaceStores[idx];
				}
			}
			return spaceStores[0];
		}
		return undefined;
	}

	enterWorkspace(spaceId: string) {
		this.currentSpaceId = spaceId;
		this._onDidChangeWorkspace.fire();
	}

	getWorkspace(): IWorkspace {
		throw new Error('Method not implemented.');
	}

	async initialize() {

	}

	async createWorkspace(userId: string, spaceName: string) {

		console.log(this.userService.currentProfile);
		const spaceId = generateUuid();
		this.createSpaceStore(userId, spaceId, spaceName || 'Untitled Space');
	}

	async deleteWorkspace() {

	}

	/**
	 * Todo move it to commands later....
	 * @param spaceName
	 * @returns
	 */
	private async createSpaceStore(userId: string, spaceId: string, spaceName: string) {
		const spaceRootStore = new SpaceRootStore(userId);
		const transaction = Transaction.create(userId);
		let child = new SpaceStore({ table: 'space', id: spaceId }, { userId: userId });
		EditOperation.addSetOperationForStore(child, { name: spaceName }, transaction);
		child = EditOperation.appendToParent(spaceRootStore.getSpacesStore(), child, transaction).child as SpaceStore;
		this.currentSpaceId = spaceId;
		await transaction.commit();
		this._onDidChangeWorkspace.fire();
		return child;
	}
}

registerSingleton(IWorkspaceContextService, WorkspaceService);
