import { HorizontalPosition } from 'mote/editor/browser/view/renderingContext';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ViewController } from 'mote/editor/browser/view/viewController';
import { Position } from 'mote/editor/common/core/position';
import { ViewEventHandler } from 'mote/editor/common/viewEventHandler';

export interface IPointerHandlerHelper {
	viewDomNode: HTMLElement;
	linesContentDomNode: HTMLElement;
	viewLinesDomNode: HTMLElement;

	focusTextArea(): void;
	dispatchTextAreaEvent(event: CustomEvent): void;

	/**
	 * Get the last rendered information for cursors & textarea.
	 */
	//getLastRenderData(): PointerHandlerLastRenderData;

	shouldSuppressMouseDownOnViewZone(viewZoneId: string): boolean;
	shouldSuppressMouseDownOnWidget(widgetId: string): boolean;

	/**
	 * Decode a position from a rendered dom node
	 */
	getPositionFromDOMInfo(spanNode: HTMLElement, offset: number): Position | null;

	visibleRangeForPosition(lineNumber: number, column: number): HorizontalPosition | null;
	getLineWidth(lineNumber: number): number;
}

export class MouseHandler extends ViewEventHandler {

	constructor(
		context: ViewContext, viewController: ViewController, viewHelper: IPointerHandlerHelper
	) {
		super();
	}
}
