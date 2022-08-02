import { Event } from 'vs/base/common/event';
import { IUserProfile } from 'mote/platform/user/common/user';
import { UserLoginPayload, UserSignupPayload } from 'mote/workbench/services/remote/common/remote';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export const IUserService = createDecorator<IUserService>('IUserService');
export interface IUserService {

	readonly _serviceBrand: undefined;

	readonly currentProfile: IUserProfile | undefined;

	readonly onDidChangeCurrentProfile: Event<IUserProfile | undefined>;

	logout(): Promise<void>;

	login(payload: UserLoginPayload): Promise<IUserProfile>;

	signup(payload: UserSignupPayload): Promise<IUserProfile>;

	loginOrRegister(): void;
}
