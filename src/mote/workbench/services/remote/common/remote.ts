import { Pointer, RecordWithRole } from 'mote/editor/common/store/record';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export const IRemoteService = createDecorator<IRemoteService>('remoteService');

export interface IRemoteService {
	getUser(userId: string): Promise<LoginData>;

	login(payload: UserLoginPayload): Promise<LoginData>;

	signup(payload: UserSignupPayload): Promise<LoginData>;

	syncRecordValue(userId: string, pointer: Pointer): Promise<RecordWithRole>;
}

//#region payload

export interface UserLoginPayload {
	username?: string;
	email?: string;
	password: string;
}

export interface UserSignupPayload {
	username?: string;
	email?: string;
	password: string;
}

//#endregion


export interface CaffeineResponse<T> {
	code: number;
	message: string;
	data: T;
}

export interface LoginData {
	id: string;
	username: string;
	nickname: string;
	email: string;
	token?: string;
}

export interface SyncRecordRequest {
	id: string;
	table: string;
	version: number;
}
