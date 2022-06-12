import { IAsyncDataSource } from "mote/base/browser/ui/tree/tree";
import { IListStyles } from "vs/base/browser/ui/list/listWidget";
import { IDisposable } from "vs/base/common/lifecycle";
import { IThemable, styleFn } from "vs/base/common/styler";

interface IAsyncDataTreeNode<TInput, T> {
	element: TInput | T;
    readonly id?: string | null;
}

export class AsyncDataTree<TInput, T> implements IDisposable, IThemable {
    

    constructor(
        container: HTMLElement,
        private dataSource: IAsyncDataSource<TInput, T>,
    )
    {
       
    }

    createTree(
        container: HTMLElement,
    ) {

    }

    style(styles: IListStyles): void {
		//this.tree.style(styles);
	}

    dispose(): void {
        throw new Error("Method not implemented.");
    }
    
}