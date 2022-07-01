export class Lodash {

    static identity(value) {
        return value;
    }

    static every<T>(collection: Array<T>, predicate: (value: T, index: number, collection: Iterable<T>) => boolean) {
        for (let i = 0; i < collection.length; i++) {
            if(!predicate(collection[i], i, collection)) {
                return false;
            }
        }
        return true;
    }
}