import { Composite, CompositeRegistry } from "mote/workbench/browser/composite";
import { IPartOptions, Part } from "mote/workbench/browser/part";
import { IComposite } from "mote/workbench/common/composite";
import { IWorkbenchLayoutService } from "mote/workbench/services/layout/browser/layoutService";
import { Dimension, hide, show, $, append } from "vs/base/browser/dom";
import { Emitter } from "vs/base/common/event";
import { defaultGenerator } from "vs/base/common/idGenerator";
import { DisposableStore, dispose, IDisposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection";
import { ILogService } from "vs/platform/log/common/log";

interface CompositeItem {
	composite: Composite;
	disposable: IDisposable;
	//progress: IProgressIndicator;
}

export abstract class CompositePart<T extends Composite> extends Part {

    protected readonly onDidCompositeOpen = this._register(new Emitter<{ composite: IComposite; focus: boolean }>());
	protected readonly onDidCompositeClose = this._register(new Emitter<IComposite>());

    private readonly mapCompositeToCompositeContainer = new Map<string, HTMLElement>();
	private readonly mapActionsBindingToComposite = new Map<string, () => void>();
	private activeComposite: Composite | undefined;
	private lastActiveCompositeId: string;
	private readonly instantiatedCompositeItems = new Map<string, CompositeItem>();
	//private titleLabel: ICompositeTitleLabel | undefined;
	//private progressBar: ProgressBar | undefined;
	private contentAreaSize: Dimension | undefined;
	//private readonly telemetryActionsListener = this._register(new MutableDisposable());
	private currentCompositeOpenToken: string | undefined;
    
    constructor(
		protected readonly logService: ILogService,
        layoutService: IWorkbenchLayoutService,
        protected readonly instantiationService: IInstantiationService,
        protected readonly registry: CompositeRegistry<T>,
        private readonly defaultCompositeId: string,
        id: string,
		options: IPartOptions
    ) {
        super(id, options, layoutService);
        this.lastActiveCompositeId = defaultCompositeId;
    }

	override createContentArea(parent: HTMLElement): HTMLElement {
		const contentContainer = append(parent, $('.content'));

		//this.progressBar = this._register(new ProgressBar(contentContainer));
		//this._register(attachProgressBarStyler(this.progressBar, this.themeService));
		//this.progressBar.hide();

		return contentContainer;
	}

    protected openComposite(id: string, focus?: boolean): Composite | undefined {
		this.logService.debug("[compositePart] openComposite:", id);
		// Check if composite already visible and just focus in that case
		if (this.activeComposite?.getId() === id) {
			if (focus) {
				this.activeComposite.focus();
			}

			// Fullfill promise with composite that is being opened
			return this.activeComposite;
		}

		// We cannot open the composite if we have not been created yet
		if (!this.element) {
			return;
		}

		// Open
		return this.doOpenComposite(id, focus);
	}

    private doOpenComposite(id: string, focus: boolean = false): Composite | undefined {
		this.logService.debug("[compositePart] doOpenComposite:", id);
		// Use a generated token to avoid race conditions from long running promises
		const currentCompositeOpenToken = defaultGenerator.nextId();
		this.currentCompositeOpenToken = currentCompositeOpenToken;

        // Hide current
		if (this.activeComposite) {
			this.hideActiveComposite();
		}

        // Create composite
		const composite = this.createComposite(id, true);

        // Check if another composite opened meanwhile and return in that case
		if ((this.currentCompositeOpenToken !== currentCompositeOpenToken) || (this.activeComposite && this.activeComposite.getId() !== composite.getId())) {
			return undefined;
		}

		// Check if composite already visible and just focus in that case
		if (this.activeComposite?.getId() === composite.getId()) {
			if (focus) {
				composite.focus();
			}

			this.onDidCompositeOpen.fire({ composite, focus });
			return composite;
		}

		// Show Composite and Focus
		this.showComposite(composite);
		if (focus) {
			composite.focus();
		}

		// Return with the composite that is being opened
		if (composite) {
			this.onDidCompositeOpen.fire({ composite, focus });
		}

		return composite;
    }

    protected createComposite(id: string, isActive?: boolean): Composite {

		// Check if composite is already created
		const compositeItem = this.instantiatedCompositeItems.get(id);
		if (compositeItem) {
			return compositeItem.composite;
		}

		// Instantiate composite from registry otherwise
		const compositeDescriptor = this.registry.getComposite(id);
		if (compositeDescriptor) {
			//const compositeProgressIndicator = this.instantiationService.createInstance(CompositeProgressIndicator, assertIsDefined(this.progressBar), compositeDescriptor.id, !!isActive);
			const compositeInstantiationService = this.instantiationService.createChild(new ServiceCollection(
				// provide the editor progress service for any editors instantiated within the composite
			));

			const composite = compositeDescriptor.instantiate(compositeInstantiationService);
			const disposable = new DisposableStore();

			// Remember as Instantiated
			this.instantiatedCompositeItems.set(id, { composite, disposable });

			// Register to title area update events from the composite
			//disposable.add(composite.onTitleAreaUpdate(() => this.onTitleAreaUpdate(composite.getId()), this));

			return composite;
		}

		throw new Error(`Unable to find composite with id ${id}`);
	}

    protected hideActiveComposite(): Composite | undefined {
		if (!this.activeComposite) {
			return undefined; // Nothing to do
		}

		const composite = this.activeComposite;
		this.activeComposite = undefined;

		const compositeContainer = this.mapCompositeToCompositeContainer.get(composite.getId());

		// Indicate to Composite
		composite.setVisible(false);

		// Take Container Off-DOM and hide
		if (compositeContainer) {
			compositeContainer.remove();
			hide(compositeContainer);
		}

        /*
		// Clear any running Progress
		if (this.progressBar) {
			this.progressBar.stop().hide();
		}

		// Empty Actions
		if (this.toolBar) {
			this.collectCompositeActions()();
		}
        */

		this.onDidCompositeClose.fire(composite);

		return composite;
	}

    protected showComposite(composite: Composite): void {
		this.logService.debug("showComposite:", composite);
		// Remember Composite
		this.activeComposite = composite;

		// Store in preferences
		const id = this.activeComposite.getId();
		if (id !== this.defaultCompositeId) {
			//this.storageService.store(this.activeCompositeSettingsKey, id, StorageScope.WORKSPACE, StorageTarget.USER);
		} else {
			//this.storageService.remove(this.activeCompositeSettingsKey, StorageScope.WORKSPACE);
		}

		// Remember
		this.lastActiveCompositeId = this.activeComposite.getId();

		// Composites created for the first time
		let compositeContainer = this.mapCompositeToCompositeContainer.get(composite.getId());
		if (!compositeContainer) {
			// Build Container off-DOM
			compositeContainer = $('.composite');
			//compositeContainer.classList.add(...this.compositeCSSClass.split(' '));
			compositeContainer.id = composite.getId();

			composite.create(compositeContainer);
			//composite.updateStyles();

			// Remember composite container
			this.mapCompositeToCompositeContainer.set(composite.getId(), compositeContainer);
		}

		// Fill Content and Actions
		// Make sure that the user meanwhile did not open another composite or closed the part containing the composite
		if (!this.activeComposite || composite.getId() !== this.activeComposite.getId()) {
			return undefined;
		}

		// Take Composite on-DOM and show
		const contentArea = this.getContentArea();
		if (contentArea) {
			contentArea.appendChild(compositeContainer);
		}
		show(compositeContainer);

		// Setup action runner
		//const toolBar = assertIsDefined(this.toolBar);
		//toolBar.actionRunner = composite.getActionRunner();

		// Update title with composite title if it differs from descriptor
		const descriptor = this.registry.getComposite(composite.getId());
		if (descriptor && descriptor.name !== composite.getTitle()) {
			//this.updateTitle(composite.getId(), composite.getTitle());
		}

		// Handle Composite Actions
		let actionsBinding = this.mapActionsBindingToComposite.get(composite.getId());
		if (!actionsBinding) {
			//actionsBinding = this.collectCompositeActions(composite);
			//this.mapActionsBindingToComposite.set(composite.getId(), actionsBinding);
		}
		//actionsBinding();

		// Action Run Handling
        /*
		this.telemetryActionsListener.value = toolBar.actionRunner.onDidRun(e => {

			// Check for Error
			if (e.error && !isCancellationError(e.error)) {
				//this.notificationService.error(e.error);
			}

			// Log in telemetry
			this.telemetryService.publicLog2<WorkbenchActionExecutedEvent, WorkbenchActionExecutedClassification>('workbenchActionExecuted', { id: e.action.id, from: this.nameForTelemetry });
		});
        */

		// Indicate to composite that it is now visible
		composite.setVisible(true);

		// Make sure that the user meanwhile did not open another composite or closed the part containing the composite
		if (!this.activeComposite || composite.getId() !== this.activeComposite.getId()) {
			return;
		}

		// Make sure the composite is layed out
		if (this.contentAreaSize) {
			//composite.layout(this.contentAreaSize);
		}
	}

	protected removeComposite(compositeId: string): boolean {
		if (this.activeComposite?.getId() === compositeId) {
			return false; // do not remove active composite
		}

		this.mapCompositeToCompositeContainer.delete(compositeId);
		this.mapActionsBindingToComposite.delete(compositeId);
		const compositeItem = this.instantiatedCompositeItems.get(compositeId);
		if (compositeItem) {
			compositeItem.composite.dispose();
			dispose(compositeItem.disposable);
			this.instantiatedCompositeItems.delete(compositeId);
		}

		return true;
	}

}