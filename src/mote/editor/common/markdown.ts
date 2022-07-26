import { Lodash } from 'mote/base/common/lodash';
import blockTypes from 'mote/editor/common/blockTypes';
import { EditOperation } from 'mote/editor/common/core/editOperation';
import { TextSelection } from 'mote/editor/common/core/selectionUtils';
import { Transaction } from 'mote/editor/common/core/transaction';
import { collectValueFromSegment } from 'mote/editor/common/segmentUtils';
import BlockStore from 'mote/editor/common/store/blockStore';
import RecordStore from 'mote/editor/common/store/recordStore';

export interface ICommandExecutor {
	readonly store: RecordStore;
	readonly selection: TextSelection;
	readonly transaction: Transaction;
	setSelection(selection: TextSelection): void;
	delete(transaction: Transaction, store: RecordStore, selection: TextSelection): void;
}


interface MarkdownParseRule {
	matchRegex: RegExp;
	toBlockType(content: string): string;
	insertTextAfter: boolean;
}

interface ParseMarkdownBlockProps extends MarkdownParseRule {
	executor: ICommandExecutor;
}

const markdownParseRules: MarkdownParseRule[] = [];
// Add H1 tag
markdownParseRules.push({
	matchRegex: /^# $/,
	toBlockType: () => blockTypes.header,
	insertTextAfter: false,
});

// Add Quote tag
markdownParseRules.push({
	matchRegex: /^["“|] $/,
	toBlockType: () => blockTypes.quote,
	insertTextAfter: false,
});

export class Markdown {
	public static parse(executor: ICommandExecutor): boolean {
		const storeValue = executor.store.getRecordStoreAtRootPath().getValue();
		const blockType = storeValue.type;
		if (blockType !== blockTypes.code) {
			// Only match one markdown rule and take action
			const ruleMatched = Lodash.find(markdownParseRules, (rule) => {
				return this.tryParse({ ...rule, executor });
			});
			return ruleMatched !== undefined;
		}
		return false;
	}

	private static tryParse(props: ParseMarkdownBlockProps): boolean {
		const { executor, toBlockType, matchRegex } = props;
		const { selection, store, transaction } = props.executor;
		const fullText = collectValueFromSegment(store.getValue());
		// Get store text value based on selection
		const text = fullText.slice(0, selection.endIndex);
		// Try to get matched markdown tag
		const markdownTag = matchRegex.exec(text);
		if (!markdownTag) {
			return false;
		}

		// Get blockType, only text block support markdown
		const parentStore = store.recordStoreParentStore;
		if (!(parentStore && parentStore instanceof BlockStore)) {
			return false;
		}
		const parentStoreType = parentStore.getType();
		if (!parentStoreType) {
			return false;
		}
		if (blockTypes.text !== parentStoreType) {
			return false;
		}

		const blockType = toBlockType(markdownTag.toString());
		if (blockType && blockType !== parentStoreType) {
			if (parentStore instanceof BlockStore) {

				EditOperation.turnInto(parentStore, blockType as any, transaction);
			}
			const endIndex = (markdownTag && markdownTag[0].length) || 0;
			executor.delete(transaction, store, {
				startIndex: 0,
				endIndex: endIndex,
				lineNumber: selection.lineNumber
			});
			console.log(fullText.length, endIndex);
			const index = fullText.length - endIndex;
			executor.setSelection({ startIndex: index, endIndex: index, lineNumber: selection.lineNumber });
			return true;
		}

		return false;
	}
}
