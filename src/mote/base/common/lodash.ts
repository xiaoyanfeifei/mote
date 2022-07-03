export class Lodash {

    static identity(value) {
        return value;
    }

    static findIndex<T>(collection: ArrayLike<T>, predicate: (value: T, index: number, collection: ArrayLike<T>) => boolean) {
        for (let i = 0; i < collection.length; i++) {
            if(!predicate(collection[i], i, collection)) {
                return i;
            }
        }
        return -1;
    }

    static every<T>(collection: Array<T>, predicate: (value: T, index: number, collection: ArrayLike<T>) => boolean) {
        for (let i = 0; i < collection.length; i++) {
            if(!predicate(collection[i], i, collection)) {
                return false;
            }
        }
        return true;
    }
}