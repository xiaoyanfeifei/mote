import { EditorPaneDescriptor, IEditorPaneRegistry } from 'mote/workbench/browser/editor';
import { EditorExtensions } from 'mote/workbench/common/editor';
import { DocumentEditorInput } from 'mote/workbench/contrib/documentEditor/browser/documentEditorInput';
import { DocumentEditor } from 'mote/workbench/contrib/documentEditor/browser/view/documentEditor';
import { localize } from 'vs/nls';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { Registry } from 'vs/platform/registry/common/platform';

Registry.as<IEditorPaneRegistry>(EditorExtensions.EditorPane).registerEditorPane(
	EditorPaneDescriptor.create(
		DocumentEditor,
		DocumentEditor.ID,
		localize('name', "Merge Editor")
	),
	[
		new SyncDescriptor(DocumentEditorInput)
	]
);
