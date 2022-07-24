import { Lodash } from 'mote/base/common/lodash';
import blockTypes from 'mote/editor/common/blockTypes';
import { EditOperation } from 'mote/editor/common/core/editOperation';
import { TextSelectionMode } from 'mote/editor/common/core/selectionUtils';
import { Transaction } from 'mote/editor/common/core/transaction';
import { TextSelectionState } from 'mote/editor/common/editorState';
import { collectValueFromSegment } from 'mote/editor/common/segmentUtils';
import BlockStore from 'mote/editor/common/store/blockStore';


interface MarkdownParseRule {
	matchRegex: RegExp;
	toBlockType(content: string): string;
	insertTextAfter: boolean;
}

interface ParseMarkdownBlockProps extends MarkdownParseRule {
	store: BlockStore;
	transaction: Transaction;
	textSelection: TextSelectionState;
}

const markdownParseRules: MarkdownParseRule[] = [];
// Add H1 tag
markdownParseRules.push({
	matchRegex: /^# $/,
	toBlockType: () => blockTypes.header,
	insertTextAfter: false,
});

export class Markdown {
	public static parse(store: BlockStore, textSelection: TextSelectionState, transaction: Transaction) {
		const storeValue = store.getRecordStoreAtRootPath().getValue();
		const blockType = storeValue.type;
		if (blockType !== blockTypes.code) {
			// Only match one markdown rule and take action
			Lodash.find(markdownParseRules, (rule) => {
				return this.tryParse({ ...rule, store, transaction, textSelection });
			});
		}
	}

	private static tryParse(props: ParseMarkdownBlockProps): boolean {
		const selection = TextSelectionMode.Editing === props.textSelection.mode && props.textSelection.selection;
		if (!selection) {
			return false;
		}

		// Get store text value based on selection
		const text = collectValueFromSegment(props.store.getValue()).slice(0, selection.endIndex);
		// Try to get matched markdown tag
		const markdownTag = props.matchRegex.exec(text);
		if (!markdownTag) {
			return false;
		}

		// Get blockType, only text block support markdown
		const parentStore = props.store.recordStoreParentStore;
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

		const blockType = props.toBlockType(markdownTag.toString());
		if (blockType && blockType !== parentStoreType) {
			if (parentStore instanceof BlockStore) {

				EditOperation.turnInto(parentStore, blockType, props.transaction);
			}
			/*
			richtextUtils.deleteBlock({
				store: props.store,
				selection: {
					startIndex: 0,
					endIndex: (markdownTag && Lodash.toArray(markdownTag[0]).length) || 0
				},
				transaction: props.transaction,
				textSelection: props.textSelection
			});
			if (props.insertTextAfter) {
				// TODO
			}
			*/
			return true;
		}

		return false;
	}
}
