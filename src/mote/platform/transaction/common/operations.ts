export enum Command {
    Update = 0,
    Set,
    ListBefore,
    ListAfter,
    ListRemove
}

export interface Operation {
    id: string;
    table: string;
    path: string[];
    command: Command;
    size?: number;
    args: any;
}