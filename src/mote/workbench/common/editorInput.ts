import { IEditorDescriptor, IEditorPane } from 'mote/workbench/common/editor';
import { firstOrDefault } from 'vs/base/common/arrays';

/**
 * Editor inputs are lightweight objects that can be passed to the workbench API to open inside the editor part.
 * Each editor input is mapped to an editor that is capable of opening it through the Platform facade.
 */
export abstract class EditorInput {

	hideHeader?: boolean;

	/**
	 * If a editor was registered onto multiple editor panes, this method
	 * will be asked to return the preferred one to use.
	 *
	 * @param editorPanes a list of editor pane descriptors that are candidates
	 * for the editor to open in.
	 */
	prefersEditorPane<T extends IEditorDescriptor<IEditorPane>>(editorPanes: T[]): T | undefined {
		return firstOrDefault(editorPanes);
	}
}
