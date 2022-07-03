import { getDataRootInParent, getTextMention, isTextBufferElement, isTextNode, removeBOM } from "mote/editor/common/htmlElementUtils";
import { serializeNode } from "mote/editor/common/textSerialize";
import { Range } from "./range";

export interface TextSelection {
    startIndex: number;
    endIndex: number;
}

export enum TextSelectionMode {
    Empty = 0,
    Editing,
    ReadOnly,
}

interface ContainerWithOffset {
    container: Node;
    offset: number;
}

export function calcIndex(dataRoot:Node| null |undefined, containerWithOffset: ContainerWithOffset): number {
    if (dataRoot === containerWithOffset.container) {
        if (isTextNode(dataRoot)) {
            const e = dataRoot && dataRoot.textContent || "";
            return e.substring(0, containerWithOffset.offset).length
        }
        {
            const e = Array.from(dataRoot? dataRoot.childNodes : [])
            .slice(0, containerWithOffset.offset)
            .map(e=>removeBOM(serializeNode(e))).join("");
            return e.length
        }
    }

    let i = 0;
    for (const childNode of Array.from(dataRoot? dataRoot.childNodes : [])) {
        if (childNode.contains(containerWithOffset.container))
            return i + calcIndex(childNode, containerWithOffset);
        i += removeBOM(serializeNode(childNode)).length
    }
    return i
};

export function getIndex(container:Node, offset:number) {
    const dataRoot = getDataRootInParent(container);

    let containerWithOffset: ContainerWithOffset;
    // Generate containerWithOffset
    const textMentionElement = getTextMention(container);
    if (textMentionElement) {
        const parentNode = textMentionElement.parentNode
        const textMentionElementIndex = Array.from(parentNode.childNodes).indexOf(textMentionElement);
        containerWithOffset = {
            container: parentNode,
            offset: 0 === offset ? textMentionElementIndex : textMentionElementIndex + 1
        }
    } else {
        if (isTextBufferElement(container) || isTextBufferElement(container.parentNode)) {
            containerWithOffset = {
                container: container,
                offset: (container.textContent || " ").length - 1
            }
        } else {
            containerWithOffset = {
                container: container,
                offset: offset
            }
        }
    }

    return calcIndex(dataRoot, containerWithOffset);
}


export function getSelectionFromRange(range?: globalThis.Range) {
    range = range || Range.get();
    if (range) {
        const startIndex = getIndex(range.startContainer, range.startOffset)
        const endIndex = getIndex(range.endContainer, range.endOffset)
        const textMentionNode = getTextMention(range.startContainer) || getTextMention(range.endContainer);
        return {
            selection: {
                startIndex: startIndex,
                endIndex: endIndex
            },
            forceEmitSelectionStore: Boolean(textMentionNode)
        }
    }
    return null;
}