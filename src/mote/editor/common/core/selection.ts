export interface TextSelection {
    startIndex: number;
    endIndex: number;
}

export enum TextSelectionMode {
    Empty = 0,
    Editing,
    ReadOnly,
}