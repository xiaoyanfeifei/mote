import { TextSelection, TextSelectionMode } from "mote/editor/common/core/selectionUtils";
import { EditorState, TextSelectionState } from "mote/editor/common/editorState";
import { IResourceEditorInput } from "mote/platform/editor/common/editor";
import { IEditorPane } from "mote/workbench/common/editor";
import { IEditorStateService, TextSelectionUpdatePayload } from "mote/workbench/services/editor/common/editorService";
import { registerSingleton } from "vs/platform/instantiation/common/extensions";

export class EditorStateService implements IEditorStateService {
	_serviceBrand: undefined;

	private editorState: EditorState;

	constructor() {
		this.editorState = new EditorState();
	}

	public getEditorState() {
		return this.editorState;
	}

}

registerSingleton(IEditorStateService, EditorStateService);

