import { RecordValue } from 'mote/editor/common/store/record';
import RecordStore from 'mote/editor/common/store/recordStore';
import SpaceStore from 'mote/editor/common/store/spaceStore';

interface SpaceRootRecord extends RecordValue {
	spaces: string[];
}

export default class SpaceRootStore extends RecordStore<SpaceRootRecord> {

	constructor(userId: string) {
		super({
			pointer: {
				id: userId,
				table: 'space_root'
			},
			userId: userId
		});
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
		return new SpaceRootStore(this.userId);
	}
}
