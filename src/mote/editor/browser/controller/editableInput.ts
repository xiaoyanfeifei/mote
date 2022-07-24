import * as browser from 'vs/base/browser/browser';
import * as dom from 'vs/base/browser/dom';
import * as strings from 'vs/base/common/strings';
import { CSSProperties } from 'mote/base/browser/jsx';
import { setStyles } from 'mote/base/browser/jsx/createElement';
import { nodeToString } from '../../common/textSerialize';
import { Emitter, Event } from 'vs/base/common/event';
import { TextSelection } from '../../common/core/selection';
import { Range } from 'mote/editor/common/core/range';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { EditableState, IEditableWrapper, ITypeData, _debugComposition } from 'mote/editor/browser/controller/editableState';
import { EditorSelection } from 'mote/editor/common/core/editorSelection';
import { OperatingSystem } from 'vs/base/common/platform';

interface EditableOptions {
	getSelection?(): TextSelection | undefined;
	placeholder?: string;
}

export interface ClipboardStoredMetadata {
	version: 1;
	isFromEmptySelection: boolean | undefined;
	multicursorText: string[] | null | undefined;
	mode: string | null;
}

export interface IPasteData {
	text: string;
	metadata: ClipboardStoredMetadata | null;
}

export interface ClipboardDataToCopy {
	isFromEmptySelection: boolean;
	multicursorText: string[] | null | undefined;
	text: string;
	html: string | null | undefined;
	mode: string | null;
}

export interface IEditableInputHost {
	getDataToCopy(): ClipboardDataToCopy;
	//getScreenReaderContent(currentState: TextAreaState): TextAreaState;
	//deduceModelPosition(viewAnchorPosition: Position, deltaOffset: number, lineFeedCnt: number): Position;
}

interface InMemoryClipboardMetadata {
	lastCopiedValue: string;
	data: ClipboardStoredMetadata;
}

/**
 * Every time we write to the clipboard, we record a bit of extra metadata here.
 * Every time we read from the cipboard, if the text matches our last written text,
 * we can fetch the previous metadata.
 */
export class InMemoryClipboardMetadataManager {
	public static readonly INSTANCE = new InMemoryClipboardMetadataManager();

	private _lastState: InMemoryClipboardMetadata | null;

	constructor() {
		this._lastState = null;
	}

	public set(lastCopiedValue: string, data: ClipboardStoredMetadata): void {
		this._lastState = { lastCopiedValue, data };
	}

	public get(pastedText: string): ClipboardStoredMetadata | null {
		if (this._lastState && this._lastState.lastCopiedValue === pastedText) {
			// match!
			return this._lastState.data;
		}
		this._lastState = null;
		return null;
	}
}

export interface ICompositionStartEvent {
	data: string;
}

export interface ICompleteEditableWrapper extends IEditableWrapper {
	readonly onInput: Event<InputEvent>;
}

export interface IBrowser {
	isAndroid: boolean;
	isFirefox: boolean;
	isChrome: boolean;
	isSafari: boolean;
}

class CompositionContext {

	private _lastTypeTextLength: number;

	constructor() {
		this._lastTypeTextLength = 0;
	}

	public handleCompositionUpdate(text: string | null | undefined): ITypeData {
		text = text || '';
		const typeInput: ITypeData = {
			text: text,
			replacePrevCharCnt: this._lastTypeTextLength,
			replaceNextCharCnt: 0,
			positionDelta: 0
		};
		this._lastTypeTextLength = text.length;
		return typeInput;
	}
}

export class EditableInput extends Disposable {

	//#region events

	private _onFocus = this._register(new Emitter<void>());
	public readonly onFocus: Event<void> = this._onFocus.event;

	private _onBlur = this._register(new Emitter<void>());
	public readonly onBlur: Event<void> = this._onBlur.event;

	private _onKeyDown = this._register(new Emitter<IKeyboardEvent>());
	public readonly onKeyDown: Event<IKeyboardEvent> = this._onKeyDown.event;

	private _onKeyUp = this._register(new Emitter<IKeyboardEvent>());
	public readonly onKeyUp: Event<IKeyboardEvent> = this._onKeyUp.event;

	private _onCut = this._register(new Emitter<void>());
	public readonly onCut: Event<void> = this._onCut.event;

	private _onPaste = this._register(new Emitter<IPasteData>());
	public readonly onPaste: Event<IPasteData> = this._onPaste.event;

	private _onType = this._register(new Emitter<ITypeData>());
	public readonly onType: Event<ITypeData> = this._onType.event;

	private _onSelectionChangeRequest = this._register(new Emitter<EditorSelection>());
	public readonly onSelectionChangeRequest: Event<EditorSelection> = this._onSelectionChangeRequest.event;

	//#endregion

	private options: EditableOptions;

	private input: HTMLElement;
	private testDiv = dom.$('div');

	private selection: TextSelection | undefined;

	private _onDidChange = this._register(new Emitter<string>());
	public readonly onDidChange: Event<string> = this._onDidChange.event;

	private editableState: EditableState = EditableState.EMPTY;
	private selectionChangeListener: IDisposable | null = null;

	private hasFocus: boolean = false;
	private currentComposition: CompositionContext | null = null;

	constructor(
		private readonly host: IEditableInputHost,
		private readonly editable: ICompleteEditableWrapper,
		private readonly OS: OperatingSystem,
		private readonly browser: IBrowser,
		options: EditableOptions
	) {
		super();
		this.options = options;
		this.input = dom.$('');
		this.input.contentEditable = 'true';
		this.input.setAttribute('data-root', '');
		this.input.tabIndex = 0;
		if (options.placeholder) {
			this.input.setAttribute('placeholder', options.placeholder);
		}

		this.registerListener();
	}

	private registerListener() {
		this._register(this.editable.onInput((e) => {
			if (_debugComposition) {
				console.log(`[input]`, e);
			}

			const newState = EditableState.readFromEditable(this.editable);
			const typeInput = EditableState.deduceInput(this.editableState, newState, /*couldBeEmojiInput*/this.OS === OperatingSystem.Macintosh);

			if (typeInput.replacePrevCharCnt === 0 && typeInput.text.length === 1 && strings.isHighSurrogate(typeInput.text.charCodeAt(0))) {
				// Ignore invalid input but keep it around for next time
				return;
			}
			this.editableState = newState;
			if (
				typeInput.text !== ''
				|| typeInput.replacePrevCharCnt !== 0
				|| typeInput.replaceNextCharCnt !== 0
				|| typeInput.positionDelta !== 0
			) {
				this._onType.fire(typeInput);
			}
		}));
	}

	public get value(): string {
		return nodeToString(this.input);
	}

	public get element() {
		return this.input;
	}

	public set value(newValue: string) {
		this.testDiv.innerHTML = newValue;
		if (this.input.innerHTML !== this.testDiv.innerHTML) {
			this.input.innerHTML = newValue;

		}
		if (this.options.getSelection) {
			this.selection = this.options.getSelection();
		}
		if (this.selection) {
			const rangeFromElement = Range.create(this.input, this.selection);
			const rangeFromDocument = Range.get();
			if (!Range.ensureRange(rangeFromDocument, rangeFromElement)) {
				Range.set(rangeFromElement);
			}
		}
	}

	private onValueChange() {
		this._onDidChange.fire(this.value);
	}

	style(value: CSSProperties) {
		this.input.removeAttribute('style');
		setStyles(this.input, value);
	}
}

export class EditableWrapper extends Disposable implements ICompleteEditableWrapper {
	//#region events

	public readonly onKeyDown = this._register(dom.createEventEmitter(this._actual, 'keydown')).event;
	public readonly onKeyPress = this._register(dom.createEventEmitter(this._actual, 'keypress')).event;
	public readonly onKeyUp = this._register(dom.createEventEmitter(this._actual, 'keyup')).event;
	public readonly onCompositionStart = this._register(dom.createEventEmitter(this._actual, 'compositionstart')).event;
	public readonly onCompositionUpdate = this._register(dom.createEventEmitter(this._actual, 'compositionupdate')).event;
	public readonly onCompositionEnd = this._register(dom.createEventEmitter(this._actual, 'compositionend')).event;
	public readonly onBeforeInput = this._register(dom.createEventEmitter(this._actual, 'beforeinput')).event;
	public readonly onInput = <Event<InputEvent>>this._register(dom.createEventEmitter(this._actual, 'input')).event;
	public readonly onCut = this._register(dom.createEventEmitter(this._actual, 'cut')).event;
	public readonly onCopy = this._register(dom.createEventEmitter(this._actual, 'copy')).event;
	public readonly onPaste = this._register(dom.createEventEmitter(this._actual, 'paste')).event;
	public readonly onFocus = this._register(dom.createEventEmitter(this._actual, 'focus')).event;
	public readonly onBlur = this._register(dom.createEventEmitter(this._actual, 'blur')).event;

	//#endregion

	constructor(
		private readonly _actual: HTMLDivElement
	) {
		super();
	}
	getValue(): string {
		throw new Error('Method not implemented.');
	}
	setValue(reason: string, value: string): void {
		throw new Error('Method not implemented.');
	}
	getSelectionStart(): number {
		throw new Error('Method not implemented.');
	}
	getSelectionEnd(): number {
		throw new Error('Method not implemented.');
	}
	setSelectionRange(reason: string, selectionStart: number, selectionEnd: number): void {
		throw new Error('Method not implemented.');
	}
}
