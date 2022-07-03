import { CSSProperties } from "mote/base/jsx";
import { ThemedStyles } from "mote/base/ui/themes";
import BlockStore from "mote/editor/common/store/blockStore";
import { IEditorStateService } from "mote/workbench/services/editor/common/editorService";
import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { TextSelection } from "../common/core/selection";
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
}

export class EditableContainer extends Disposable {

    private editable: Editable;
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
            placeholder: options.placeholder || "Untitled",
            getSelection: () => this.getContainerSelection()
        });
        this.blockService = new BlockService(this.editorStateService.getEditorState());
        this.editable.onDidChange(this.handleChange);
        this.operationHandler = this.instantiationService.createInstance(OperationWrapper, this.editable.element);
        this.applyStyles();
    }


    private handleChange = (value: string) => {
        const that = this;
        const editorState = this.editorStateService.getEditorState();
        Transaction.createAndCommit((transcation)=>{
            that.blockService.onChange(that.blockStore, transcation, editorState.selectionState.selection, that.getTextValue(), value);
            that.applyStyles()
        }, "");
    }

    isEditing() {
        return true;
    }

    getContainerSelection = (): TextSelection|undefined => {
        const isEditingState = this.isEditing();
        if (isEditingState) {
            const editorState = this.editorStateService.getEditorState();
            const selection = editorState.selectionState.selection;
            const length = collectValueFromSegment(this.getTextValue()).length;
            return {
                startIndex: Math.min(selection.startIndex, length),
                endIndex: Math.min(selection.endIndex, length)
            }
        }
        return undefined;
    }


    applyStyles() {
        const editableStyle = this.getEditableStyle();
        this.editable.style(editableStyle);
    }

    getEditableStyle = () => {
        let style = Object.assign({
            maxWidth: "100%",
            width: "100%",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
        }, this.options.style);

        if(this.isEmpty()){
            style.minHeight = "1em";
            style = Object.assign({}, style, {
                color: ThemedStyles.regularTextColor.dark,
                WebkitTextFillColor: ThemedStyles.lightTextColor.dark
            }, this.options.placeHolderStyle);
        }
        return style;
    }

    set store(value: BlockStore) {
        this.blockStore = value;
        this._register(this.blockStore.onDidChange(()=>this.update()));
        this.operationHandler.store = value;
        this.update();
    }

    public update() {
        this.editable.value = segmentsToElement(this.getTextValue()).join("");
        this.applyStyles()
    }

    isEmpty() {
        const value = this.getTextValue() || [];
        return 0 === value.length;
    }

    getTextValue(): ISegment[] {
        return this.blockStore?.getValue() || "";
    }
}