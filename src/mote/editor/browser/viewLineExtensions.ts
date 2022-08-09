import { EditableHandlerOptions } from 'mote/editor/browser/controller/editableHandler';
import { ViewContext } from 'mote/editor/browser/view/viewContext';
import { ViewController } from 'mote/editor/browser/view/viewController';
import { IViewLineContribution } from 'mote/editor/common/editorCommon';
import { BrandedService, IConstructorSignature } from 'vs/platform/instantiation/common/instantiation';
import { Registry } from 'vs/platform/registry/common/platform';

export type IViewLineContributionCtor = IConstructorSignature<IViewLineContribution, [number, ViewContext, ViewController, EditableHandlerOptions]>;

export interface IViewLineContributionDescription {
	id: string;
	ctor: IViewLineContributionCtor;
}

export function registerViewLineContribution<Services extends BrandedService[]>(
	id: string, ctor: {
		new(
			lineNumber: number, viewContext: ViewContext, viewController: ViewController,
			options: EditableHandlerOptions, ...services: Services
		): IViewLineContribution;
	}
): void {
	ViewLineContributionRegistry.INSTANCE.registerEditorContribution(id, ctor);
}

export namespace ViewLineExtensionsRegistry {

	export function getViewLineContributions(): Map<String, IViewLineContributionDescription> {
		return ViewLineContributionRegistry.INSTANCE.getEditorContributions();
	}
}

// Editor extension points
const EditorExtensions = {
	ViewLineContributions: 'editor.viewline.contributions'
};

class ViewLineContributionRegistry {
	public static readonly INSTANCE = new ViewLineContributionRegistry();

	private readonly viewLineContributions: Map<String, IViewLineContributionDescription> = new Map();

	public registerEditorContribution<Services extends BrandedService[]>(
		id: string, ctor: {
			new(
				lineNumber: number, viewContext: ViewContext, viewController: ViewController,
				options: EditableHandlerOptions, ...services: Services
			): IViewLineContribution;
		}
	): void {
		this.viewLineContributions.set(id, { id, ctor: ctor as IViewLineContributionCtor });
	}

	public getEditorContributions(): Map<String, IViewLineContributionDescription> {
		return this.viewLineContributions;
	}
}

Registry.add(EditorExtensions.ViewLineContributions, ViewLineContributionRegistry.INSTANCE);
