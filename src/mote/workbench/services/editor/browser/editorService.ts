import { EditorState } from "mote/editor/common/editorState";
import { IResourceEditorInput } from "mote/platform/editor/common/editor";
import { IEditorPane } from "mote/workbench/common/editor";
import { IEditorService } from "mote/workbench/services/editor/common/editorService";
import { registerSingleton } from "vs/platform/instantiation/common/extensions";

export class EditorService implements IEditorService {
    _serviceBrand: undefined;

    private editorState: EditorState;

    constructor() {
        this.editorState = new EditorState();
    }
    
    openEditor(editor: IResourceEditorInput): Promise<IEditorPane | undefined> {
        throw new Error("Method not implemented.");
    }

    public getEditorState() {
        return this.editorState;
    }
    
}

registerSingleton(IEditorService, EditorService);