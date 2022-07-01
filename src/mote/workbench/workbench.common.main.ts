//#region --- workbench parts

import 'mote/workbench/browser/parts/editor/editorPart';
import 'mote/workbench/browser/parts/paneCompositePart';
import 'mote/workbench/browser/parts/views/viewsService';

//#endregion

//#region --- workbench contributions

// Explorer
import 'mote/workbench/contrib/files/browser/explorerViewlet';
import 'mote/workbench/contrib/files/browser/files.contribution';

//#endregion

//#region --- workbench services

import 'mote/workbench/services/hover/browser/hoverService';
import 'mote/workbench/services/commands/common/commandService';
import 'mote/workbench/services/editor/browser/editorService';

//#endregion


import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { ContextViewService } from 'vs/platform/contextview/browser/contextViewService';


registerSingleton(IContextViewService, ContextViewService, true);
