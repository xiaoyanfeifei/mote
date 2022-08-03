import { Command, Operation } from 'mote/platform/transaction/common/operations';


function findIndex(arr: any[], predict: (t: any) => boolean): number {
	for (let i = 0; i < arr.length; i++) {
		if (predict(arr[i])) {
			return i;
		}
	}
	return -1;
}



export function get(object: any, path: string[]) {

	let index = 0;
	const length = path.length;

	while (object !== null && index < length) {
		object = object[path[index++]];
	}
	return (index && index === length) ? object : undefined;
}

function filterAllNotEqId(record: any, value: any[]) {
	value = value || [];
	value = value.filter(t => t !== record.id);
	return value;
}

type CommandHandler = (args: any, value: any, version: number) => any;

const UpdateCommand: CommandHandler = (args, value: any, version: number) => {
	value = value || {};
	return Object.assign({}, value, {}, args);
};

const SetCommand = (args: any, value: any, version: number) => args;

const ListAfterCommand = (args: any, value: any[], version: number) => {
	value = filterAllNotEqId({
		id: args.id
	}, value);
	const index = findIndex(value, t => t === args.after);
	index >= 0 ? value.splice(index + 1, 0, args.id) : value.push(args.id);
	return value;
};

const ListBeforeCommand = (args: any, value: any[], version: number) => {
	value = filterAllNotEqId({
		id: args.id
	}, value);
	const index = findIndex(value, t => t === args.before);
	index >= 0 ? value.splice(index, 0, args.id) : value.unshift(args.id);
	return value;
};

const ListRemoveCommand = filterAllNotEqId;

function calcVersion(operation: Operation) {
	return void 0 === operation.size ? 1 : operation.size;
};

function updateValueByPath(record: { [key: string]: any }, path: string[], value: any) {
	if (0 === path.length)
		throw new Error("Empty path to set");
	record = Object.assign({}, record);
	let newRecord = record;
	for (let index = 0; index < path.length; index++) {
		const field = path[index];
		if (index === path.length - 1)
			newRecord[field] = value;
		else {
			let n = Object.assign({}, newRecord[field]);
			null == n && (n = "number" == typeof path[index + 1] ? [] : {});
			newRecord[field] = n;
			newRecord = n
		}
	}
	return record;
};

class CommandFacade {
	private registry: Partial<{ [key in Command]: CommandHandler }> = {};

	register(command: Command, handler: CommandHandler) {
		this.registry[command] = handler;
	}

	execute(operation: Operation, record: any) {
		record = record || {};
		let value = operation.path.length > 0 ? get(record, operation.path) : record;
		let version = record.version ? record.version + calcVersion(operation) : calcVersion(operation);

		const handler = this.registry[operation.command];
		if (!handler) {
			throw new Error(`Unrecognized command ${operation.command}`);
		}

		value = handler(operation.args, value, version);
		record = operation.path.length > 0 ? updateValueByPath(record, operation.path, value) : value;
		record.id = operation.id;
		record.version = version;
		return record;
	}
}

const commandFacade = new CommandFacade();
commandFacade.register(Command.Update, UpdateCommand);
commandFacade.register(Command.Set, SetCommand);
commandFacade.register(Command.ListAfter, ListAfterCommand);
commandFacade.register(Command.ListBefore, ListBeforeCommand);
commandFacade.register(Command.ListRemove, ListRemoveCommand);

export default commandFacade;
