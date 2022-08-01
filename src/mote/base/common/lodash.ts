export class Lodash {
	static isEqual(value: any, other: any): boolean {
		if (value === other) {
			return true;
		}
		else if ((typeof value === 'object' && value !== null) && (typeof other === 'object' && other !== null)) {
			if (Object.keys(value).length !== Object.keys(other).length) {
				return false;
			}
			for (const prop in value) {
				if (other.hasOwnProperty(prop)) {
					if (!this.isEqual(value[prop], other[prop])) {
						return false;
					}
				}
				else {
					return false;
				}
			}

			return true;
		}
		return false;
	}
	static uniqWith<T>(collection: ArrayLike<T>, comparator: (value: T, other: T) => boolean) {
		const result: T[] = [];
		for (let i = 0; i < collection.length; i++) {
			for (let j = i + 1; i < collection.length; j++) {
				if (comparator(collection[i], collection[j])) {
					break;
				}
			}
			result.push(collection[i]);
		}
		return result;
	}

	static find<T>(collection: ArrayLike<T>, predicate: (value: T, index: number, collection: ArrayLike<T>) => boolean) {
		for (let i = 0; i < collection.length; i++) {
			if (predicate(collection[i], i, collection)) {
				return collection[i];
			}
		}
		return undefined;
	}

	static findIndex<T>(collection: ArrayLike<T>, predicate: (value: T, index: number, collection: ArrayLike<T>) => boolean) {
		for (let i = 0; i < collection.length; i++) {
			if (predicate(collection[i], i, collection)) {
				return i;
			}
		}
		return -1;
	}

	static every<T>(collection: Array<T>, predicate: (value: T, index: number, collection: ArrayLike<T>) => boolean) {
		for (let i = 0; i < collection.length; i++) {
			if (!predicate(collection[i], i, collection)) {
				return false;
			}
		}
		return true;
	}
}
