import { CSSProperties } from 'mote/base/browser/jsx';
import { ThemedStyles } from 'mote/base/common/themes';
import BlockStore from "mote/editor/common/store/blockStore";
import { IEditorStateService } from "mote/workbench/services/editor/common/editorService";
import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { TextSelection, TextSelectionMode } from "../common/core/selectionUtils";
import { Transaction } from "../common/core/transaction";
import { collectValueFromSegment, ISegment } from "../common/segmentUtils";
import { segmentsToElement } from "../common/textSerialize";
import { BlockService } from "../services/blockService";
import { Editable } from "./editable";
import { OperationWrapper } from "./operationWrapper";

interface EditableContainerOptions {
	style?: CSSProperties;
	placeHolderStyle?: CSSProperties;

	placeholder?: string;

	autoFocus?: boolean;
}

export class EditableContainer extends Disposable {

	private editable: EditableInput;
	private options: EditableContainerOptions;
	private blockStore?: BlockStore;

	private blockService: BlockService;
	private operationHandler: OperationWrapper;

	constructor(
		container: HTMLElement,
		options: EditableContainerOptions,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IEditorStateService private readonly editorStateService: IEditorStateService,
	) {
		super();
		this.options = options;
		this.editable = new Editable(container, {
			placeholder: options.placeholder || 'Untitled',
			getSelection: () => this.getContainerSelection()
		});
		this.blockService = new BlockService(this.editorStateService.getEditorState());

		this.operationHandler = this.instantiationService.createInstance(OperationWrapper, this.editable.element);
		this.applyStyles();

		this.registerListener();
	}

	focus() {
		//this.editable.element.focus();
	}

	activate() {
		const currentId = this.editorStateService.getEditorState().blockStore?.id;
		if (this.blockStore && this.blockStore.id === currentId) {
			return true;
		}
		return false;
	}

	private registerListener() {
		this.operationHandler.onDidEnter(this.handleEnter);
		this.operationHandler.onDidDelete(this.handleBackspace);
		this.editable.onDidChange(this.handleChange);
		this.editorStateService.getEditorState().onDidStoreChange(this.handleStoreChange);
	}

	private handleStoreChange = () => {
		if (this.activate() && this.options.autoFocus !== false) {
			this.focus();
		}
	};

	private handleChange = (value: string) => {
		const that = this;
		const editorState = this.editorStateService.getEditorState();
		Transaction.createAndCommit((transcation) => {
			that.blockService.onChange(
				that.blockStore!,
				transcation,
				editorState.selectionState.selection,
				value
			);
			that.applyStyles();
		}, this.blockStore?.userId!);
	};

	isEditing() {
		const editorState = this.editorStateService.getEditorState();
		const textSelection = editorState.selectionState;
		if (this.blockStore?.identify !== textSelection.store?.identify) {
			return false;
		}
		if (TextSelectionMode.Editing !== textSelection.mode) {
			return false;
		}
		return true;
	}

	getContainerSelection = (): TextSelection | undefined => {
		const isEditingState = this.isEditing();
		if (isEditingState) {
			const editorState = this.editorStateService.getEditorState();
			const selection = editorState.selectionState.selection;
			const length = collectValueFromSegment(this.getTextValue()).length;
			return {
				startIndex: Math.min(selection.startIndex, length),
				endIndex: Math.min(selection.endIndex, length)
			};
		}
		return undefined;
	};


	applyStyles() {
		const editableStyle = this.getEditableStyle();
		this.editable.style(editableStyle);
	}

	getEditableStyle = () => {
		let style = Object.assign({
			maxWidth: '100%',
			width: '100%',
			whiteSpace: 'pre-wrap',
			wordBreak: 'break-word',
		}, this.options.style);

		if (this.isEmpty()) {
			style.minHeight = '1em';
			style = Object.assign({}, style, {
				color: ThemedStyles.regularTextColor.dark,
				WebkitTextFillColor: ThemedStyles.lightTextColor.dark
			}, this.options.placeHolderStyle);
		}
		return style;
	};

	set store(value: BlockStore) {
		this.blockStore = value;
		this._register(this.blockStore.onDidChange(() => this.update()));
		this.operationHandler.store = value;
		this.update();
		this.handleStoreChange();
	}

	public update() {
		this.editable.value = segmentsToElement(this.getTextValue()).join('');
		this.applyStyles();
	}

	isEmpty() {
		const value = this.getTextValue() || [];
		return 0 === value.length;
	}

	getTextValue(): ISegment[] {
		return this.blockStore?.getValue() || '';
	}

	handleEnter = (e: Event) => {
		e.preventDefault();
		Transaction.createAndCommit((transaction) => {
			this.blockService.newLine(transaction, this.blockStore!);
		}, this.blockStore?.userId!);
	};

	handleBackspace = (e: any) => {
		e.preventDefault();
		Transaction.createAndCommit((transaction) => {
			this.blockService.backspace(transaction, this.blockStore!, false, e);
		}, this.blockStore?.userId!);
	};
}
