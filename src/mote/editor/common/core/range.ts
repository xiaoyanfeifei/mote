

export class Range {


    static get(): globalThis.Range | undefined {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0){
            return selection.getRangeAt(0);
        }
        return undefined;
    }

    static set(value: globalThis.Range) {
        const range = document.createRange();
        range.setStart(value.startContainer, value.startOffset);
        range.setEnd(value.endContainer, value.endOffset);
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    static getIndex(container:Node, offset:Number) {

    }
}