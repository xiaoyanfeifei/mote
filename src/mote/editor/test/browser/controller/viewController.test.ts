import * as assert from 'assert';
import { ViewController } from 'mote/editor/browser/view/viewController';
import { collectValueFromSegment } from 'mote/editor/common/segmentUtils';
import BlockStore from 'mote/platform/store/common/blockStore';
import { Pointer } from 'mote/platform/store/common/record';
import RecordCacheStore from 'mote/platform/store/common/recordCacheStore';
import RecordStore from 'mote/platform/store/common/recordStore';
import { IStoreService } from 'mote/platform/store/common/store';
import { StoreUtils } from 'mote/platform/store/common/storeUtils';


class TestStoreService implements IStoreService {
	addSubscription(userId: string, pointer: Pointer): void {
	}

}


const storeService = new TestStoreService();


suite('Editor Controller - View Controller Commands', () => {
	test('view controller type command', () => {
		const [viewController, contentStore] = createViewController();

		// enter to create fist child store
		viewController.enter();

		// move to first line
		let lineNumber = 0;

		// type on first child
		viewController.type('1');

		const lineStore = StoreUtils.createStoreForLineNumber(lineNumber, contentStore);
		assert.equal('1', collectValueFromSegment(lineStore.getTitleStore().getValue()));

		// move selection to doesn't exist line
		lineNumber++;
		const selection = viewController.getSelection();
		selection.lineNumber = lineNumber;
		viewController.select(selection);

		// type more character
		viewController.type('12');

		// nothing changed due to invalid line move
		assert.equal('1', collectValueFromSegment(lineStore.getTitleStore().getValue()));

	});
});

function createViewController(): [ViewController, RecordStore<string[]>] {
	const store = new BlockStore({ table: 'page', id: '1' }, '1', [], RecordCacheStore.Default, storeService);
	const contentStore = store.getContentStore();
	const viewController = new ViewController(contentStore);
	return [viewController, contentStore];
}
