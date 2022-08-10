export enum Role {
	Editor = 0,
	Reader,
	CommmetOnly,
	ReadAndWrite,
}

export enum RecordTable {
	Block = 'block',
	Page = 'page',
	Space = 'space',
}

export interface RecordValue {
	id: string;
	title: string;
	table: RecordTable;
	content?: string[];
	properties?: any;
	version: number;
	last_version: number;
	type: BlockType;
	space_id?: string;
}

export interface RecordWithRole {
	role: Role;
	value: RecordValue;
}

export interface Pointer {
	table: string;
	id: string;
	spaceId?: string;
}

type Records = { [key: string]: RecordWithRole };

export type RecordMap = { [key in keyof typeof RecordTable]: Records };

export const BlockTypes = {
	text: 'text',
	header: 'header',
	image: 'image',
	quote: 'quote',
	todo: 'todo',
	code: 'code',
	heading2: 'heading2',
	heading3: 'heading3',
	bulletedList: 'bulleted_list'
};
export type BlockType = keyof typeof BlockTypes;
