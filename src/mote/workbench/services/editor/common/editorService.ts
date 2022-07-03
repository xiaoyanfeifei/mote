import { TextSelection } from "mote/editor/common/core/selection";
import { EditorState } from "mote/editor/common/editorState";
import BlockStore from "mote/editor/common/store/blockStore";
import { IResourceEditorInput } from "mote/platform/editor/common/editor";
import { IEditorPane } from "mote/workbench/common/editor";
import { createDecorator } from "vs/platform/instantiation/common/instantiation";

export const IEditorService = createDecorator<IEditorService>('editorService');

export interface IEditorService {

	readonly _serviceBrand: undefined;
}

export const IEditorStateService = createDecorator<IEditorStateService>('editorStateService');

export type TextSelectionUpdatePayload = {
    store?: BlockStore,
    selection: TextSelection, 
    readOnly?: boolean 
};

export interface IEditorStateService {

	readonly _serviceBrand: undefined;

    getEditorState(): EditorState;

    //updateSelection(payload: TextSelectionUpdatePayload): void;

   // openEditor(editor: IResourceEditorInput): Promise<IEditorPane | undefined>;
}