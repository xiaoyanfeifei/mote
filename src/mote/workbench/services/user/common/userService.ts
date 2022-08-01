import { IUserProfile } from 'mote/platform/user/common/user';
import { IRemoteService, LoginData, UserLoginPayload, UserSignupPayload } from 'mote/workbench/services/remote/common/remote';
import { IUserService } from 'mote/workbench/services/user/common/user';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';

export class UserService implements IUserService {

	readonly _serviceBrand: undefined;

	private _currentProfile!: IUserProfile;
	get currentProfile(): IUserProfile { return this._currentProfile; }

	constructor(
		@IRemoteService private readonly remoteService: IRemoteService
	) {

	}

	public async signup(payload: UserSignupPayload): Promise<IUserProfile> {
		const loginData = await this.remoteService.signup(payload);
		if (loginData.token) {
			sessionStorage.setItem('auth_token', loginData.token);
		}
		return this.buildProfile(loginData);
	}

	public async login(payload: UserLoginPayload): Promise<IUserProfile> {
		const loginData = await this.remoteService.login(payload);
		if (loginData.token) {
			sessionStorage.setItem('auth_token', loginData.token);
		}
		return this.buildProfile(loginData);
	}

	public async checkUser(): Promise<IUserProfile> {
		const loginData = await this.remoteService.getUser('me');
		if (loginData.token) {
			sessionStorage.setItem('auth_token', loginData.token);
		}
		return this.buildProfile(loginData);
	}

	private buildProfile(data: LoginData): IUserProfile {
		const profile = {
			id: data.id,
			email: data.email,
			name: data.nickname || ''
		};
		this._currentProfile = profile;
		return profile;
	}
}

registerSingleton(IUserService, UserService);
