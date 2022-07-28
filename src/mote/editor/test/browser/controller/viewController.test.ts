import * as assert from 'assert';
import { ViewController } from 'mote/editor/browser/view/viewController';
import { collectValueFromSegment } from 'mote/editor/common/segmentUtils';
import BlockStore from 'mote/editor/common/store/blockStore';
import RecordCacheStore from 'mote/editor/common/store/recordCacheStore';
import RecordStore from 'mote/editor/common/store/recordStore';
import { StoreUtils } from 'mote/editor/common/store/storeUtils';
import { ILogService, LogLevel } from 'vs/platform/log/common/log';
import { InMemoryStorageService, WillSaveStateReason } from 'vs/platform/storage/common/storage';
import { Event } from 'vs/base/common/event';

class TestStorageService extends InMemoryStorageService {

	override emitWillSaveState(reason: WillSaveStateReason): void {
		super.emitWillSaveState(reason);
	}
}

class TestLogService implements ILogService {
	_serviceBrand: undefined;
	onDidChangeLogLevel: Event<LogLevel> = null as any;
	getLevel(): LogLevel {
		throw new Error('Method not implemented.');
	}
	setLevel(level: LogLevel): void {
		throw new Error('Method not implemented.');
	}
	trace(message: string, ...args: any[]): void {

	}
	debug(message: string, ...args: any[]): void {

	}
	info(message: string, ...args: any[]): void {

	}
	warn(message: string, ...args: any[]): void {
		throw new Error('Method not implemented.');
	}
	error(message: string | Error, ...args: any[]): void {
		throw new Error('Method not implemented.');
	}
	critical(message: string | Error, ...args: any[]): void {
		throw new Error('Method not implemented.');
	}
	flush(): void {
		throw new Error('Method not implemented.');
	}
	dispose(): void {
		throw new Error('Method not implemented.');
	}

}

RecordCacheStore.Default.storageService = new TestStorageService();
RecordCacheStore.Default.logService = new TestLogService();

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
	const store = new BlockStore({ table: 'page', id: '1' }, '1');
	const contentStore = store.getContentStore();
	const viewController = new ViewController(contentStore);
	return [viewController, contentStore];
}
