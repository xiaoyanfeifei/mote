import BlockStore from "mote/editor/common/store/blockStore";
import RecordStore from "mote/editor/common/store/recordStore";
import { getBlockByStore, TextBlock } from "mote/workbench/contrib/blocks/browser/blocks";
import { $ } from "vs/base/browser/dom";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";

export class DocumentEditor extends Disposable {

	private contentStore!: RecordStore;
	private parent: HTMLElement;
	private container: HTMLElement;

	private listener!: IDisposable;

	constructor(
		parent: HTMLElement,
		@IInstantiationService private readonly instantiationService: IInstantiationService
	) {
		super();

		this.parent = parent;
		this.container = $(".document-editor");
	}

	set store(value: RecordStore) {
		this.contentStore = value;
		if (this.listener) {
			this.listener.dispose();
		}
		this.listener = this.contentStore.onDidChange(this.create);
	}

	public show() {
		this.parent.append(this.container);
	}

	public hidden() {
		if (this.container.parentElement) {
			this.parent.removeChild(this.container);
		}
	}

	public create = () => {
		this.container.innerHTML = "";
		const pageIds: string[] = this.contentStore.getValue() || [];
		const elements = pageIds.map((pageId) => this.createElement(pageId))
		//fragment.append(...elements);
		this.container.append(...elements);
	};

	private createElement(id: string): HTMLElement {
		// Todo add empty placeholder
		return this.createBlock(id);
	}

	private createBlock(id: string): HTMLElement {
		const blockStore = this.createStoreForItemId(id);
		const block = this.instantiationService.createInstance(getBlockByStore(blockStore), {});
		block.store = blockStore;
		return block.element;
	}

	private createStoreForItemId = (id: string) => {
		return BlockStore.createChildStore(this.contentStore, {
			table: 'block',
			id: id
		});
	};
}
