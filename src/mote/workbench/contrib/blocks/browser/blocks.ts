import { CSSProperties } from "mote/base/browser/jsx";
import { setStyles } from "mote/base/browser/jsx/createElement";
import fonts from "mote/base/ui/fonts";
import { EditableContainer } from "mote/editor/browser/editableContainer";
import blockTypes from 'mote/editor/common/blockTypes';
import BlockStore from "mote/editor/common/store/blockStore";
import { BlockType } from 'mote/editor/common/store/record';
import { $ } from "vs/base/browser/dom";
import { IDisposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";

interface BlockOptions {
	placeholder?: string;
	style?: CSSProperties;
}

interface Block {
	get element(): HTMLElement;

	update(): void;
}

abstract class BaseBlock implements Block {

	private _store!: BlockStore;
	private listener!: IDisposable;

	protected options: BlockOptions;

	constructor(options: BlockOptions) {
		this.options = options;
	}

	public abstract get element(): HTMLElement;

	public abstract update(): void;

	set store(value: BlockStore) {
		this._store = value;
		if (this.listener) {
			this.listener.dispose();
		}
		this.listener = this._store.onDidChange(this.update);
	}
}

class TextBasedBlock extends BaseBlock {

	private _element: HTMLElement;

	private input: EditableContainer;

	constructor(
		options: BlockOptions,
		@IInstantiationService private readonly instantiationService: IInstantiationService
	) {
		super(options);
		this._element = $('.text-based-block');
		this.input = this.instantiationService.createInstance(
			EditableContainer,
			this._element, {
			placeholder: options.placeholder || 'Type to continue'
		});
		if (this.getStyle()) {
			setStyles(this.element, this.getStyle()!);
		}
	}

	public get element(): HTMLElement {
		return this._element;
	}

	public override set store(value: BlockStore) {
		super.store = value;
		this.input.store = value.getTitleStore();
	}

	public update(): void {

	}

	public getStyle(): void | CSSProperties {

	}
}

export class TextBlock extends TextBasedBlock {

	public override getStyle(): void | CSSProperties {
		return Object.assign({
			width: '100%',
		}, this.options.style);
	}
}


export class HeaderBlock extends TextBasedBlock {

	override getStyle() {
		return Object.assign({
			display: 'flex',
			width: '100%',
			fontWeight: fonts.fontWeight.semibold,
			fontSize: '1.875em',
			lineHeight: 1.3
		}, this.options.style);
	}
}

const container: { [key: string]: any } = {};

container[blockTypes.text] = TextBlock;
container[blockTypes.header] = HeaderBlock;

export function getBlockByStore(store: BlockStore): BaseBlock {
	const type: BlockType = store.getType() || blockTypes.text as BlockType;
	let block = container[type];
	if (!block) {
		console.error('Unmatched block type', type, store.getValue());
		block = container[blockTypes.text];
	}
	return block;
}
