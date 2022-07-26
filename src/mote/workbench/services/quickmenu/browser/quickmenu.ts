import { AnchorAlignment, AnchorAxisAlignment } from 'mote/base/browser/ui/contextview/contextview';
import { TextSelectionState } from 'mote/editor/common/core/selectionUtils';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface IQuickMenuOptions {

}

export interface IQuickMenuDelegate {
	/**
	 * Current store
	 */
	state: TextSelectionState;
	anchorAlignment?: AnchorAlignment;
	anchorAxisAlignment?: AnchorAxisAlignment;
	domForShadowRoot?: HTMLElement;
}

export const IQuickMenuService = createDecorator<IQuickMenuService>('quickMenuService');

export interface IQuickMenuService {

	readonly _serviceBrand: undefined;

	showQuickMenu(delegate: IQuickMenuDelegate): void;

	hideQuickMenu(): void;
}
