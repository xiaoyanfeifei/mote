import { IWorkspace, IWorkspaceContextService, WorkbenchState } from "mote/platform/workspace/common/workspace";
import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";

export class WorkspaceService extends Disposable implements IWorkspaceContextService {
    _serviceBrand: undefined;

    private readonly _onDidChangeWorkbenchState: Emitter<WorkbenchState> = this._register(new Emitter<WorkbenchState>());
    public readonly onDidChangeWorkbenchState: Event<WorkbenchState> = this._onDidChangeWorkbenchState.event;
    
    private readonly _onDidChangeWorkspaceName: Emitter<void> = this._register(new Emitter<void>());
    public readonly onDidChangeWorkspaceName: Event<void> = this._onDidChangeWorkspaceName.event;

    private readonly _onDidChangeWorkspacePages: Emitter<void> = this._register(new Emitter<void>());
    public readonly onDidChangeWorkspacePages: Event<void> = this._onDidChangeWorkspacePages.event;


    getWorkspace(): IWorkspace {
        throw new Error("Method not implemented.");
    }

    async initialize() {
        
    }

}