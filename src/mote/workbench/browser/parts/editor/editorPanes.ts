import { IEditorOptions } from 'mote/platform/editor/common/editor';
import { IEditorPaneDescriptor, IEditorPaneRegistry } from 'mote/workbench/browser/editor';
import { EditorPane } from 'mote/workbench/browser/parts/editor/editorPane';
import { EditorExtensions } from 'mote/workbench/common/editor';
import { EditorInput } from 'mote/workbench/common/editorInput';
import { Dimension, hide, show } from 'vs/base/browser/dom';
import { Disposable } from 'vs/base/common/lifecycle';
import { assertIsDefined } from 'vs/base/common/types';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Registry } from 'vs/platform/registry/common/platform';

export class EditorPanes extends Disposable {

	private _activeEditorPane: EditorPane | null = null;
	get activeEditorPane(): EditorPane | null { return this._activeEditorPane || null; }


	private readonly editorPanes: EditorPane[] = [];
	private dimension: Dimension | undefined;

	private readonly editorPanesRegistry = Registry.as<IEditorPaneRegistry>(EditorExtensions.EditorPane);

	constructor(
		private parent: HTMLElement,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super();
	}

	async openEditor(editor: EditorInput, options: IEditorOptions | undefined) {
		const editorPaneDescriptor = this.getEditorPaneDescriptor(editor);
		return await this.doOpenEditor(editorPaneDescriptor, editor, options);
	}

	closeEditor(editor?: EditorInput): void {
		if (this._activeEditorPane?.input) {
			this.doHideActiveEditorPane();
		}
	}


	async doOpenEditor(descriptor: IEditorPaneDescriptor, editor: EditorInput, options: IEditorOptions | undefined) {
		// Editor pane
		const pane = this.doShowEditorPane(descriptor);

		await this.doSetInput(pane, editor, options);

		return pane;
	}

	private async doSetInput(editorPane: EditorPane, editor: EditorInput, options: IEditorOptions | undefined) {
		// Set the input to the editor pane
		await editorPane.setInput(editor, options);
	}

	private getEditorPaneDescriptor(editor: EditorInput): IEditorPaneDescriptor {
		return assertIsDefined(this.editorPanesRegistry.getEditorPane(editor));
	}

	private doShowEditorPane(descriptor: IEditorPaneDescriptor) {

		// Hide active one first
		this.doHideActiveEditorPane();

		// Create editor pane
		const editorPane = this.doCreateEditorPane(descriptor);

		// Set editor as active
		this.doSetActiveEditorPane(editorPane);

		// Show editor
		const container = assertIsDefined(editorPane.getContainer());
		this.parent.appendChild(container);
		show(container);

		// Layout
		if (this.dimension) {
			editorPane.layout(this.dimension);
		}


		return editorPane;
	}

	private doCreateEditorPane(descriptor: IEditorPaneDescriptor): EditorPane {

		// Instantiate editor
		const editorPane = this.doInstantiateEditorPane(descriptor);

		// Create editor container as needed
		if (!editorPane.getContainer()) {
			const editorPaneContainer = document.createElement('div');
			editorPaneContainer.classList.add('editor-instance');

			editorPane.create(editorPaneContainer);
		}

		return editorPane;
	}

	private doInstantiateEditorPane(descriptor: IEditorPaneDescriptor): EditorPane {

		// Return early if already instantiated
		const existingEditorPane = this.editorPanes.find(editorPane => descriptor.describes(editorPane));
		if (existingEditorPane) {
			return existingEditorPane;
		}

		// Otherwise instantiate new
		const editorPane = this._register(descriptor.instantiate(this.instantiationService));
		this.editorPanes.push(editorPane);

		return editorPane;
	}

	private doHideActiveEditorPane(): void {
		if (!this._activeEditorPane) {
			return;
		}

		// Stop any running operation
		//this.editorOperation.stop();

		// Indicate to editor pane before removing the editor from
		// the DOM to give a chance to persist certain state that
		// might depend on still being the active DOM element.
		//this._activeEditorPane.clearInput();
		//this._activeEditorPane.setVisible(false, this.groupView);

		// Remove editor pane from parent
		const editorPaneContainer = this._activeEditorPane.getContainer();
		if (editorPaneContainer) {
			this.parent.removeChild(editorPaneContainer);
			hide(editorPaneContainer);
		}

		// Clear active editor pane
		this.doSetActiveEditorPane(null);
	}

	private doSetActiveEditorPane(editorPane: EditorPane | null) {
		this._activeEditorPane = editorPane;
		/*

		// Clear out previous active editor pane listeners
		this.activeEditorPaneDisposables.clear();

		// Listen to editor pane changes
		if (editorPane) {
			this.activeEditorPaneDisposables.add(editorPane.onDidChangeSizeConstraints(e => this._onDidChangeSizeConstraints.fire(e)));
			this.activeEditorPaneDisposables.add(editorPane.onDidFocus(() => this._onDidFocus.fire()));
		}

		// Indicate that size constraints could have changed due to new editor
		this._onDidChangeSizeConstraints.fire(undefined);
		*/
	}

	layout(dimension: Dimension): void {
		this.dimension = dimension;

		this._activeEditorPane?.layout(dimension);
	}
}
