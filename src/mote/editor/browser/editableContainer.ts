import { CSSProperties } from "mote/base/jsx";
import { ThemedStyles } from "mote/base/ui/themes";
import BlockStore from "mote/editor/common/store/blockStore";
import { Transaction } from "../common/core/transaction";
import { segmentsToElement } from "../common/textSerialize";
import { BlockService } from "../services/blockService";
import { Editable } from "./editable";

interface EditableContainerOptions {
    style?: CSSProperties;
    placeHolderStyle?: CSSProperties;

    placeholder?: string;
}

export class EditableContainer {

    private editable: Editable;
    private options: EditableContainerOptions;
    private _store?: BlockStore;

    private blockService: BlockService = new BlockService();

    constructor(container: HTMLElement, options: EditableContainerOptions) {
        this.options = options;
        this.editable = new Editable(container, {
            placeholder: options.placeholder || "Untitled"
        });
        this.editable.onDidChange(this.handleChange);
        this.applyStyles();
    }


    private handleChange = (value: string) => {
        const that = this;
        Transaction.createAndCommit((transcation)=>{
            that.blockService.onChange(that._store, transcation, {startIndex:0, endIndex:0}, that.getTextValue(), value);
            that.applyStyles()
        }, "");
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
        this._store = value;
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

    getTextValue() {
        return this._store?.getValue() || "";
    }
}