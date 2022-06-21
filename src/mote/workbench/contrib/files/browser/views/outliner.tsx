import { createElement, setStyles } from "mote/base/jsx/createElement";
import { Fragment } from "mote/base/jsx/jsx";
import Column from "mote/base/ui/column/column";
import fonts from "mote/base/ui/fonts";
import SVGIcon from "mote/base/ui/svgicon/svgicon";
import { ThemedColors, ThemedStyles } from "mote/base/ui/themes";
import BlockStore from "mote/editor/common/store/blockStore";
import RecordStore from "mote/editor/common/store/recordStore";
import SpaceStore from "mote/editor/common/store/spaceStore";
import { $ } from "vs/base/browser/dom";
import { IDisposable } from "vs/base/common/lifecycle";

const PlusIcon = () => {
  
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <SVGIcon name="plus" style={{
                fill: ThemedStyles.mediumIconColor.dark,
                width: 16,
                height: 16
            }}/>
        </div>
    )
}

interface ColumnNameProps {
    shouldWrap?: boolean;
    displayName?: string;
    store: RecordStore;
    isTopLevel: boolean;
    placeholder?: string;
}

export class NameFromStore {

    public element!: HTMLElement;

    private shouldWrap?: boolean;
    private placeholder?: string;
    private _store!: RecordStore;
    private listener!: IDisposable;

    private domNode!: Text;

    constructor(store: RecordStore) {
        this.store = store;
        this.create();
    }

    create() {
        this.element = $("");
        setStyles(this.element, this.getStyle());
        this.domNode = document.createTextNode(this.getTitle());
        this.element.appendChild(this.domNode);
    }

    set store(value: RecordStore) {
        if (this.listener) {
            this.listener.dispose();
        }
        this._store = value;
        this.listener = this._store.onDidChange(this.update);
    }

    private update =() => {
        this.domNode.textContent = this.getTitle();
    }

    getStyle=()=>{
        return Object.assign({}, !this.shouldWrap && fonts.textOverflowStyle || {});
    }

    getTitle = () => {
        const title = this._store.getValue();
        if (null != title && title.length > 0) {
            return title.join("");
        }
        return this.getEmptyTitle();
    }

    getEmptyTitle = () => {
        if (this.placeholder){
            return this.placeholder;
        } else {
            return "Untitled"
        }
    }
}


const styles = {
    outliner: {
        paddingTop: "14px",
        paddingBottom: "20px",
        zIndex: 1,
        overflow: "hidden auto",
        marginRight: "0px",
        marginBottom: "0px",
    },
    column_wrapStyle: {
        display: "flex",
        alignItems: "center",
        minHeight: 27,
        fontSize: 14,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 14,
        paddingRight: 14,
        width: "100%"
    }
}