export interface IAsyncDataSource<TInput, T> {
	hasChildren(element: TInput | T): boolean;
	getChildren(element: TInput | T): Promise<Iterable<T>>;
}