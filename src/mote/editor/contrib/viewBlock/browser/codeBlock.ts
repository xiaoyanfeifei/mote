import 'vs/css!./media/prism';
import { Prism } from 'mote/base/browser/prism/prism.all';
import { EditableHandler } from 'mote/editor/browser/controller/editableHandler';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ViewController } from 'mote/editor/browser/view/viewController';
import { BaseBlock } from 'mote/editor/contrib/viewBlock/browser/baseBlock';
import { BlockTypes } from 'mote/platform/store/common/record';
import { createFastDomNode, FastDomNode } from 'vs/base/browser/fastDomNode';
import { CSSProperties } from 'mote/base/browser/jsx/style';
import { ThemedStyles } from 'mote/base/common/themes';
import { setStyles } from 'mote/base/browser/jsx/createElement';
import BlockStore from 'mote/platform/store/common/blockStore';
import { collectValueFromSegment } from 'mote/editor/common/segmentUtils';

export class CodeBlock extends BaseBlock {

	public static readonly ID = BlockTypes.code;

	private container!: FastDomNode<HTMLElement>;

	renderPersisted(lineNumber: number, viewContext: ViewContext, viewController: ViewController): EditableHandler {
		this.container = createFastDomNode(document.createElement('div'));
		this.container.domNode.style.display = 'flex';

		const blockContainer = createFastDomNode(document.createElement('div'));
		setStyles(blockContainer.domNode, this.getContainerStyle());

		const codeContainer = createFastDomNode(document.createElement('div'));
		codeContainer.setClassName('line-numbers');

		const editableHandler = new EditableHandler(lineNumber, viewContext, {
			type: viewController.type.bind(viewController),
			compositionType: viewController.compositionType.bind(viewController),
			backspace: viewController.backspace.bind(viewController),
			// prevent default enter behavior
			enter: () => { viewController.insert('\n'); return false; },
			select: viewController.select.bind(viewController),
			isEmpty: viewController.isEmpty.bind(viewController),
			getSelection: viewController.getSelection.bind(viewController),
		}, {});
		setStyles(editableHandler.editable.domNode, this.getContentEditableStyle());

		codeContainer.appendChild(editableHandler.editable);
		blockContainer.appendChild(codeContainer);
		this.container.appendChild(blockContainer);
		return editableHandler;
	}

	override setValue(store: BlockStore) {
		const code = collectValueFromSegment(store.getTitleStore().getValue());
		const highlightHtml = Prism.highlight(code, Prism.languages['javascript'], 'javascript');
		this.editableHandler.setValue(highlightHtml);
		this.editableHandler.setEnabled(store.canEdit());
	}

	private getContentEditableStyle(): CSSProperties {
		return {
			flexGrow: 1,
			flexShrink: 1,
			textAlign: 'left',
			fontSize: '85%',
			tabSize: 2,
			padding: '34px 16px 32px 32px',
			minHeight: '1em',
			color: ThemedStyles.regularTextColor.light
		};
	}

	private getContainerStyle(): CSSProperties {
		return {
			flexGrow: '1px',
			borderRadius: '3px',
			textAlign: 'left',
			position: 'relative',
			background: ThemedStyles.codeBlockBackground.light,
			minWidth: '0px',
			width: '100%'
		};
	}

	override getDomNode() {
		return this.container;
	}
}
