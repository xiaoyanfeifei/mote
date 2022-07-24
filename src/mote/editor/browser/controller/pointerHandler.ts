import { MouseHandler } from 'mote/editor/browser/controller/mouseHandler';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { Disposable } from 'vs/base/common/lifecycle';

export class PointerHandler extends Disposable {
	private readonly handler: MouseHandler;

	constructor(
		context: ViewContext,
	) {
		super();
		this.handler = this._register(new MouseHandler());
	}
}
