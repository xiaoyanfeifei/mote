import { EditorRange } from 'mote/editor/common/core/editorRange';
import { Position } from 'mote/editor/common/core/position';
import * as editorCommon from 'mote/editor/common/editorCommon';

/**
 * Type of hit element with the mouse in the editor.
 */
export const enum MouseTargetType {
	/**
	 * Mouse is on top of an unknown element.
	 */
	UNKNOWN,
	/**
	 * Mouse is on top of the glyph margin
	 */
	GUTTER_GLYPH_MARGIN,
	/**
	 * Mouse is on top of the line numbers
	 */
	GUTTER_LINE_NUMBERS,
	/**
	 * Mouse is on top of the line decorations
	 */
	GUTTER_LINE_DECORATIONS,
	/**
	 * Mouse is on top of the whitespace left in the gutter by a view zone.
	 */
	GUTTER_VIEW_ZONE,
	/**
	 * Mouse is on top of text in the content.
	 */
	CONTENT_TEXT,
	/**
	 * Mouse is on top of empty space in the content (e.g. after line text or below last line)
	 */
	CONTENT_EMPTY,
	/**
	 * Mouse is on top of a view zone in the content.
	 */
	CONTENT_VIEW_ZONE,
	/**
	 * Mouse is on top of a content widget.
	 */
	CONTENT_WIDGET,
	/**
	 * Mouse is on top of the decorations overview ruler.
	 */
	OVERVIEW_RULER,
	/**
	 * Mouse is on top of a scrollbar.
	 */
	SCROLLBAR,
	/**
	 * Mouse is on top of an overlay widget.
	 */
	OVERLAY_WIDGET,
	/**
	 * Mouse is outside of the editor.
	 */
	OUTSIDE_EDITOR,
}

export interface IBaseMouseTarget {
	/**
	 * The target element
	 */
	readonly element: Element | null;
	/**
	 * The 'approximate' editor position
	 */
	readonly position: Position | null;
	/**
	 * Desired mouse column (e.g. when position.column gets clamped to text length -- clicking after text on a line).
	 */
	readonly mouseColumn: number;
	/**
	 * The 'approximate' editor range
	 */
	readonly range: EditorRange | null;
}

export interface IMouseTargetUnknown extends IBaseMouseTarget {
	readonly type: MouseTargetType.UNKNOWN;
}

export interface IMouseTargetContentTextData {
	readonly mightBeForeignElement: boolean;
	/**
	 * @internal
	 */
	readonly injectedText: any | null;
}

export interface IMouseTargetContentText extends IBaseMouseTarget {
	readonly type: MouseTargetType.CONTENT_TEXT;
	readonly position: Position;
	readonly range: EditorRange;
	readonly detail: IMouseTargetContentTextData;
}

/**
 * Target hit with the mouse in the editor.
 */
export type IMouseTarget = (
	IMouseTargetUnknown
	| IMouseTargetContentText
);


/**
 * A rich code editor.
 */
export interface IMoteEditor extends editorCommon.IEditor {

}
