import { IWorkbenchLayoutService, Parts } from "mote/workbench/services/layout/browser/layoutService";
import { Dimension } from "vs/base/browser/dom";
import { Emitter } from "vs/base/common/event";
import { Part } from "mote/workbench/browser/part";
import { IEditorService } from "mote/workbench/services/editor/common/editorService";
import { registerSingleton } from "vs/platform/instantiation/common/extensions";
import { IResourceEditorInput } from "mote/platform/editor/common/editor";
import { IEditorPane } from "mote/workbench/common/editor";

export class EditorPart extends Part implements IEditorService {
    toJSON(): object {
        throw new Error("Method not implemented.");
    }

    declare readonly _serviceBrand: undefined;

    get minimumWidth(): number { 
        return 0;
    }

    get maximumWidth(): number { 
        return Number.POSITIVE_INFINITY;;
    }

    get minimumHeight(): number { 
        return 0;
    }

    get maximumHeight(): number { 
        return Number.POSITIVE_INFINITY;;
    }
  
    

    //#region Events

	private readonly _onDidLayout = this._register(new Emitter<Dimension>());
	readonly onDidLayout = this._onDidLayout.event;

    private container: HTMLElement | undefined;
    
    constructor(
        @IWorkbenchLayoutService layoutService: IWorkbenchLayoutService
    ) {
        super(Parts.EDITOR_PART, {hasTitle: false}, layoutService);
    }
    openEditor(editor: IResourceEditorInput): Promise<IEditorPane | undefined> {
        throw new Error("Method not implemented.");
    }

    override createContentArea(parent: HTMLElement) {
        // Container
		this.element = parent;
		this.container = document.createElement('div');
		this.container.classList.add('content');
		parent.appendChild(this.container);

        return this.container;
    }
}

registerSingleton(IEditorService, EditorPart);