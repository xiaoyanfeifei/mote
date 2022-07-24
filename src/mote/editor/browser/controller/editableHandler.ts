import * as browser from 'vs/base/browser/browser';
import * as platform from 'vs/base/common/platform';
import { ClipboardDataToCopy, EditableInput, EditableWrapper, IEditableInputHost } from 'mote/editor/browser/controller/editableInput';
import { ViewPart } from 'mote/editor/browser/view/viewPart';
import { createFastDomNode, FastDomNode } from 'vs/base/browser/fastDomNode';
import { ITypeData, _debugComposition } from 'mote/editor/browser/controller/editableState';
import { ViewController } from 'mote/editor/browser/view/viewController';

export class EditableHandler extends ViewPart {

	private editable: FastDomNode<HTMLDivElement>;
	private editableInput: EditableInput;

	constructor(
		private readonly viewController: ViewController,
	) {
		super();
		this.editable = createFastDomNode(document.createElement('div'));


		const editableInputHost: IEditableInputHost = {
			getDataToCopy: (): ClipboardDataToCopy => {
				return null as any;
			}
		};

		const editableWrapper = this._register(new EditableWrapper(this.editable.domNode));
		this.editableInput = this._register(new EditableInput(editableInputHost, editableWrapper, platform.OS, browser, {}));

		this.registerListener();
	}

	private registerListener() {
		this._register(this.editableInput.onType((e: ITypeData) => {
			if (e.replacePrevCharCnt || e.replaceNextCharCnt || e.positionDelta) {
				// must be handled through the new command
				if (_debugComposition) {
					console.log(` => compositionType: <<${e.text}>>, ${e.replacePrevCharCnt}, ${e.replaceNextCharCnt}, ${e.positionDelta}`);
				}
				this.viewController.compositionType(e.text, e.replacePrevCharCnt, e.replaceNextCharCnt, e.positionDelta);
			} else {
				if (_debugComposition) {
					console.log(` => type: <<${e.text}>>`);
				}
				this.viewController.type(e.text);
			}
		}));
	}
}
