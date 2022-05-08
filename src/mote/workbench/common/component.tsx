import { Disposable } from "vs/base/common/lifecycle";

export class Component extends Disposable {
    constructor(
		private readonly id: string
    ) {
        super();
    }

    getId(): string {
		  return this.id;
	}
}