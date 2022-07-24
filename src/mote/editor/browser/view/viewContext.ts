import RecordStore from 'mote/editor/common/store/recordStore';

export class ViewContext {

	constructor(
		public readonly contentStore: RecordStore
	) {

	}
}
