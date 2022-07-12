import { IView, IViewContentDescriptor, IViewsRegistry, Extensions as ViewContainerExtensions } from "mote/workbench/common/views";
import { append, $, trackFocus } from "vs/base/browser/dom";
import { Event, Emitter } from 'vs/base/common/event';
import { DomScrollableElement } from "vs/base/browser/ui/scrollbar/scrollableElement";
import { IPaneOptions, Pane } from "vs/base/browser/ui/splitview/paneview";
import { Disposable, DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { ScrollbarVisibility } from "vs/base/common/scrollable";
import { ILogService } from "vs/platform/log/common/log";
import { parseLinkedText } from "vs/base/common/linkedText";
import { Button } from "vs/base/browser/ui/button/button";
import { Registry } from "vs/platform/registry/common/platform";

export interface IViewPaneOptions extends IPaneOptions {
	id: string;
	showActionsAlways?: boolean;
	//titleMenuId?: MenuId;
	donotForwardArgs?: boolean;
}

const viewsRegistry = Registry.as<IViewsRegistry>(ViewContainerExtensions.ViewsRegistry);

interface IItem {
	readonly descriptor: IViewContentDescriptor;
	visible: boolean;
}

class ViewWelcomeController {
    private _onDidChange = new Emitter<void>();
	readonly onDidChange = this._onDidChange.event;

    private defaultItem: IItem | undefined;
	private items: IItem[] = [];
	get contents(): IViewContentDescriptor[] {
		const visibleItems = this.items.filter(v => v.visible);

		if (visibleItems.length === 0 && this.defaultItem) {
			return [this.defaultItem.descriptor];
		}

		return visibleItems.map(v => v.descriptor);
	}

	private disposables = new DisposableStore();

    constructor(private id: string) {
        Event.filter(viewsRegistry.onDidChangeViewWelcomeContent, id => id === this.id)(this.onDidChangeViewWelcomeContent, this, this.disposables);
		this.onDidChangeViewWelcomeContent();
    }

    private onDidChangeViewWelcomeContent(): void {
		const descriptors = viewsRegistry.getViewWelcomeContent(this.id);

		this.items = [];

		for (const descriptor of descriptors) {
            this.defaultItem = { descriptor, visible: true };
		}

		this._onDidChange.fire();
	}

    dispose(): void {
		this.disposables.dispose();
	}
}

export abstract class ViewPane extends Pane implements IView {

    private _onDidFocus = this._register(new Emitter<void>());
	readonly onDidFocus: Event<void> = this._onDidFocus.event;

    private _onDidBlur = this._register(new Emitter<void>());
	readonly onDidBlur: Event<void> = this._onDidBlur.event;

    protected _onDidChangeViewWelcomeState = this._register(new Emitter<void>());
	readonly onDidChangeViewWelcomeState: Event<void> = this._onDidChangeViewWelcomeState.event;

    private _isVisible: boolean = false;
    readonly id: string;

    private headerContainer?: HTMLElement;
    private titleContainer?: HTMLElement;
	private titleDescriptionContainer?: HTMLElement;
	private iconContainer?: HTMLElement;
	protected twistiesContainer?: HTMLElement;

    private bodyContainer!: HTMLElement;
	private viewWelcomeContainer!: HTMLElement;
	private viewWelcomeDisposable: IDisposable = Disposable.None;
	private viewWelcomeController: ViewWelcomeController;

    constructor(
        options: IViewPaneOptions,
        @ILogService protected logService: ILogService,
    ) {
        super(options);

        this.id = options.id;

        this.viewWelcomeController = new ViewWelcomeController(this.id);
    }

    override render(): void {
		super.render();

		const focusTracker = trackFocus(this.element);
		this._register(focusTracker);
		this._register(focusTracker.onDidFocus(() => this._onDidFocus.fire()));
		this._register(focusTracker.onDidBlur(() => this._onDidBlur.fire()));
	}

    protected renderHeader(container: HTMLElement): void {
		this.headerContainer = container;
    }

    private scrollableElement!: DomScrollableElement;

    protected renderBody(container: HTMLElement): void {
		this.bodyContainer = container;

		const viewWelcomeContainer = append(container, $('.welcome-view'));
        this.viewWelcomeContainer = $('.welcome-view-content', { tabIndex: 0 });
        this.scrollableElement = this._register(new DomScrollableElement(this.viewWelcomeContainer, {
			alwaysConsumeMouseWheel: true,
			horizontal: ScrollbarVisibility.Hidden,
			vertical: ScrollbarVisibility.Visible,
		}));

		append(viewWelcomeContainer, this.scrollableElement.getDomNode());

        const onViewWelcomeChange = Event.any(this.viewWelcomeController.onDidChange, this.onDidChangeViewWelcomeState);
		this._register(onViewWelcomeChange(this.updateViewWelcome, this));
        this.updateViewWelcome();
    }

    protected layoutBody(height: number, width: number): void {
		this.viewWelcomeContainer.style.height = `${height}px`;
		this.viewWelcomeContainer.style.width = `${width}px`;
		this.viewWelcomeContainer.classList.toggle('wide', width > 640);
		this.scrollableElement.scanDomNode();
	}

	onDidScrollRoot() {
		// noop
	}

    focus(): void {
        if (this.shouldShowWelcome()) {
			this.viewWelcomeContainer.focus();
		} else if (this.element) {
			this.element.focus();
			this._onDidFocus.fire();
		}
    }
    isVisible(): boolean {
        return this._isVisible;
    }
    isBodyVisible(): boolean {
        throw new Error("Method not implemented.");
    }

    private updateViewWelcome(): void {
        this.viewWelcomeDisposable.dispose();

        if (!this.shouldShowWelcome()) {
			this.bodyContainer.classList.remove('welcome');
			this.viewWelcomeContainer.innerText = '';
			this.scrollableElement.scanDomNode();
			return;
		}

        const contents = this.viewWelcomeController.contents;

		if (contents.length === 0) {
			this.bodyContainer.classList.remove('welcome');
			this.viewWelcomeContainer.innerText = '';
			this.scrollableElement.scanDomNode();
			return;
		}

        const disposables = new DisposableStore();
		this.bodyContainer.classList.add('welcome');
		this.viewWelcomeContainer.innerText = '';

        for (const { content } of contents) {
			const lines = content.split('\n');

			for (let line of lines) {
				line = line.trim();

				if (!line) {
					continue;
				}

				const linkedText = parseLinkedText(line);

				if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== 'string') {
					const node = linkedText.nodes[0];
					const buttonContainer = append(this.viewWelcomeContainer, $('.button-container'));
					const button = new Button(buttonContainer, { title: node.title, supportIcons: true });
					button.label = node.label;
					button.onDidClick(_ => {
						//this.telemetryService.publicLog2<{ viewId: string; uri: string }, WelcomeActionClassification>('views.welcomeAction', { viewId: this.id, uri: node.href });
						//this.openerService.open(node.href, { allowCommands: true });
					}, null, disposables);
					disposables.add(button);
					//disposables.add(attachButtonStyler(button, this.themeService));

				} else {
					const p = append(this.viewWelcomeContainer, $('p'));

					for (const node of linkedText.nodes) {
						if (typeof node === 'string') {
							append(p, document.createTextNode(node));
						}
					}
				}
			}
		}

        this.scrollableElement.scanDomNode();
		this.viewWelcomeDisposable = disposables;
    }
    
    shouldShowWelcome(): boolean {
		return false;
	}
}