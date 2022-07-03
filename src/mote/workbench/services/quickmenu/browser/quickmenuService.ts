import { IContextViewService } from "mote/platform/contextview/browser/contextView";
import { addDisposableListener, EventType, getDomNodePagePosition, isHTMLElement } from "vs/base/browser/dom";
import { StandardMouseEvent } from "vs/base/browser/mouseEvent";
import { DisposableStore } from "vs/base/common/lifecycle";
import { registerSingleton } from "vs/platform/instantiation/common/extensions";
import { IQuickMenuDelegate, IQuickMenuOptions, IQuickMenuService } from "./quickmenu";
import { QuickMenuHeight, QuickMenuWidget } from "./quickmenuWidget";
import { Range } from "mote/editor/common/core/range";

interface QuickMenuState {

}

export class QuickMenuService implements IQuickMenuService {

    declare readonly _serviceBrand: undefined;

    private focusToReturn: HTMLElement | null = null;

    private widget: QuickMenuWidget;

    constructor(
        @IContextViewService private readonly contextViewService: IContextViewService,
    ) {
        this.widget = new QuickMenuWidget();
    }

    showQuickMenu(delegate: IQuickMenuDelegate): void {
        this.focusToReturn = document.activeElement as HTMLElement;
        // Update store for widget
        this.widget.configure(delegate.state);

        const shadowRootElement = isHTMLElement(delegate.domForShadowRoot) ? delegate.domForShadowRoot : undefined;
        this.contextViewService.showContextView({
			getAnchor: () => this.getAnchor(),
			canRelayout: false,
			anchorAlignment: delegate.anchorAlignment,
			anchorAxisAlignment: delegate.anchorAxisAlignment,

			render: (container) => {
                container.appendChild(this.widget.element);

                const menuDisposables = new DisposableStore();
                menuDisposables.add(addDisposableListener(window, EventType.BLUR, () => this.contextViewService.hideContextView(true)));
				menuDisposables.add(addDisposableListener(window, EventType.MOUSE_DOWN, (e: MouseEvent) => {
                    if (e.defaultPrevented) {
						return;
					}

					const event = new StandardMouseEvent(e);
					let element: HTMLElement | null = event.target;

					// Don't do anything as we are likely creating a context menu
					if (event.rightButton) {
						return;
					}

					while (element) {
						if (element === container) {
							return;
						}

						element = element.parentElement;
					}

					this.contextViewService.hideContextView(true);
                }));

                return menuDisposables;
            },

            onHide: (didCancel?: boolean) => {
                if (this.focusToReturn) {
					this.focusToReturn.focus();
				}
                //this.widget.element.parentElement?.remove()
            }
        }, shadowRootElement, !!shadowRootElement);
    }

    hideQuickMenu(): void {
        throw new Error("Method not implemented.");
    }
    
    private getAnchor() {
        const range = Range.get();
        let left = 0, top = 0;
        const rect = Range.getRect(range!);
        if (rect) {
            left = rect.left;
            top = rect.top - QuickMenuHeight - 15;
        }
        
        return {
            y: top,
            x: left
        }
    }
}


registerSingleton(IQuickMenuService, QuickMenuService);