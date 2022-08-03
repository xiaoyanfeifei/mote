import { TextSelection } from 'mote/editor/common/core/rangeUtils';
import { TextSelectionMode } from 'mote/editor/common/core/selectionUtils';
import RecordStore from 'mote/platform/store/common/recordStore';

export interface TextSelectionState {
	/**
	 * Current mode
	 */
	mode: TextSelectionMode;

	/**
	 * Current selection
	 */
	selection: TextSelection;

	/**
	 * The selection belong to
	 */
	store?: RecordStore;
}
