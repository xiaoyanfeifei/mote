import { IHoverDelegate } from 'vs/base/browser/ui/iconLabel/iconHoverDelegate';
import { IMenuOptions } from 'vs/base/browser/ui/menu/menu';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';

export interface IMenuLike extends IDisposable {
	getContainer(): HTMLElement;

	onDidCancel: Event<void>;
	onDidBlur: Event<void>;
}

export interface IMenuLikeOptions extends IMenuOptions {
	readonly hoverDelegate?: IHoverDelegate;
}
