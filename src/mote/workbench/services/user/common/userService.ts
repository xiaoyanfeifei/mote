import { IUserProfile } from 'mote/platform/user/common/user';
import { IRemoteService, LoginData, UserLoginPayload, UserSignupPayload } from 'mote/workbench/services/remote/common/remote';
import { IUserService } from 'mote/workbench/services/user/common/user';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IStorageService, StorageScope, StorageTarget } from 'vs/platform/storage/common/storage';

export class UserService implements IUserService {

	private static STORAGE_KEY = 'userProfile';

	readonly _serviceBrand: undefined;

	private _currentProfile!: IUserProfile;
	get currentProfile(): IUserProfile { return this._currentProfile; }

	constructor(
		@IStorageService private readonly storageService: IStorageService,
		@IRemoteService private readonly remoteService: IRemoteService
	) {
		const profile = this.storageService.get(UserService.STORAGE_KEY, StorageScope.APPLICATION);
		if (profile) {
			this._currentProfile = JSON.parse(profile);
		}
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
		this.storageService.store(UserService.STORAGE_KEY, JSON.stringify(profile), StorageScope.APPLICATION, StorageTarget.USER);
		return profile;
	}
}
