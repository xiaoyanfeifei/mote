import { EditorSelection } from 'mote/editor/common/core/editorSelection';

export const enum ViewEventType {
	ViewCompositionStart,
	ViewCompositionEnd,
	ViewConfigurationChanged,
	ViewCursorStateChanged,
	ViewDecorationsChanged,
	ViewFlushed,
	ViewFocusChanged,
	ViewLanguageConfigurationChanged,
	ViewLineMappingChanged,
	ViewLinesChanged,
	ViewLinesDeleted,
	ViewLinesInserted,
	ViewRevealRangeRequest,
	ViewScrollChanged,
	ViewThemeChanged,
	ViewTokensChanged,
	ViewTokensColorsChanged,
	ViewZonesChanged,
}

export class ViewCompositionStartEvent {
	public readonly type = ViewEventType.ViewCompositionStart;
	constructor() { }
}

export class ViewCompositionEndEvent {
	public readonly type = ViewEventType.ViewCompositionEnd;
	constructor() { }
}

export class ViewCursorStateChangedEvent {

	public readonly type = ViewEventType.ViewCursorStateChanged;

	public readonly selections: EditorSelection[];

	constructor(selections: EditorSelection[]) {
		this.selections = selections;
	}
}

export type ViewEvent = (
	ViewCompositionStartEvent
	| ViewCompositionEndEvent
	| ViewCursorStateChangedEvent
);
