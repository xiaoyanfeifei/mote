import { IResourceEditorInput } from "mote/platform/editor/common/editor";
import { IEditorPane } from "mote/workbench/common/editor";
import { IEditorService } from "../common/editorService";

export class EditorService implements IEditorService {
    _serviceBrand: undefined;
    
    openEditor(editor: IResourceEditorInput): Promise<IEditorPane | undefined> {
        throw new Error("Method not implemented.");
    }
    
}