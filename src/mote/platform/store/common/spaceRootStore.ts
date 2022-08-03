import { RecordValue } from 'mote/platform/store/common/record';
import RecordCacheStore from 'mote/platform/store/common/recordCacheStore';
import RecordStore from 'mote/platform/store/common/recordStore';
import SpaceStore from 'mote/platform/store/common/spaceStore';
import { IStoreService } from 'mote/platform/store/common/store';


interface SpaceRootRecord extends RecordValue {
	spaces: string[];
}

export default class SpaceRootStore extends RecordStore<SpaceRootRecord> {

	constructor(
		userId: string,
		@IStoreService storeService: IStoreService,
		inMemoryRecordCacheStore?: RecordCacheStore,
	) {
		super({
			pointer: {
				id: userId,
				table: 'space_root'
			},
			userId,
			inMemoryRecordCacheStore,
		}, storeService);
	}

	getSpaceIds() {
		const record = this.getValue();
		return record && record.content || [];
	}

	getSpaceStores() {
		const spaceIds = this.getSpaceIds();
		const contentStore = this.getSpacesStore();
		return spaceIds.map(spaceId => SpaceStore.createChildStore(contentStore, {
			table: 'space',
			id: spaceId,
		}));
	}

	getSpacesStore() {
		return this.getPropertyStore('content');
	}

	override clone(): SpaceRootStore {
		return new SpaceRootStore(this.userId, this.storeService, this.inMemoryRecordCacheStore);
	}
}
