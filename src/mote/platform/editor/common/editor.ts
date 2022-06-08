import { URI } from "vs/base/common/uri";

export interface IBaseUntypedEditorInput {

}

export interface IResourceEditorInput extends IBaseUntypedEditorInput {

	/**
	 * The resource URI of the resource to open.
	 */
	readonly resource: URI;
}