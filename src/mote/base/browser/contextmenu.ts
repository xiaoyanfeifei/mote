export interface IContextMenuEvent {
	readonly shiftKey?: boolean;
	readonly ctrlKey?: boolean;
	readonly altKey?: boolean;
	readonly metaKey?: boolean;
}

export interface IContextMenuDelegate {

}

export interface IContextMenuProvider {
	showContextMenu(delegate: IContextMenuDelegate): void;
}