import { Lodash } from "mote/base/common/lodash";
import { getDataRootInParent, getTextEquationTokenElementInParent, getTextMention, isContentEditable, isIgnoreTextContentElement, isTextBufferElement, isTextBuffNodeContain, isTextMentionNode, removeBOM } from "../htmlElementUtils";
import { serializeNode } from "../textSerialize";
import { getIndex, TextSelection } from "./selectionUtils";


export class RangeUtils {


	static get(): globalThis.Range | undefined {
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
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

	static getRect(range: globalThis.Range) {
		let rect: DOMRect;
		if (range.collapsed && range.getClientRects) {
			rect = range.getClientRects()[0];
		} else {
			rect = range.getBoundingClientRect();
		}

		if (rect) {
			return rect;
		}
		if (Node.ELEMENT_NODE === range.startContainer.nodeType) {
			const container = range.startContainer as Element;
			if (0 === range.startOffset) {
				const clientRect = container.getBoundingClientRect();
				return {
					top: clientRect.top,
					bottom: clientRect.bottom,
					left: clientRect.left,
					right: clientRect.right,
					width: 0,
					height: clientRect.height
				}
			}
			const prevChildNode = container.childNodes[range.startOffset - 1];
			if (prevChildNode && prevChildNode.nodeType === Node.ELEMENT_NODE) {
				const clientRect = (prevChildNode as Element).getBoundingClientRect();
				return {
					top: clientRect.top,
					bottom: clientRect.bottom,
					left: clientRect.right,
					right: clientRect.right,
					width: 0,
					height: clientRect.height
				}
			}
			const childNode = container.childNodes[range.startOffset];
			if (childNode && childNode.nodeType === Node.ELEMENT_NODE) {
				const clientRect = (childNode as Element).getBoundingClientRect();
				return {
					top: clientRect.top,
					bottom: clientRect.bottom,
					left: clientRect.left,
					right: clientRect.left,
					width: 0,
					height: clientRect.height
				}
			}
		}
		return undefined;
	}

	static create(element: HTMLElement, selection: TextSelection) {
		const range = document.createRange();
		const containerWithStart = this.getContainerWithOffset(element, selection.startIndex);
		const containerWithEnd = this.getContainerWithOffset(element, selection.endIndex);
		if (containerWithStart.container)
			try {
				range.setStart(containerWithStart.container, containerWithStart.offset)
			} catch (s) {
				console.info(s)
			}
		if (containerWithEnd.container)
			try {
				range.setEnd(containerWithEnd.container, containerWithEnd.offset)
			} catch (s) {
				console.info(s)
			}
		return range
	}

	static getContainerWithOffset(element: Node, index: number) {
		if (0 === index) {
			if (!(element.childNodes.length > 0)
				|| isTextMentionNode(element.childNodes[0])
				|| isIgnoreTextContentElement(element.childNodes[0])
			) {
				return {
					container: element,
					offset: 0
				}
			} else {
				return {
					container: element.childNodes[0],
					offset: 0
				}
			}
		}

		let bias = index;

		for (let i = 0; i < element.childNodes.length; i++) {
			const childNode = element.childNodes[i]
			const serialized = removeBOM(serializeNode(childNode));
			const serializedLength = serialized.length;
			if (i === element.childNodes.length - 1 ? (bias - serializedLength) <= 0 : (bias - serializedLength) < 0) {
				if (isTextMentionNode(childNode)) {
					return {
						container: childNode.parentNode,
						offset: this.calcOffset(childNode.parentNode, childNode)
					};
				}
				if (childNode.nodeType === Node.TEXT_NODE) {
					return {
						container: childNode,
						offset: bias
					}
				}
				return this.getContainerWithOffset(childNode, bias);
			}
			bias -= serializedLength
		}
		return {
			container: element,
			offset: 0
		}
	}

	static ensureRange(rangeFromDocument: globalThis.Range | undefined, rangeFromElement: globalThis.Range) {
		if (rangeFromDocument || rangeFromElement) {
			if (rangeFromDocument && rangeFromElement) {
				if (isTextBuffNodeContain(rangeFromDocument.startContainer) !== isTextBuffNodeContain(rangeFromElement.startContainer)) {
					return false;
				}
				if (isTextBuffNodeContain(rangeFromDocument.endContainer) !== isTextBuffNodeContain(rangeFromElement.endContainer)) {
					return false;
				}
				if (getTextEquationTokenElementInParent(rangeFromDocument.startContainer) !== getTextEquationTokenElementInParent(rangeFromElement.startContainer)) {
					return false;
				}
				if (getTextEquationTokenElementInParent(rangeFromDocument.endContainer) !== getTextEquationTokenElementInParent(rangeFromElement.endContainer)) {
					return false;
				}
				if (rangeFromDocument.startOffset === rangeFromElement.startOffset && rangeFromDocument.endOffset === rangeFromElement.endOffset && rangeFromDocument.startContainer === rangeFromElement.startContainer && rangeFromDocument.endContainer === rangeFromElement.endContainer) {
					return true;
				}
				if (isContentEditable(rangeFromDocument.startContainer) && isContentEditable(rangeFromElement.startContainer)) {
					const r = getDataRootInParent(rangeFromDocument.startContainer)
						, o = getDataRootInParent(rangeFromElement.startContainer)
						, i = getDataRootInParent(rangeFromDocument.endContainer)
						, a = getDataRootInParent(rangeFromElement.endContainer)
						, s = getIndex(rangeFromDocument.startContainer, rangeFromDocument.startOffset)
						, l = getIndex(rangeFromElement.startContainer, rangeFromElement.startOffset)
						, c = getIndex(rangeFromDocument.endContainer, rangeFromDocument.endOffset)
						, d = getIndex(rangeFromElement.endContainer, rangeFromElement.endOffset);
					return r === o && i === a && s === l && c === d
				}
				return false;
			}
			return false;
		}
		return true;
	}

	static calcOffset(parent: Node | null, child: Node) {
		return parent != null ? Lodash.findIndex(parent.childNodes, e => e === child) : -1;
	}

}
