import { IPointerHandlerHelper } from 'mote/editor/browser/controller/mouseHandler';
import { IMouseTarget, IMouseTargetUnknown, MouseTargetType } from 'mote/editor/browser/editorBrowser';
import { ClientCoordinates, CoordinatesRelativeToEditor, EditorPagePosition, PageCoordinates } from 'mote/editor/browser/editorDom';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { PartFingerprints } from 'mote/editor/browser/view/viewPart';
import { EditorRange } from 'mote/editor/common/core/editorRange';
import { Position } from 'mote/editor/common/core/position';

const enum HitTestResultType {
	Unknown,
	Content,
}

class UnknownHitTestResult {
	readonly type = HitTestResultType.Unknown;
	constructor(
		readonly hitTarget: Element | null = null
	) { }
}

class ContentHitTestResult {
	readonly type = HitTestResultType.Content;
	constructor(
		readonly position: Position,
		readonly spanNode: HTMLElement,
		readonly injectedText: any | null,
	) { }
}

type HitTestResult = UnknownHitTestResult | ContentHitTestResult;

export class PointerHandlerLastRenderData {
	constructor(
		//public readonly lastViewCursorsRenderData: IViewCursorRenderData[],
		public readonly lastTextareaPosition: Position | null
	) { }
}

export class MouseTarget {

	private static deduceRage(position: Position): EditorRange;
	private static deduceRage(position: Position, range: EditorRange | null): EditorRange;
	private static deduceRage(position: Position | null): EditorRange | null;
	private static deduceRage(position: Position | null, range: EditorRange | null = null): EditorRange | null {
		if (!range && position) {
			return new EditorRange(position.lineNumber, position.column, position.lineNumber, position.column);
		}
		return range ?? null;
	}

	public static createUnknown(element: Element | null, mouseColumn: number, position: Position | null): IMouseTargetUnknown {
		return { type: MouseTargetType.UNKNOWN, element, mouseColumn, position, range: this.deduceRage(position) };
	}
}

export class MouseTargetFactory {
	private readonly context: ViewContext;
	private readonly viewHelper: IPointerHandlerHelper;

	private static createMouseTarget(ctx: HitTestContext, request: HitTestRequest, domHitTestExecuted: boolean): IMouseTarget {
		// First ensure the request has a target
		if (request.target === null) {
			if (domHitTestExecuted) {
				// Still no target... and we have already executed hit test...
				return request.fulfillUnknown();
			}

			const hitTestResult = MouseTargetFactory.doHitTest(ctx, request);

			if (hitTestResult.type === HitTestResultType.Content) {
				return MouseTargetFactory.createMouseTargetFromHitTestPosition(ctx, request, hitTestResult.spanNode, hitTestResult.position, hitTestResult.injectedText);
			}

			return this.createMouseTarget(ctx, request.withTarget(hitTestResult.hitTarget), true);
		}
		return null as any;
	}
	static createMouseTargetFromHitTestPosition(ctx: HitTestContext, request: HitTestRequest, spanNode: HTMLElement, position: Position, injectedText: any): IMouseTarget {
		throw new Error('Method not implemented.');
	}

	private static doHitTest(ctx: HitTestContext, request: BareHitTestRequest): HitTestResult {

		let result: HitTestResult = new UnknownHitTestResult();
		if (typeof (<any>document).caretRangeFromPoint === 'function') {
			result = this.doHitTestWithCaretRangeFromPoint(ctx, request);
		} else if ((<any>document).caretPositionFromPoint) {
			//result = this._doHitTestWithCaretPositionFromPoint(ctx, request.pos.toClientCoordinates());
		}
		if (result.type === HitTestResultType.Content) {
			const injectedText = ' ';

			const normalizedPosition = result.position;
			if (injectedText || !normalizedPosition.equals(result.position)) {
				result = new ContentHitTestResult(normalizedPosition, result.spanNode, injectedText);
			}
		}
		return result;
	}

	/**
	 * Most probably WebKit browsers and Edge
	 */
	private static doHitTestWithCaretRangeFromPoint(ctx: HitTestContext, request: BareHitTestRequest): HitTestResult {

		// In Chrome, especially on Linux it is possible to click between lines,
		// so try to adjust the `hity` below so that it lands in the center of a line
		const lineNumber = 0;
		const lineVerticalOffset = ctx.getVerticalOffsetForLineNumber(lineNumber);
		const lineCenteredVerticalOffset = lineVerticalOffset + Math.floor(ctx.lineHeight / 2);
		let adjustedPageY = request.pos.y + (lineCenteredVerticalOffset - request.mouseVerticalOffset);

		if (adjustedPageY <= request.editorPos.y) {
			adjustedPageY = request.editorPos.y + 1;
		}
		if (adjustedPageY >= request.editorPos.y + request.editorPos.height) {
			adjustedPageY = request.editorPos.y + request.editorPos.height - 1;
		}

		const adjustedPage = new PageCoordinates(request.pos.x, adjustedPageY);

		const r = this.actualDoHitTestWithCaretRangeFromPoint(ctx, adjustedPage.toClientCoordinates());
		if (r.type === HitTestResultType.Content) {
			return r;
		}

		// Also try to hit test without the adjustment (for the edge cases that we are near the top or bottom)
		return this.actualDoHitTestWithCaretRangeFromPoint(ctx, request.pos.toClientCoordinates());
	}
	static actualDoHitTestWithCaretRangeFromPoint(ctx: HitTestContext, arg1: ClientCoordinates): HitTestResult {
		throw new Error('Method not implemented.');
	}

	constructor(context: ViewContext, viewHelper: IPointerHandlerHelper) {
		this.context = context;
		this.viewHelper = viewHelper;
	}

	public createMouseTarget(
		lastRenderData: PointerHandlerLastRenderData,
		editorPos: EditorPagePosition,
		pos: PageCoordinates,
		relativePos: CoordinatesRelativeToEditor,
		target: HTMLElement | null
	): IMouseTarget {
		const ctx = new HitTestContext(this.context, this.viewHelper, lastRenderData);
		const request = new HitTestRequest(ctx, editorPos, pos, relativePos, target);
		try {
			const r = MouseTargetFactory.createMouseTarget(ctx, request, false);
			// console.log(MouseTarget.toString(r));
			return r;
		} catch (err) {
			// console.log(err);
			return request.fulfillUnknown();
		}
	}
}

abstract class BareHitTestRequest {
	constructor(
		protected ctx: HitTestContext,
		public readonly editorPos: EditorPagePosition,
		public readonly pos: PageCoordinates,
		public readonly relativePos: CoordinatesRelativeToEditor
	) { }

}

class HitTestRequest extends BareHitTestRequest {

	public readonly target: Element | null;
	public readonly targetPath: Uint8Array;

	constructor(
		ctx: HitTestContext,
		editorPos: EditorPagePosition,
		pos: PageCoordinates,
		relativePos: CoordinatesRelativeToEditor,
		target: Element | null
	) {
		super(ctx, editorPos, pos, relativePos);

		if (target) {
			this.target = target;
			this.targetPath = PartFingerprints.collect(target, ctx.viewDomNode);
		} else {
			this.target = null;
			this.targetPath = new Uint8Array(0);
		}
	}

	public fulfillUnknown(position: Position | null = null): IMouseTargetUnknown {
		return MouseTarget.createUnknown(this.target, this.getMouseColumn(position), position);
	}
	getMouseColumn(position: Position | null): number {
		throw new Error('Method not implemented.');
	}

	public withTarget(target: Element | null): HitTestRequest {
		return new HitTestRequest(this.ctx, this.editorPos, this.pos, this.relativePos, target);
	}
}

export class HitTestContext {

	public readonly viewDomNode: HTMLElement;

	constructor(
		context: ViewContext,
		viewHelper: IPointerHandlerHelper,
		lastRenderData: PointerHandlerLastRenderData
	) {
		this.viewDomNode = viewHelper.viewDomNode;
	}
}
