export enum Role {
    Editor = 0,
    Reader,
}

export enum RecordTable {
    Block = 0,
    Page,
    Space,
}

export interface RecordValue {
    id: string;
    title: string;
    table: string;
    content?: string[];
    version: number;
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

type Records = {[key: string]: RecordWithRole}

export type RecordMap = {[key in keyof typeof RecordTable]: Records};