import { EditorView } from 'mote/editor/browser/editorView';
import { ICommandDelegate } from 'mote/editor/browser/view/viewController';
import BlockStore from 'mote/editor/common/store/blockStore';
import RecordStore from 'mote/editor/common/store/recordStore';
import { IEditorOptions } from 'mote/platform/editor/common/editor';
import { IThemeService } from 'mote/platform/theme/common/themeService';
import { EditorPane } from 'mote/workbench/browser/parts/editor/editorPane';
import { EditorInput } from 'mote/workbench/common/editorInput';
import { getBlockByStore } from 'mote/workbench/contrib/blocks/browser/blocks';
import { DocumentEditorInput } from 'mote/workbench/contrib/documentEditor/browser/documentEditorInput';
import { Dimension, $, clearNode, reset } from 'vs/base/browser/dom';
import { IListRenderer, IListVirtualDelegate, CachedListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { ListView } from 'vs/base/browser/ui/list/listView';
import { BugIndicatingError } from 'vs/base/common/errors';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

class BlockListVirtualDelegate extends CachedListVirtualDelegate<BlockStore> implements IListVirtualDelegate<BlockStore> {

	protected estimateHeight(element: BlockStore): number {
		return 20;
	}

	hasDynamicHeight(element: BlockStore) {
		return true;
	}

	getTemplateId(element: BlockStore): string {
		return 'text';
	}

}

class BlockListRenderer implements IListRenderer<BlockStore, any> {
	templateId: string = 'text';

	private cache = new WeakMap<BlockStore, string>();

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
	) {

	}

	renderTemplate(container: HTMLElement) {
		return container;
	}

	renderElement(element: BlockStore, index: number, templateData: HTMLElement, height: number | undefined): void {
		const blockType = element.getType() || '';
		const cachedType = this.cache.get(element);


		if (!cachedType) {
			this.cache.set(element, blockType);
			const block = this.instantiationService.createInstance(getBlockByStore(element), {});
			block.store = element;
			clearNode(templateData);
			templateData.appendChild(block.element);
			return;
		}
		if (cachedType !== blockType) {
			const block = this.instantiationService.createInstance(getBlockByStore(element), {});
			block.store = element;
			clearNode(templateData);
			templateData.appendChild(block.element);
			return;
		}
	}
	disposeTemplate(templateData: any): void {

	}


}

export class DocumentEditor extends EditorPane {

	static ID = 'documentEditor';

	private contentStore!: RecordStore;
	private readonly _disposables = new DisposableStore();

	private container: HTMLElement;

	private view: ListView<BlockStore>;

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
	) {
		super(DocumentEditor.ID, themeService);

		this.container = $('.document-editor');
		const renderer = this.instantiationService.createInstance(BlockListRenderer);
		this.view = new ListView<BlockStore>(
			this.container,
			new BlockListVirtualDelegate(),
			[renderer],
			{ setRowHeight: false, supportDynamicHeights: true }
		);
	}

	protected createEditor(parent: HTMLElement): void {

		reset(parent, this.container);
	}

	override async setInput(input: EditorInput, options: IEditorOptions | undefined) {
		if (!(input instanceof DocumentEditorInput)) {
			throw new BugIndicatingError('ONLY DocumentEditorInput is supported');
		}

		await super.setInput(input, options);

		this.contentStore = input.contentStore;

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

	private createStoreForItemId = (id: string) => {
		return BlockStore.createChildStore(this.contentStore, {
			table: 'block',
			id: id
		});
	};

	private registerListener() {
		this.onChange();
		this._disposables.add(this.contentStore.onDidChange(() => {
			console.log('conteng update..');
			this.onChange();
		}));

	}

	private onChange() {
		this._disposables.clear();
		const pageIds: string[] = this.contentStore.getValue() || [];
		const elements = pageIds.map((pageId) => this.createStoreForItemId(pageId));
		elements.forEach((element, idx) => {
			this._disposables.add(element.onDidChange(() => this.view.rerenderElement(idx)));
		});
		this.view.splice(0, this.view.length, elements);
	}

	layout(dimension: Dimension): void {
		this.view.layout(dimension.height, dimension.width);
	}
}
