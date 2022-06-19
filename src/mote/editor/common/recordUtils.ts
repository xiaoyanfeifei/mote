import { Pointer } from "mote/editor/common/store/record";

export function generateKey(userId: string, pointer: Pointer) {
    const { table, id } = pointer;
    return `${table}:${id}:${userId}`;
}

