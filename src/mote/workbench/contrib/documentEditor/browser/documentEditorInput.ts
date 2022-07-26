import RecordStore from 'mote/editor/common/store/recordStore';
import { EditorInput } from 'mote/workbench/common/editorInput';


export class DocumentEditorInput extends EditorInput {


	constructor(
		public contentStore: RecordStore,
	) {
		super();
	}
}
