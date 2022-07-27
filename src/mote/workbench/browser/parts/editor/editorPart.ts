import { IWorkbenchLayoutService, Parts } from "mote/workbench/services/layout/browser/layoutService";
import { $, Dimension } from "vs/base/browser/dom";
import { Emitter } from "vs/base/common/event";
import { Part } from "mote/workbench/browser/part";
import { registerSingleton } from "vs/platform/instantiation/common/extensions";
import { IResourceEditorInput } from "mote/platform/editor/common/editor";
import { IEditorPane } from "mote/workbench/common/editor";
import { IThemeService } from "mote/platform/theme/common/themeService";
import { assertIsDefined } from "vs/base/common/types";
import { ThemedStyles } from "mote/base/common/themes";
import { setStyles } from "mote/base/browser/jsx/createElement";
import { EditableContainer } from "mote/editor/browser/editableContainer";
import BlockStore from "mote/editor/common/store/blockStore";
import { IStorageService } from "vs/platform/storage/common/storage";
import RecordCacheStore from "mote/editor/common/store/recordCacheStore";
import { ILogService } from "vs/platform/log/common/log";
import { CommandsRegistry } from "mote/platform/commands/common/commands";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { EmptyHolder } from "./emptyHolder";
import { IDisposable } from "vs/base/common/lifecycle";
import { IEditorService } from "mote/workbench/services/editor/common/editorService";
import { EditorPanes } from 'mote/workbench/browser/parts/editor/editorPanes';
import { DocumentEditorInput } from 'mote/workbench/contrib/documentEditor/browser/documentEditorInput';
import { CSSProperties } from 'mote/base/browser/jsx/style';

export class EditorPart extends Part implements IEditorService {

	toJSON(): object {
		throw new Error("Method not implemented.");
	}

	declare readonly _serviceBrand: undefined;

	get minimumWidth(): number {
		return 800;
	}

	get maximumWidth(): number {
		return Number.POSITIVE_INFINITY;
	}

	get minimumHeight(): number {
		return 400;
	}

	get maximumHeight(): number {
		return Number.POSITIVE_INFINITY;
	}



	//#region Events

	private readonly _onDidLayout = this._register(new Emitter<Dimension>());
	readonly onDidLayout = this._onDidLayout.event;

	private container: HTMLElement | undefined;
	private titleContainer: HTMLElement | undefined;

	private headerContainer: EditableContainer | undefined;

	private pageStore!: BlockStore;
	private listener!: IDisposable;

	private emptyHolder!: EmptyHolder;

	private editorPanes: EditorPanes;

	constructor(
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@ILogService private logService: ILogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService
	) {
		super(Parts.EDITOR_PART, { hasTitle: false }, themeService, layoutService);
		RecordCacheStore.Default.storageService = storageService;
		RecordCacheStore.Default.logService = logService;
		CommandsRegistry.registerCommand('openPage', this.openPage);
		this.container = document.createElement('div');
		this.editorPanes = this._register(this.instantiationService.createInstance(EditorPanes, this.container));
	}


	openPage = (accessor: ServicesAccessor, payload: any) => {
		this.pageStore = new BlockStore({ id: payload.id, table: 'page' }, payload.userId);
		if (this.listener) {
			this.listener.dispose();
		}

		this.updateTitle();
		this.update();
	};

	private update = () => {

		const contentStore = this.pageStore!.getContentStore();
		this.editorPanes.openEditor(new DocumentEditorInput(contentStore), {});
	};

	openEditor(editor: IResourceEditorInput): Promise<IEditorPane | undefined> {
		throw new Error('Method not implemented.');
	}

	getTitleStyle(): CSSProperties {
		return {
			color: ThemedStyles.regularTextColor.dark,
			fontWeight: 700,
			lineHeight: 1.2,
			fontSize: '40px',
			cursor: 'text',
			display: 'flex',
			alignItems: 'center',
		};
	}

	getSafePaddingLeftCSS(padding: number) {
		return `calc(${padding}px + env(safe-area-inset-left))`;
	}

	getSafePaddingRightCSS(padding: number) {
		return `calc(${padding}px + env(safe-area-inset-right))`;
	}

	updateTitle() {
		this.headerContainer!.store = this.pageStore!.getPropertyStore("title");
	}

	override createTitleArea(parent: HTMLElement, options?: object): HTMLElement | undefined {
		this.createCover(parent);
		const titleDomNode = $('.editor-header');
		this.titleContainer = $('');

		this.titleContainer.style.paddingLeft = this.getSafePaddingLeftCSS(96);
		this.titleContainer.style.paddingRight = this.getSafePaddingRightCSS(96);
		this.titleContainer.style.width = '100%';

		this.headerContainer = this.instantiationService.createInstance(EditableContainer, this.titleContainer!, {
			placeholder: 'Untitled',
			autoFocus: false,
		});

		titleDomNode.append(this.titleContainer);
		setStyles(titleDomNode, this.getTitleStyle());
		parent.append(titleDomNode);
		return titleDomNode;
	}

	override createContentArea(parent: HTMLElement) {
		// Container
		this.element = parent;
		this.element.style.backgroundColor = ThemedStyles.contentBackground.dark;

		this.container!.classList.add('content');
		//this.container.style.paddingLeft = this.getSafePaddingLeftCSS(96);
		//this.container.style.paddingRight = this.getSafePaddingRightCSS(96);
		this.container!.style.paddingTop = '25px';
		parent.appendChild(this.container!);

		this.emptyHolder = new EmptyHolder(this.container!);

		return this.container;
	}

	createCover(parent: HTMLElement) {
		const coverDomNode = $('');
		coverDomNode.style.height = '100px';
		parent.append(coverDomNode);
	}

	override updateStyles(): void {
		// Part container
		const container = assertIsDefined(this.getContainer());

		//container.style.left = "260px";
		//container.style.width = "760px";
		container.style.height = '100%';
		//container.style.left
		//container.style.backgroundColor = ThemedStyles.sidebarBackground.dark;
		//container.style.position = "absolute";
	}

	override layout(width: number, height: number, top: number, left: number): void {

		// Layout contents
		const contentAreaSize = super.layoutContents(width, height).contentSize;

		// Layout editor container
		this.doLayout(Dimension.lift(contentAreaSize), top, left);
	}

	private doLayout(dimension: Dimension, top: number, left: number): void {
		this.editorPanes.layout(dimension);
	}
}

registerSingleton(IEditorService, EditorPart);
