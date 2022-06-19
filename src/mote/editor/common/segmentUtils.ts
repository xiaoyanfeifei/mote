
export type Annotation = [string];

export type Segment = [string, Annotation[]?];

export function getFirstInArray<T>(e:T[]) {
    return e[0]
}

export function getSecondArrayInArray(e:any[]) {
    return e && e[1] && e[1] || []
}

export function combineArray(e:any, t: any[]) {
    return t && t.length > 0 ? [e, t] : [e];
}

export function emptyOrArray<T>(e?: T[]) {
    return e && Array.isArray(e) ? e : [];
}

function sliceArray(content: string[], startIndex: number, endIndex?: number) {
    return content.slice(Math.max(0, startIndex), endIndex);
}

export function merge(record: Segment[], segments: Segment[], startIndex: number) {
    record = emptyOrArray(record);
    if (record.length > 0) {
        const newRecord: Segment[] = [];
        let bias = 0;
        let flag = false;
        for (const segment of record) {
            const content = getFirstInArray(segment) as string;
            const annotations = getSecondArrayInArray(segment) as Annotation[];
            const contentInArray = Array.from(content);
            let currentBias = bias;
            let endIndex = bias + contentInArray.length;
            if (startIndex >= currentBias && startIndex <= endIndex && !flag) {
                const index = startIndex - currentBias;
                const contentBefore = sliceArray(contentInArray, 0, index);
                const contentAfter = sliceArray(contentInArray, index);
                if (contentBefore.length > 0) {
                    newRecord.push(combineArray(contentBefore.join(""), annotations) as Segment);
                }
                for (const newSegment of segments) {
                    newRecord.push(newSegment);
                }
                if (contentAfter.length > 0) {
                    newRecord.push(combineArray(contentAfter.join(""), annotations) as Segment);
                }
                flag = true;
            } else {
                newRecord.push(segment);
            }
            bias = endIndex;
        }
        return newRecord;
    }
    return segments;
}

export function remove(record: Segment[], startIndex: number, endIndex: number) {
    record = emptyOrArray(record);
    const newRecord: Segment[] = [];
    let offset = 0;
    for (const segment of record) {
        const content = getFirstInArray(segment) as string;
        const annotations = getSecondArrayInArray(segment) as Annotation[];
        const contentInArray = Array.from(content);
        let currentOffset = offset;
        let currentEndIndex = offset + contentInArray.length;
        // case 1: the content that need to removed not in current segment
        if (currentEndIndex <= startIndex && currentEndIndex <= endIndex || currentOffset >= startIndex && currentOffset >= endIndex) {
            newRecord.push(segment);
        }
        // case 2: the content that need to removed in current segment
        else if (currentOffset >= startIndex && currentEndIndex <= endIndex) {
            // skip to add it to new record
        }
        else {
            const currentStartIndex = startIndex - currentOffset;
            const currentEndIndex = currentStartIndex + endIndex - startIndex;
            const newContent = contentInArray.filter((char, idx)=>!(idx >= currentStartIndex && idx <= currentEndIndex - 1));
            newRecord.push(combineArray(newContent.join(""), annotations) as Segment);
        }
        offset = currentEndIndex;
    }
    return newRecord;
}

export function slice(record: Segment[], startIndex: number, endIndex: number) {
    record = emptyOrArray(record);
    const newRecord: Segment[] = [];
    let recordOffset = 0;
    let offset = 0;
    while (recordOffset < record.length && offset < endIndex) {
        const segment = record[recordOffset];
        if (offset >= startIndex) {
            const contentInArray = Array.from(getFirstInArray(segment) as any) as string[];
            if (!(offset + contentInArray.length <= endIndex)) {
                const annotations = getSecondArrayInArray(segment) as Annotation[];
                const index = endIndex - offset;
                const content = contentInArray.slice(0, index).join("");
                newRecord.push(combineArray(content, annotations) as Segment);
                break;
            }
            newRecord.push(segment);
            offset += contentInArray.length;
            recordOffset += 1;
        } else {
            const contentInArray = Array.from(getFirstInArray(segment) as any) as string[];
            if (offset + contentInArray.length > startIndex) {
                const annotations = getSecondArrayInArray(segment) as Annotation[];
                if (!(offset + contentInArray.length <= endIndex)) {
                    const currentStartIndex = startIndex - offset;
                    const currentEndIndex = endIndex - offset;
                    const content = contentInArray.slice(currentStartIndex, currentEndIndex).join("");
                    newRecord.push(combineArray(content, annotations) as Segment);
                    break;
                }
                const currentStartIndex = startIndex - offset;
                const content = contentInArray.slice(currentStartIndex).join("");
                newRecord.push(combineArray(content, annotations) as Segment);
                offset += contentInArray.length;
                recordOffset += 1;
            } else {
                offset += contentInArray.length;
                recordOffset += 1;
            }
        }
    }
    return newRecord;
}