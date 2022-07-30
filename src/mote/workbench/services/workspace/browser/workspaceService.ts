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

export class WorkspaceService extends Disposable implements IWorkspaceContextService {
	_serviceBrand: undefined;

	private readonly _onDidChangeWorkbenchState: Emitter<WorkbenchState> = this._register(new Emitter<WorkbenchState>());
	public readonly onDidChangeWorkbenchState: Event<WorkbenchState> = this._onDidChangeWorkbenchState.event;

	private readonly _onDidChangeWorkspaceName: Emitter<void> = this._register(new Emitter<void>());
	public readonly onDidChangeWorkspaceName: Event<void> = this._onDidChangeWorkspaceName.event;

	private readonly _onDidChangeWorkspacePages: Emitter<void> = this._register(new Emitter<void>());
	public readonly onDidChangeWorkspacePages: Event<void> = this._onDidChangeWorkspacePages.event;

	private spaceRootStore: SpaceRootStore;

	constructor(
		private readonly userId: string,
		@IStorageService storageService: IStorageService,
		@ILogService logService: ILogService,
	) {
		super();

		RecordCacheStore.Default.storageService = storageService;
		RecordCacheStore.Default.logService = logService;
		this.spaceRootStore = new SpaceRootStore('local');
	}

	getSpaceStore(): SpaceStore {
		const spaceStores = this.spaceRootStore.getSpaceStores();
		if (spaceStores.length > 0) {
			return spaceStores[0];
		}

		// Generate a local space
		return this.createSpaceStore('local', 'Local Space');
	}

	getWorkspace(): IWorkspace {
		throw new Error('Method not implemented.');
	}

	async initialize() {

	}

	async createWorkspace() {

	}

	async deleteWorkspace() {

	}

	/**
	 * Todo move it to commands later....
	 * @param spaceName
	 * @returns
	 */
	private createSpaceStore(id: string, spaceName: string) {
		const transaction = Transaction.create(this.userId);
		let child = new SpaceStore({ table: 'space', id: id }, { userId: this.userId });
		EditOperation.addSetOperationForStore(child, { name: spaceName }, transaction);
		child = EditOperation.appendToParent(this.spaceRootStore.getSpacesStore(), child, transaction).child as SpaceStore;
		return child;
	}
}
