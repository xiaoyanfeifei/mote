import { IWorkbenchLayoutService, Parts } from "mote/workbench/services/layout/browser/layoutService";
import { Dimension } from "vs/base/browser/dom";
import { Emitter } from "vs/base/common/event";
import { Part } from "mote/workbench/browser/part";

export class EditorPart extends Part {

    declare readonly _serviceBrand: undefined;

    get minimumWidth(): number { 
        return 0;
    }

    get maximumWidth(): number { 
        return 0;
    }

    get minimumHeight(): number { 
        return 0;
    }

    get maximumHeight(): number { 
        return 0;
    }
  
    

    //#region Events

	private readonly _onDidLayout = this._register(new Emitter<Dimension>());
	readonly onDidLayout = this._onDidLayout.event;

    
    constructor(
        @IWorkbenchLayoutService layoutService: IWorkbenchLayoutService
    ) {
        super(Parts.EDITOR_PART, {hasTitle: false}, layoutService);
    }
}