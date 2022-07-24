import { Lodash } from "mote/base/common/lodash";
import { TextSelectionState } from "../editorState";
import { Command } from "../operations";
import { combineArray, getFirstInArray, getSecondArrayInArray, IAnnotation } from "../segmentUtils";
import BlockStore from "../store/blockStore";
import { TextSelection } from "./selectionUtils";
import { Transaction } from "./transaction";

export class Annotation {

	private type: string;
	private data: any;

	constructor(annotation: IAnnotation) {
		this.type = annotation[0];
	}
}
