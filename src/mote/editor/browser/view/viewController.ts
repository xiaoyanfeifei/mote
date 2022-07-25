import * as viewEvents from 'mote/editor/common/viewEvents';
import { TextSelection, TextSelectionMode } from 'mote/editor/common/core/selectionUtils';
import { Transaction } from 'mote/editor/common/core/transaction';
import BlockStore from 'mote/editor/common/store/blockStore';
import RecordStore from 'mote/editor/common/store/recordStore';
import * as segmentUtils from 'mote/editor/common/segmentUtils';
import { ViewEventDispatcher, ViewEventsCollector } from 'mote/editor/common/viewEventDispatcher';
import { textChange } from 'mote/editor/common/core/textChange';
import { collectValueFromSegment, ISegment } from 'mote/editor/common/segmentUtils';
import { EditOperation } from 'mote/editor/common/core/editOperation';
import { DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT } from 'mote/editor/common/diffMatchPatch';
import { Lodash } from 'mote/base/common/lodash';
import { ViewEventHandler } from 'mote/editor/common/viewEventHandler';
import blockTypes, { pureTextTypes, textBasedTypes } from 'mote/editor/common/blockTypes';

export interface ICommandDelegate {
	type(text: string): void;
	compositionType(text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number): void;
}

export class ViewController {
	private selection: TextSelection;
	private readonly eventDispatcher: ViewEventDispatcher;

	constructor(
		private readonly contentStore: RecordStore,
		private readonly commandDelegate: ICommandDelegate,
	) {
		this.selection = { startIndex: -1, endIndex: -1, lineNumber: -1 };
		this.eventDispatcher = new ViewEventDispatcher();
	}

	public addViewEventHandler(eventHandler: ViewEventHandler): void {
		this.eventDispatcher.addViewEventHandler(eventHandler);
	}

	public removeViewEventHandler(eventHandler: ViewEventHandler): void {
		this.eventDispatcher.removeViewEventHandler(eventHandler);
	}

	//#region command

	public type(text: string): void {
		this.executeCursorEdit(eventsCollector => {
			Transaction.createAndCommit((transaction) => {
				const store = this.createStoreForLineNumber(this.selection.lineNumber!);
				this.onType(store.getTitleStore(), transaction, this.selection, text);
			}, this.contentStore.userId);
		});
	}

	public compositionType(text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number): void {
		this.executeCursorEdit(eventsCollector => {
			Transaction.createAndCommit((transaction) => {
				const store = this.createStoreForLineNumber(this.selection.lineNumber!);
				this.onType(store.getTitleStore(), transaction, this.selection, text);
			}, this.contentStore.userId);
		});
	}

	public backspace() {
		this.executeCursorEdit(eventsCollector => {
			Transaction.createAndCommit((transaction) => {
				const store = this.createStoreForLineNumber(this.selection.lineNumber!);
				this.onBackspace(eventsCollector, store.getTitleStore(), transaction, this.selection);
			}, this.contentStore.userId);
		});
	}

	public enter() {
		this.executeCursorEdit(eventsCollector => {
			Transaction.createAndCommit((transaction) => {
				let child: BlockStore = EditOperation.createBlockStore('text', transaction);
				let lineNumber: number;
				// create first child
				if (this.selection.lineNumber < 0) {
					child = EditOperation.appendToParent(this.contentStore, child, transaction).child as BlockStore;
					lineNumber = 0;
				} else {
					const lineStore = this.createStoreForLineNumber(this.selection.lineNumber!);
					child = EditOperation.insertChildAfterTarget(
						this.contentStore, child, lineStore, transaction).child as BlockStore;
					lineNumber = this.getLineNumberForStore(child);
				}
				// emit the line change event
				eventsCollector.emitViewEvent(new viewEvents.ViewLinesInsertedEvent(lineNumber, lineNumber));
				this.setSelection({ startIndex: 0, endIndex: 0, lineNumber: lineNumber });
			}, this.contentStore.userId);
		});
	}

	//#endregion

	public setSelection(selection: TextSelection) {
		this.selection = Object.assign({}, this.selection);
		this.selection.startIndex = selection.startIndex;
		this.selection.endIndex = selection.endIndex;
		this.selection.lineNumber = selection.lineNumber ?? this.selection.lineNumber;
	}

	public getSelection() {
		return this.selection;
	}

	public isEmpty(lineNumber: number) {
		const value: any[] = this.createStoreForLineNumber(lineNumber).getTitleStore().getValue() || [];
		return value.length === 0;
	}

	private executeCursorEdit(callback: (eventsCollector: ViewEventsCollector) => void) {
		// TODO is readonly ?
		this.withViewEventsCollector(callback);
	}

	private withViewEventsCollector<T>(callback: (eventsCollector: ViewEventsCollector) => T): T {
		try {
			const eventsCollector = this.eventDispatcher.beginEmitViewEvents();
			return callback(eventsCollector);
		} finally {
			this.eventDispatcher.endEmitViewEvents();
		}
	}

	//#region line handle

	/**
	 *
	 * @param eventsCollector
	 * @param store titleStore
	 * @param transaction
	 * @param selection
	 */
	private onBackspace(eventsCollector: ViewEventsCollector, store: RecordStore, transaction: Transaction, selection: TextSelection) {
		const blockStore = getParentBlockStore(store);
		if (blockStore) {
			const record = blockStore.getValue();
			if (record) {
				if (textBasedTypes.has(record.type)) {
					EditOperation.turnInto(blockStore, blockTypes.text as any, transaction);
				} else if (pureTextTypes.has(record.type)) {
					EditOperation.removeChild(this.contentStore, store, transaction);
					const deletedLineNumber = this.selection.lineNumber;
					const newLineNumber = this.selection.lineNumber - 1;
					if (this.selection.lineNumber > 0) {
						const prevStore = this.createStoreForLineNumber(newLineNumber);
						const content = collectValueFromSegment(prevStore.getTitleStore().getValue());
						this.setSelection({ startIndex: content.length, endIndex: content.length, lineNumber: newLineNumber });
					} else {
						this.setSelection({ startIndex: 0, endIndex: 0, lineNumber: newLineNumber });
					}
					eventsCollector.emitViewEvent(new viewEvents.ViewLinesDeletedEvent(deletedLineNumber, deletedLineNumber));
				}
			}
		}
	}

	private onType(store: RecordStore, transaction: Transaction, selection: TextSelection, newValue: string) {
		const oldRecord = store.getValue();
		const content = segmentUtils.collectValueFromSegment(oldRecord);
		const diffResult = textChange(selection, content, newValue);

		let needChange = false;
		let startIndex = 0;
		let deleteFlag = false;

		for (const [op, txt] of diffResult) {
			switch (op) {
				case DIFF_INSERT:
					needChange = true;
					this.insert(
						txt,
						transaction,
						store,
						{
							startIndex: startIndex,
							endIndex: startIndex,
							lineNumber: selection.lineNumber
						},
						TextSelectionMode.Editing
					);
					startIndex += txt.length;
					break;
				case DIFF_DELETE:
					needChange = true;
					deleteFlag = false;
					this.delete(
						transaction,
						store,
						{
							startIndex: startIndex,
							endIndex: startIndex + txt.length,
							lineNumber: selection.lineNumber
						},
						TextSelectionMode.Editing
					);
					break;
				default:
					if (DIFF_EQUAL === op) {
						startIndex += txt.length;
					}
			}
		}
	}

	private onEnter(transaction: Transaction, store: BlockStore) {
		let parentStore: BlockStore;
		if ('page' === store.table) {
			parentStore = store.recordStoreParentStore as BlockStore;
		} else {
			const titleStore = store.recordStoreParentStore;
			parentStore = titleStore?.recordStoreParentStore as BlockStore;
		}

		this.delete(transaction, store, this.selection, TextSelectionMode.Editing);
		let newLineStore = EditOperation.createBlockStore('text', transaction);

		newLineStore = EditOperation.insertChildAfterTarget(
			parentStore.getContentStore(), newLineStore, store, transaction).child as BlockStore;
		const lineNumber = this.getLineNumberForStore(newLineStore);
		this.setSelection({ startIndex: 0, endIndex: 0, lineNumber: lineNumber });
	}

	public insert(content: string, transaction: Transaction, store: RecordStore, selection: TextSelection, selectionMode: TextSelectionMode) {
		const userId = transaction.userId;
		if (TextSelectionMode.Editing !== selectionMode) {
			return;
		}

		this.delete(transaction, store, selection, selectionMode);

		if (content.length > 0) {
			const segment = segmentUtils.combineArray(content, []) as ISegment;

			const storeValue = store.getValue();

			const newSelection: TextSelection = {
				startIndex: selection.startIndex + content.length,
				endIndex: selection.endIndex + content.length,
				lineNumber: selection.lineNumber
			};

			this.setSelection(newSelection);

			EditOperation.addSetOperationForStore(
				store,
				segmentUtils.merge(storeValue, [segment], selection.startIndex),
				transaction
			);

			/*
			transaction.postSubmitActions.push(() => {
				const transaction = Transaction.create(userId);
				Markdown.parse(store, { selection, mode: selectionMode }, transaction);
				transaction.commit();
			});
			*/
		}
	}

	public delete(transaction: Transaction, store: RecordStore, selection: TextSelection, selectionMode: TextSelectionMode) {
		if (selection.startIndex !== selection.endIndex) {
			const storeValue = store.getValue();
			const newRecord = segmentUtils.remove(storeValue, selection.startIndex, selection.endIndex);

			const newSelection: TextSelection = {
				startIndex: selection.startIndex,
				endIndex: selection.startIndex,
				lineNumber: selection.lineNumber
			};

			this.setSelection(newSelection);


			EditOperation.addSetOperationForStore(store, newRecord, transaction);

			const rootStore = store.getRecordStoreAtRootPath();
			if ("block" == rootStore.table) {
				const removedRecord = segmentUtils.slice(storeValue, selection.startIndex, selection.endIndex);
			}


		} else {
			this.setSelection(selection);
		}
	}

	//#endregion

	private getLineNumberForStore(store: BlockStore) {
		const storeId = store.id;
		const pageIds: string[] = this.contentStore.getValue() || [];
		return Lodash.findIndex(pageIds, (id) => id === storeId);
	}

	private createStoreForLineNumber(lineNumber: number) {
		const pageId = this.getPageId(lineNumber);
		return this.createStoreForPageId(pageId, this.contentStore);
	}

	private getPageId(lineNumber: number) {
		const pageIds: string[] = this.contentStore.getValue() || [];
		return pageIds[lineNumber];
	}

	private createStoreForPageId = (id: string, contentStore: RecordStore) => {
		return BlockStore.createChildStore(contentStore, {
			table: 'block',
			id: id
		});
	};
}

export function getParentBlockStore(childStore: RecordStore) {
	let parentStore: RecordStore = childStore;
	while (true) {
		if (!parentStore.recordStoreParentStore) {
			return;
		}
		parentStore = parentStore.recordStoreParentStore;
		if (parentStore instanceof BlockStore && parentStore !== childStore) {
			return parentStore;
		}
	}
}
