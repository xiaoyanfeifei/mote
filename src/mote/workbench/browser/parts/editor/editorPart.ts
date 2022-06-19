import { IWorkbenchLayoutService, Parts } from "mote/workbench/services/layout/browser/layoutService";
import { $, Dimension } from "vs/base/browser/dom";
import { Emitter } from "vs/base/common/event";
import { Part } from "mote/workbench/browser/part";
import { IEditorService } from "mote/workbench/services/editor/common/editorService";
import { registerSingleton } from "vs/platform/instantiation/common/extensions";
import { IResourceEditorInput } from "mote/platform/editor/common/editor";
import { IEditorPane } from "mote/workbench/common/editor";
import { IThemeService } from "mote/platform/theme/common/themeService";
import { Editable } from "mote/editor/browser/editable";
import { assertIsDefined } from "vs/base/common/types";
import { ThemedStyles } from "mote/base/ui/themes";
import { setStyles } from "mote/base/jsx/createElement";
import { EditableContainer } from "mote/editor/browser/editableContainer";
import RecordStore from "mote/editor/common/store/recordStore";
import BlockStore from "mote/editor/common/store/blockStore";
import { IStorageService } from "vs/platform/storage/common/storage";
import RecordCacheStore from "mote/editor/common/store/recordCacheStore";
import { ILogService } from "vs/platform/log/common/log";

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
        @IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
        @IThemeService themeService: IThemeService,
        @IStorageService storageService: IStorageService,
        @ILogService logService: ILogService,
    ) {
        super(Parts.EDITOR_PART, {hasTitle: false}, themeService, layoutService);
        RecordCacheStore.Default.storageService = storageService;
        RecordCacheStore.Default.logService = logService;
    }

    openEditor(editor: IResourceEditorInput): Promise<IEditorPane | undefined> {
        throw new Error("Method not implemented.");
    }

    getTitleStyle(){
        return {
            color: ThemedStyles.regularTextColor.dark,
            fontWeight: 700,
            lineHeight: 1.2,
            fontSize: "40px",
            cursor: "text",
            display: "flex",
            alignItems: "center"
        }
    }

    getSafePaddingLeftCSS(padding: number) {
        return `calc(${padding}px + env(safe-area-inset-left))`
    }

    getSafePaddingRightCSS(padding: number) {
        return `calc(${padding}px + env(safe-area-inset-right))`
    }

    override createTitleArea(parent: HTMLElement, options?: object): HTMLElement | undefined {
        this.createCover(parent);
        const titleDomNode = $(".editor-header");
        const titleContainer = $("");

        titleContainer.style.paddingLeft = this.getSafePaddingLeftCSS(96);
        titleContainer.style.paddingRight = this.getSafePaddingRightCSS(96);
        titleContainer.style.width = "100%";

        const header = new EditableContainer(titleContainer, {
            placeholder: "Untitled"
        });

       const store = new BlockStore({id: "block1", table:"block"}, "123");
        header.store = store.getPropertyStore("title");

        titleDomNode.append(titleContainer);
        setStyles(titleDomNode, this.getTitleStyle());
        parent.append(titleDomNode);
        return titleDomNode;
    }

    override createContentArea(parent: HTMLElement) {
        // Container
		this.element = parent;
		this.container = document.createElement('div');
		this.container.classList.add('content');
		parent.appendChild(this.container);

        return this.container;
    }

    createCover(parent: HTMLElement) {
        const coverDomNode = $("");
        coverDomNode.style.height = "100px";
        parent.append(coverDomNode)
    }

    override updateStyles(): void {
        // Part container
		const container = assertIsDefined(this.getContainer());

		container.style.left = "260px";
        container.style.width = "760px";
		container.style.height = "100%";
        //container.style.left 
		//container.style.backgroundColor = ThemedStyles.sidebarBackground.dark;
		container.style.position = "absolute";
    }
}

registerSingleton(IEditorService, EditorPart);