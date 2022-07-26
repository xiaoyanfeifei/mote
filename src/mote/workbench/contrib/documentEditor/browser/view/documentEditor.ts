import { EditorView } from 'mote/editor/browser/editorView';
import { ICommandDelegate } from 'mote/editor/browser/view/viewController';
import RecordStore from 'mote/editor/common/store/recordStore';
import { IEditorOptions } from 'mote/platform/editor/common/editor';
import { IThemeService } from 'mote/platform/theme/common/themeService';
import { EditorPane } from 'mote/workbench/browser/parts/editor/editorPane';
import { EditorInput } from 'mote/workbench/common/editorInput';
import { DocumentEditorInput } from 'mote/workbench/contrib/documentEditor/browser/documentEditorInput';
import { Dimension, $, reset } from 'vs/base/browser/dom';
import { BugIndicatingError } from 'vs/base/common/errors';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

export class DocumentEditor extends EditorPane {


	static ID = 'documentEditor';

	private readonly _disposables = new DisposableStore();

	private container: HTMLElement;

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
	) {
		super(DocumentEditor.ID, themeService);

		this.container = $('.document-editor');
	}

	protected createEditor(parent: HTMLElement): void {

		reset(parent, this.container);
	}

	override async setInput(input: EditorInput, options: IEditorOptions | undefined) {
		if (!(input instanceof DocumentEditorInput)) {
			throw new BugIndicatingError('ONLY DocumentEditorInput is supported');
		}

		await super.setInput(input, options);

		const [view, hasRealView] = this.createView(input.contentStore);
		if (hasRealView) {
			reset(this.container, view.domNode.domNode);

			view.render(false, false);
		}
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

		const editorView = this.instantiationService.createInstance(EditorView, commandDelegate, contentStore);
		return [editorView, true];
	}

	layout(dimension: Dimension): void {

	}
}
