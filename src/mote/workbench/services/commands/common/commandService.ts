import { ICommandEvent, ICommandService } from "mote/platform/commands/common/commands";
import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';

export class CommandService extends Disposable implements ICommandService {

    declare readonly _serviceBrand: undefined;
    
    private readonly _onWillExecuteCommand: Emitter<ICommandEvent> = this._register(new Emitter<ICommandEvent>());
	public readonly onWillExecuteCommand: Event<ICommandEvent> = this._onWillExecuteCommand.event;

	private readonly _onDidExecuteCommand: Emitter<ICommandEvent> = new Emitter<ICommandEvent>();
	public readonly onDidExecuteCommand: Event<ICommandEvent> = this._onDidExecuteCommand.event;

    executeCommand<T = any>(commandId: string, ...args: any[]): Promise<T | undefined> {
        throw new Error("Method not implemented.");
    }

}

registerSingleton(ICommandService, CommandService, true);