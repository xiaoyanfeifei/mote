import { Pointer, RecordWithRole } from "mote/editor/common/store/record";
import { Disposable } from "vs/base/common/lifecycle";
import { generateKey } from "../common/recordUtils";

type RecordState = {[key:string]: RecordWithRole};

interface UpdateRecordAction {
    transactionId?: string;
    pointer: Pointer;
    userId: string;
    force?: boolean;
    recordWithRole: RecordWithRole;
}

interface RetrieveRecordAction {
    pointer: Pointer;
    userId: string;
}

function getVersion(key: string, state: RecordState) {
    const recordWithRole = state[key];
    return recordWithRole && recordWithRole.value && recordWithRole.value.version ? recordWithRole.value.version : 0
}

function getRole(key: string, state: RecordState) {
    const recordWithRole = state[key];
    return recordWithRole && recordWithRole.role;
}

export class RecordService extends Disposable {

    private state: RecordState = {};

    public update(action: UpdateRecordAction): void {
        const { recordWithRole, force } = action;
        const key = generateKey(action.userId, action.pointer);
        const cachedVersion = getVersion(key, this.state);
        const cachedRole = getRole(key, this.state);
        if (force || !recordWithRole || !recordWithRole.value || recordWithRole.value.version > cachedVersion || cachedRole !== recordWithRole.role) {
            this.state[key] = recordWithRole;
        }
    }

    public retrieve(action: RetrieveRecordAction) {
        const key = generateKey(action.userId, action.pointer);
        return this.state[key];
    }
}