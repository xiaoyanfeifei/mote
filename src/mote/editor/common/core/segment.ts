import { Lodash } from "mote/base/common/lodash";
import { TextSelectionState } from "../editorState";
import { Command } from "../operations";
import { combineArray, getFirstInArray, getSecondArrayInArray, IAnnotation, ISegment } from "../segmentUtils";
import { TextSelection } from "./selectionUtils";
import { Transaction } from "./transaction";

export class Segment {

	private type: string;
	private annotations?: IAnnotation[];

	constructor(segment: ISegment) {
		this.type = segment[0];
		if (segment.length > 1) {
			this.annotations = segment.slice(1, segment.length) as any;
		}
	}

	private static afterSelect(segments: ISegment[], selection: TextSelection) {
		const segmentsBeforeRange: ISegment[] = [];
		const segmentsInsideRange: ISegment[] = [];
		const segmentsAfterRange: ISegment[] = [];

		const { startIndex, endIndex } = selection;
		let currentIdx = 0;

		for (const segment of segments) {
			// segment = [text, [annotation, annotation]]
			let text: string = segment[0];
			let annotations: string[] = getSecondArrayInArray(segment);
			let currentEndIdx = currentIdx + text.length;

			// [ means currentIdx, ] means currentEndIdx, | | means startIndex and endIndex
			// Case 1: [ ] | |  sort as currentIdx, currentEndIdx, startIndex, endIndex
			if (currentEndIdx <= startIndex) {
				segmentsBeforeRange.push(segment);
			}
			// Case 2: | | [ ]
			else if (currentIdx >= endIndex) {
				segmentsAfterRange.push(segment);
			}
			// Case 3: | [ ] |
			else if (currentIdx >= startIndex && currentEndIdx <= endIndex) {
				segmentsInsideRange.push(segment);
			}
			// Case 4: [ | | ]
			else if (currentIdx <= startIndex && currentEndIdx >= endIndex) {
				const textStartIdx = startIndex - currentIdx;
				const textEndIdx = textStartIdx + endIndex - startIndex;

				const textBeforeRange = text.slice(0, textStartIdx);
				const textInsideRange = text.slice(textStartIdx, textEndIdx);
				const textAfterRange = text.slice(textEndIdx);

				if (textBeforeRange.length > 0) {
					segmentsBeforeRange.push(combineArray(textBeforeRange, annotations) as ISegment);
				}
				if (textAfterRange.length > 0) {
					segmentsAfterRange.push(combineArray(textAfterRange, annotations) as ISegment);
				}
				if (textInsideRange.length > 0) {
					segmentsInsideRange.push(combineArray(textInsideRange, annotations) as ISegment);
				}
			}
			// Case 5: | [ | ]
			else if (currentIdx < startIndex && currentEndIdx < endIndex) {
				const textStartIdx = startIndex - currentIdx;

				const textInsideRange = text.slice(0, textStartIdx);
				const textAfterRange = text.slice(textStartIdx);

				if (textAfterRange.length > 0) {
					segmentsAfterRange.push(combineArray(textAfterRange, annotations) as ISegment);
				}
				if (textInsideRange.length > 0) {
					segmentsInsideRange.push(combineArray(textInsideRange, annotations) as ISegment);
				}
			}
			// Case 6: [ | ] |
			else if (currentIdx < startIndex && currentEndIdx > endIndex) {
				const textStartIdx = startIndex - currentIdx;

				const textBeforeRange = text.slice(0, textStartIdx);
				const textInsideRange = text.slice(textStartIdx);

				if (textBeforeRange.length > 0) {
					segmentsBeforeRange.push(combineArray(textBeforeRange, annotations) as ISegment);
				}
				if (textInsideRange.length > 0) {
					segmentsInsideRange.push(combineArray(textInsideRange, annotations) as ISegment);
				}
			}
			currentIdx = currentEndIdx;
		}
		return {
			segmentsBeforeRange,
			segmentsInsideRange,
			segmentsAfterRange
		}
	}

	private static merge(segments: ISegment[], selection: TextSelection, annotation: IAnnotation): ISegment[] {
		const { segmentsBeforeRange, segmentsInsideRange, segmentsAfterRange } = this.afterSelect(segments, selection);
		const containTargetAnnotation = Lodash.every(segmentsInsideRange, (segment) => {
			const annotations: IAnnotation[] = getSecondArrayInArray(segment);
			// TODO: use deep equal later
			return annotations.some(e => e[0] == annotation[0]);
		});

		let newSegments: ISegment[];
		// if contain target annotation, need to remove it
		if (containTargetAnnotation) {
			newSegments = segmentsInsideRange.map(segment => {
				const text = getFirstInArray(segment);
				const annotations = getSecondArrayInArray(segment).filter(e => e[0] !== annotation[0]);
				return combineArray(text, annotations) as ISegment;
			})
		}
		// Add new annotation
		else {
			newSegments = segmentsInsideRange.map(segment => {
				const text = getFirstInArray(segment);
				const annotations = new Set(getSecondArrayInArray(segment));
				annotations.add(annotation);
				return combineArray(text, [...annotations]) as ISegment;
			})
		}
		return [...segmentsBeforeRange, ...newSegments, ...segmentsAfterRange];
	}

	public static update(textSelection: TextSelectionState, annotation: IAnnotation) {
		if (!textSelection.store) {
			return;
		}

		const store = textSelection.store;
		const storeValue = store.getValue();
		if (!Array.isArray(storeValue)) {
			return;
		}

		const segments = this.merge(storeValue, textSelection.selection, annotation);
		const transaction = Transaction.create(store.userId);
		transaction.addOperation(store, {
			id: store.id,
			table: store.table,
			path: store.path,
			command: Command.Set,
			args: segments
		});
		transaction.commit();
		window.getSelection()?.empty();
		// dismiss the quick menu
	}
}
