import { EditorView } from 'mote/editor/browser/editorView';
import { ICommandDelegate, ViewController } from 'mote/editor/browser/view/viewController';
import RecordStore from 'mote/editor/common/store/recordStore';
import { IEditorOptions } from 'mote/platform/editor/common/editor';
import { IThemeService } from 'mote/platform/theme/common/themeService';
import { EditorPane } from 'mote/workbench/browser/parts/editor/editorPane';
import { EditorInput } from 'mote/workbench/common/editorInput';
import { DocumentEditorInput } from 'mote/workbench/contrib/documentEditor/browser/documentEditorInput';
import { Dimension, $, reset, clearNode } from 'vs/base/browser/dom';
import { BugIndicatingError } from 'vs/base/common/errors';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { OutgoingViewEventKind, SelectionChangedEvent } from 'mote/editor/common/viewEventDispatcher';
import { IQuickMenuService } from 'mote/workbench/services/quickmenu/browser/quickmenu';
import { StoreUtils } from 'mote/editor/common/store/storeUtils';
import { TextSelectionMode } from 'mote/editor/common/core/selectionUtils';
import { IAction } from 'vs/base/common/actions';
import { CSSProperties } from 'mote/base/browser/jsx/style';
import { ThemedStyles } from 'mote/base/common/themes';
import { EditableContainer } from 'mote/editor/browser/editableContainer';
import { setStyles } from 'mote/base/browser/jsx/createElement';


export class DocumentEditor extends EditorPane {


	static ID = 'documentEditor';

	private readonly _disposables = new DisposableStore();

	private container: HTMLElement;
	private headerContainer: HTMLElement | undefined;

	private titleContainer: EditableContainer | undefined;
	private viewController!: ViewController;

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@IQuickMenuService private quickMenuService: IQuickMenuService,
	) {
		super(DocumentEditor.ID, themeService);

		this.container = $('.document-editor');
	}

	protected createEditor(parent: HTMLElement): void {

		reset(parent, this.container);
	}

	createHeader(parent: HTMLElement) {
		this.createCover(parent);
		const headerDomNode = $('.editor-header');
		this.headerContainer = $('');

		this.headerContainer.style.paddingLeft = this.getSafePaddingLeftCSS(96);
		this.headerContainer.style.paddingRight = this.getSafePaddingRightCSS(96);
		this.headerContainer.style.width = '100%';

		headerDomNode.append(this.headerContainer);
		setStyles(headerDomNode, this.getTitleStyle());
		parent.append(headerDomNode);
	}

	createCover(parent: HTMLElement) {
		const coverDomNode = $('');
		coverDomNode.style.height = '100px';
		parent.append(coverDomNode);
	}

	override async setInput(input: EditorInput, options: IEditorOptions | undefined) {
		if (!(input instanceof DocumentEditorInput)) {
			throw new BugIndicatingError('ONLY DocumentEditorInput is supported');
		}

		await super.setInput(input, options);

		const [view, hasRealView] = this.createView(input.pageStore.getContentStore());
		if (hasRealView) {
			clearNode(this.container);
			this.createHeader(this.container);
			view.domNode.domNode.style.paddingTop = '25px';
			this.container.appendChild(view.domNode.domNode);

			view.render(false, false);
		}


		this.titleContainer = this.instantiationService.createInstance(EditableContainer, this.headerContainer!, {
			placeholder: 'Untitled',
			autoFocus: false,
		});
		this.titleContainer!.store = input.pageStore!.getPropertyStore('title');
	}

	private createView(contentStore: RecordStore): [EditorView, boolean] {
		const commandDelegate: ICommandDelegate = {
			type: (text: string) => {
				//this._type('keyboard', text);
			},
			compositionType: (text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number) => {
				//this._compositionType('keyboard', text, replacePrevCharCnt, replaceNextCharCnt, positionDelta);
			},
		};

		const viewController = new ViewController(contentStore);
		this.viewController = viewController;

		this._disposables.dispose();

		this._disposables.add(viewController.onEvent((e) => {
			switch (e.kind) {
				case OutgoingViewEventKind.SelectionChanged:
					this.showQuickMenu(e, contentStore);
					break;
			}
		}));

		const editorView = this.instantiationService.createInstance(EditorView, commandDelegate, viewController, contentStore);
		return [editorView, true];
	}

	private showQuickMenu(e: SelectionChangedEvent, contentStore: RecordStore) {
		if (e.selection.startIndex === e.selection.endIndex) {
			return;
		}
		const actions: IAction[] = [];
		actions.push({
			id: 'quick.bold',
			label: 'B',
			tooltip: 'Bold',
			run: () => this.viewController.decorate(['b']),
			enabled: true,
			class: '',
			dispose: () => { }
		});

		actions.push({
			id: 'quick.italic',
			label: 'I',
			tooltip: 'Italic',
			run: () => this.viewController.decorate(['i']),
			enabled: true,
			class: 'italic',
			dispose: () => { }
		});
		actions.push({
			id: 'quick.underline',
			label: 'U',
			tooltip: 'Underline',
			run: () => this.viewController.decorate(['_']),
			enabled: true,
			class: 'italic',
			dispose: () => { }
		});

		this.quickMenuService.showQuickMenu({
			getActions: () => actions,
			state: {
				selection: e.selection,
				store: StoreUtils.createStoreForLineNumber(e.selection.lineNumber, contentStore).getTitleStore(),
				mode: TextSelectionMode.Editing
			}
		});
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

	layout(dimension: Dimension): void {

	}
}
