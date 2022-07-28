/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


// #######################################################################
// ###                                                                 ###
// ### !!! PLEASE ADD COMMON IMPORTS INTO WORKBENCH.COMMON.MAIN.TS !!! ###
// ###                                                                 ###
// #######################################################################



//#region --- workbench common

import 'mote/workbench/workbench.common.main';

//#endregion

//#region --- workbench (desktop main)

import 'mote/workbench/electron-sandbox/desktop.main';

//#endregion


//#region --- workbench services

import 'mote/workbench/services/lifecycle/browser/lifecycleService';

import { BrowserContextMenuService } from 'mote/platform/contextview/browser/contextMenuService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IContextMenuService } from 'mote/platform/contextview/browser/contextView';


registerSingleton(IContextMenuService, BrowserContextMenuService);

//#endregion
