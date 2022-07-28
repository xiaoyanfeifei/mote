import { AnchorAlignment, AnchorAxisAlignment } from 'mote/base/browser/ui/contextview/contextview';
import { TextSelectionState } from 'mote/editor/common/core/selectionUtils';
import { IAction, IActionRunner } from 'vs/base/common/actions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface IQuickMenuOptions {

}

export interface IQuickMenuDelegate {
	getActions(): readonly IAction[];
	/**
	 * Current store
	 */
	state: TextSelectionState;
	anchorAlignment?: AnchorAlignment;
	anchorAxisAlignment?: AnchorAxisAlignment;
	actionRunner?: IActionRunner;
	domForShadowRoot?: HTMLElement;
}

export const IQuickMenuService = createDecorator<IQuickMenuService>('quickMenuService');

export interface IQuickMenuService {

	readonly _serviceBrand: undefined;

	showQuickMenu(delegate: IQuickMenuDelegate): void;
}
