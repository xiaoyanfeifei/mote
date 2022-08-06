import { IMoteEditor } from 'mote/editor/browser/editorBrowser';
import { registerEditorContribution } from 'mote/editor/browser/editorExtensions';
import { IEditorContribution } from 'mote/editor/common/editorCommon';
import { TopbarWidget } from 'mote/editor/contrib/topbar/browser/topbarWidget';
import { IContextViewService } from 'mote/platform/contextview/browser/contextView';
import { Disposable } from 'vs/base/common/lifecycle';

export class TopbarController extends Disposable implements IEditorContribution {
	public static readonly ID = 'editor.contrib.topbarController';

	private widget: TopbarWidget;

	constructor(
		readonly editor: IMoteEditor,
		@IContextViewService contextViewService: IContextViewService,
	) {
		super();

		this.widget = new TopbarWidget(editor);
		this.registerListeners();
	}

	private registerListeners() {
		this.widget.onDidShareBtnClick(() => {
			this.showShareSettings();
		});
	}

	private showShareSettings() {

	}
}

registerEditorContribution(TopbarController.ID, TopbarController);
