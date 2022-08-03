import * as dom from 'vs/base/browser/dom';
import * as viewEvents from 'mote/editor/common/viewEvents';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ICommandDelegate, ViewController } from 'mote/editor/browser/view/viewController';
import { ViewPart } from 'mote/editor/browser/view/viewPart';
import { ViewLines } from 'mote/editor/browser/viewParts/lines/viewLines';
import { ViewEventHandler } from 'mote/editor/common/viewEventHandler';
import { createFastDomNode, FastDomNode } from 'vs/base/browser/fastDomNode';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { onUnexpectedError } from 'vs/base/common/errors';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ViewportData } from 'mote/editor/common/viewLayout/viewLinesViewportData';
import { CSSProperties } from 'mote/base/browser/jsx/style';
import { ThemedStyles } from 'mote/base/common/themes';
import { setStyles } from 'mote/base/browser/jsx/createElement';
import BlockStore from 'mote/platform/store/common/blockStore';
import { ViewBlock } from 'mote/editor/browser/viewParts/lines/viewLine';

export class EditorView extends ViewEventHandler {

	private readonly context: ViewContext;

	private readonly viewParts: ViewPart[];
	private readonly viewLines: ViewLines;

	// Dom nodes
	public readonly domNode: FastDomNode<HTMLElement>;
	private readonly linesContent: FastDomNode<HTMLElement>;

	constructor(
		commandDelegate: ICommandDelegate,
		viewController: ViewController,
		private readonly pageStore: BlockStore,
		@IInstantiationService private instantiationService: IInstantiationService,
	) {
		super();

		this.domNode = createFastDomNode(document.createElement('div'));

		// These two dom nodes must be constructed up front, since references are needed in the layout provider (scrolling & co.)
		this.linesContent = createFastDomNode(document.createElement('div'));
		this.linesContent.setClassName('lines-content' + ' monaco-editor-background');
		this.linesContent.domNode.style.paddingLeft = this.getSafePaddingLeftCSS(96);
		this.linesContent.domNode.style.paddingRight = this.getSafePaddingRightCSS(96);

		const contentStore = pageStore.getContentStore();
		this.context = new ViewContext(contentStore, viewController);

		// Ensure the view is the first event handler in order to update the layout
		this.context.addEventHandler(this);

		this.viewParts = [];

		this.viewLines = this.instantiationService.createInstance(ViewLines, this.context, viewController, this.linesContent);


		this.linesContent.appendChild(this.viewLines.getDomNode());

		this.createHeader(this.domNode, viewController);
		this.domNode.appendChild(this.linesContent);
	}

	createHeader(parent: FastDomNode<HTMLElement>, viewController: ViewController,) {
		this.createCover(parent);
		const headerDomNode = createFastDomNode(dom.$('.editor-header'));
		const headerContainer = createFastDomNode<HTMLDivElement>(dom.$(''));

		headerContainer.domNode.style.paddingLeft = this.getSafePaddingLeftCSS(96);
		headerContainer.domNode.style.paddingRight = this.getSafePaddingRightCSS(96);
		headerContainer.domNode.style.width = '100%';

		const headerHandler = new ViewBlock(-1, this.context, viewController, {
			placeholder: 'Untitled', forcePlaceholder: true
		});
		headerHandler.setValue(this.pageStore);
		headerContainer.appendChild(headerHandler.getDomNode());

		headerDomNode.appendChild(headerContainer);
		setStyles(headerDomNode.domNode, this.getTitleStyle());
		parent.appendChild(headerDomNode);
	}


	createCover(parent: FastDomNode<HTMLElement>) {
		const coverDomNode = createFastDomNode(dom.$(''));
		coverDomNode.domNode.style.height = '100px';
		parent.appendChild(coverDomNode);
	}

	//#region event handlers

	public override handleEvents(events: viewEvents.ViewEvent[]): void {
		super.handleEvents(events);
		this.scheduleRender();
	}

	//#endregion

	public render(now: boolean, everything: boolean): void {
		if (everything) {
			// Force everything to render...
			this.viewLines.forceShouldRender();
			for (const viewPart of this.viewParts) {
				viewPart.forceShouldRender();
			}
		}
		if (now) {
			this.flushAccumulatedAndRenderNow();
		} else {
			this.scheduleRender();
		}
	}

	// Actual mutable state
	private renderAnimationFrame: IDisposable | null = null;

	private scheduleRender(): void {
		if (this.renderAnimationFrame === null) {
			this.renderAnimationFrame = dom.runAtThisOrScheduleAtNextAnimationFrame(this.onRenderScheduled.bind(this), 100);
		}
	}

	private onRenderScheduled(): void {
		this.renderAnimationFrame = null;
		this.flushAccumulatedAndRenderNow();
	}

	private flushAccumulatedAndRenderNow(): void {
		this.renderNow();
	}

	private renderNow(): void {
		safeInvokeNoArg(() => this.actualRender());
	}

	private actualRender(): void {
		if (!dom.isInDOM(this.domNode.domNode)) {
			return;
		}

		let viewPartsToRender = this.getViewPartsToRender();


		if (!this.viewLines.shouldRender() && viewPartsToRender.length === 0) {
			// Nothing to render
			return;
		}

		const viewportData = new ViewportData();

		if (this.viewLines.shouldRender()) {
			this.viewLines.renderLines(viewportData);
			this.viewLines.onDidRender();

			// Rendering of viewLines might cause scroll events to occur, so collect view parts to render again
			viewPartsToRender = this.getViewPartsToRender();
		}

		// Render the rest of the parts
		for (const viewPart of viewPartsToRender) {
			viewPart.prepareRender();
		}

		for (const viewPart of viewPartsToRender) {
			viewPart.render();
			viewPart.onDidRender();
		}
	}

	private getViewPartsToRender(): ViewPart[] {
		const result: ViewPart[] = [];
		let resultLen = 0;
		for (const viewPart of this.viewParts) {
			if (viewPart.shouldRender()) {
				result[resultLen++] = viewPart;
			}
		}
		return result;
	}

	getSafePaddingLeftCSS(padding: number) {
		return `calc(${padding}px + env(safe-area-inset-left))`;
	}

	getSafePaddingRightCSS(padding: number) {
		return `calc(${padding}px + env(safe-area-inset-right))`;
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
}

function safeInvokeNoArg(func: Function): any {
	try {
		return func();
	} catch (e) {
		onUnexpectedError(e);
	}
}
