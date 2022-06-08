import { IResourceEditorInput } from "mote/platform/editor/common/editor";
import { IEditorPane } from "mote/workbench/common/editor";
import { createDecorator } from "vs/platform/instantiation/common/instantiation";

export const IEditorService = createDecorator<IEditorService>('editorService');

export interface IEditorService {

	readonly _serviceBrand: undefined;

    openEditor(editor: IResourceEditorInput): Promise<IEditorPane | undefined>;
}