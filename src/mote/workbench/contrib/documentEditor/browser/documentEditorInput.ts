import BlockStore from 'mote/editor/common/store/blockStore';
import { EditorInput } from 'mote/workbench/common/editorInput';


export class DocumentEditorInput extends EditorInput {


	constructor(
		public pageStore: BlockStore,
	) {
		super();
	}
}
