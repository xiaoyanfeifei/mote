import * as strings from 'vs/base/common/strings';
import { Position } from 'mote/editor/common/core/position';
import { TextSelection } from 'mote/editor/common/core/selectionUtils';

export const _debugComposition = true;

export interface ITypeData {
	text: string;
	type: string;
	replacePrevCharCnt: number;
	replaceNextCharCnt: number;
	positionDelta: number;
}

export interface IEditableWrapper {
	getValue(): string;
	setValue(reason: string, value: string): void;

	getSelection(): TextSelection;
	setSelectionRange(reason: string, selectionStart: number, selectionEnd: number): void;
}

export class EditableState {

	public static readonly EMPTY = new EditableState('', 0, 0, null, null);

	public static readFromEditable(editable: IEditableWrapper): EditableState {
		const selection = editable.getSelection();
		return new EditableState(editable.getValue(), selection.startIndex, selection.endIndex, null, null);
	}

	public static deduceInput(previousState: EditableState, currentState: EditableState, couldBeEmojiInput: boolean): ITypeData {
		if (!previousState) {
			// This is the EMPTY state
			return {
				text: '',
				type: '',
				replacePrevCharCnt: 0,
				replaceNextCharCnt: 0,
				positionDelta: 0
			};
		}

		if (_debugComposition) {
			console.log('------------------------deduceInput');
			console.log(`PREVIOUS STATE: ${previousState.toString()}`);
			console.log(`CURRENT STATE: ${currentState.toString()}`);
		}

		const prefixLength = Math.min(
			strings.commonPrefixLength(previousState.value, currentState.value),
			previousState.selectionStart,
			currentState.selectionStart
		);
		const suffixLength = Math.min(
			strings.commonSuffixLength(previousState.value, currentState.value),
			previousState.value.length - previousState.selectionEnd,
			currentState.value.length - currentState.selectionEnd
		);
		const previousValue = previousState.value.substring(prefixLength, previousState.value.length - suffixLength);
		const currentValue = currentState.value.substring(prefixLength, currentState.value.length - suffixLength);
		const previousSelectionStart = previousState.selectionStart - prefixLength;
		const previousSelectionEnd = previousState.selectionEnd - prefixLength;
		const currentSelectionStart = currentState.selectionStart - prefixLength;
		const currentSelectionEnd = currentState.selectionEnd - prefixLength;

		if (_debugComposition) {
			console.log(`AFTER DIFFING PREVIOUS STATE: <${previousValue}>, selectionStart: ${previousSelectionStart}, selectionEnd: ${previousSelectionEnd}`);
			console.log(`AFTER DIFFING CURRENT STATE: <${currentValue}>, selectionStart: ${currentSelectionStart}, selectionEnd: ${currentSelectionEnd}`);
		}

		if (currentSelectionStart === currentSelectionEnd) {
			// no current selection
			const replacePreviousCharacters = (previousState.selectionStart - prefixLength);
			if (_debugComposition) {
				console.log(`REMOVE PREVIOUS: ${replacePreviousCharacters} chars`);
			}

			return {
				text: currentState.value,
				type: currentValue,
				replacePrevCharCnt: replacePreviousCharacters,
				replaceNextCharCnt: 0,
				positionDelta: 0
			};
		}

		// there is a current selection => composition case
		const replacePreviousCharacters = previousSelectionEnd - previousSelectionStart;
		return {
			text: currentState.value,
			type: currentValue,
			replacePrevCharCnt: replacePreviousCharacters,
			replaceNextCharCnt: 0,
			positionDelta: 0
		};
	}


	constructor(
		public readonly value: string,
		public readonly selectionStart: number,
		public readonly selectionEnd: number,
		public readonly selectionStartPosition: Position | null,
		public readonly selectionEndPosition: Position | null
	) {

	}

	public toString(): string {
		return `[ <${this.value}>, selectionStart: ${this.selectionStart}, selectionEnd: ${this.selectionEnd}]`;
	}
}
