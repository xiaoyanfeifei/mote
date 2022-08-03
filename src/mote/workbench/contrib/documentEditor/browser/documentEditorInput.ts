import BlockStore from 'mote/platform/store/common/blockStore';
import { EditorInput } from 'mote/workbench/common/editorInput';


export class DocumentEditorInput extends EditorInput {


	constructor(
		public pageStore: BlockStore,
	) {
		super();
	}
}
