import { CSSProperties } from 'mote/base/browser/jsx';
import { setStyles } from 'mote/base/browser/jsx/createElement';
import { ThemedStyles } from 'mote/base/browser/ui/themes';
import { $, addDisposableListener, EventHelper, EventType, reset } from 'vs/base/browser/dom';
import { Gesture, EventType as TouchEventType } from 'vs/base/browser/touch';
import { Emitter, Event as BaseEvent } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';

export interface IButton extends IDisposable {
	readonly element: HTMLElement;
	readonly onDidClick: BaseEvent<Event | undefined>;
}

export interface IButtonOptions {
	style?: CSSProperties
}

export class Button extends Disposable implements IButton {

	protected _element: HTMLElement;
	protected options: IButtonOptions;

	private _onDidClick = this._register(new Emitter<Event>());
	get onDidClick(): BaseEvent<Event> { return this._onDidClick.event; }

	constructor(container: HTMLElement, options?: IButtonOptions) {
		super();

		this.options = options || Object.create(null);

		this._element = $("div");

		container.appendChild(this._element);

		this._register(Gesture.addTarget(this._element));

		[EventType.CLICK, TouchEventType.Tap].forEach(eventType => {
			this._register(addDisposableListener(this._element, eventType, e => {
				if (!this.enabled) {
					EventHelper.stop(e);
					return;
				}

				this._onDidClick.fire(e);
			}));
		});

		this._register(addDisposableListener(this._element, EventType.MOUSE_OVER, e => {
			if (!this._element.classList.contains('disabled')) {
				this.setHoverBackground();
			}
		}));

		this._register(addDisposableListener(this._element, EventType.MOUSE_OUT, e => {
			this.applyStyles(); // restore standard styles
		}));

		this.applyStyles();
	}

	private setHoverBackground(): void {
		this._element.style.backgroundColor = ThemedStyles.buttonHoveredBackground.dark;
	}

	private applyStyles(): void {
		if (this._element) {
			const style = Object.assign({
				cursor: "pointer",
				backgroundColor: "",
			}, this.options.style)
			setStyles(this._element, style);
		}
	}

	setChildren(...value: Array<Node | string>) {
		reset(this._element, ...value);
	}

	set enabled(value: boolean) {
		if (value) {
			this._element.classList.remove('disabled');
			this._element.setAttribute('aria-disabled', String(false));
			this._element.tabIndex = 0;
		} else {
			this._element.classList.add('disabled');
			this._element.setAttribute('aria-disabled', String(true));
		}
	}

	get enabled() {
		return !this._element.classList.contains('disabled');
	}

	focus(): void {
		this._element.focus();
	}

	get element(): HTMLElement {
		return this._element;
	}
}
