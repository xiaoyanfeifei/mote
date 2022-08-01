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
		userId: string,
		@IStorageService storageService: IStorageService,
		@ILogService logService: ILogService,
		@IRemoteService remoteService: IRemoteService,
	) {
		super();

		RecordCacheStore.Default.storageService = storageService;
		RecordCacheStore.Default.logService = logService;
		RecordCacheStore.Default.remoteService = remoteService;

		this.spaceRootStores = [];
		if (userId !== 'local') {
			const spaceRootStore = new SpaceRootStore(userId);
			this._register(spaceRootStore.onDidChange(() => {
				this._onDidChangeWorkspace.fire();
			}));
			this.spaceRootStores.push(spaceRootStore);
		}
		this.spaceRootStores.push(new SpaceRootStore('local'));
	}

	getSpaceStores(): SpaceStore[] {
		return this.spaceRootStores.flatMap(store => store.getSpaceStores());
	}

	getSpaceStore(): SpaceStore {
		const spaceStores = this.getSpaceStores();
		if (spaceStores.length > 0) {
			if (this.currentSpaceId) {
				const idx = Lodash.findIndex(spaceStores, (store) => store.id === this.currentSpaceId);
				return spaceStores[idx];
			}
			return spaceStores[0];
		}

		// Generate a local space
		return this.createSpaceStore('local', 'local', 'Local Space');
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

	async createWorkspace(userId: string) {
		const id = generateUuid();
		this.createSpaceStore(userId, id, 'Untitled Space');
	}

	async deleteWorkspace() {

	}

	/**
	 * Todo move it to commands later....
	 * @param spaceName
	 * @returns
	 */
	private createSpaceStore(userId: string, spaceId: string, spaceName: string) {
		const spaceRootStore = new SpaceRootStore(userId);
		const transaction = Transaction.create(userId);
		let child = new SpaceStore({ table: 'space', id: spaceId }, { userId: userId });
		EditOperation.addSetOperationForStore(child, { name: spaceName }, transaction);
		child = EditOperation.appendToParent(spaceRootStore.getSpacesStore(), child, transaction).child as SpaceStore;
		this.currentSpaceId = spaceId;
		this._onDidChangeWorkspace.fire();
		transaction.commit();
		return child;
	}
}
