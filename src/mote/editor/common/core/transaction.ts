import RecordStore from "mote/editor/common/store/recordStore";
import { generateUuid } from 'vs/base/common/uuid';
import { Operation } from "../operations";
import { Role } from "../store/record";
import RecordCacheStore from "../store/recordCacheStore";
import CommandFacade from "./commandFacade";


export interface TransactionCallback {
	(transcation: Transaction): void;
}

export class Transaction {

	static create(userId: string) {
		return new Transaction(userId);
	}

	static async createAndCommit(callback: TransactionCallback, userId: string) {
		const transaction = Transaction.create(userId);
		const result = callback(transaction);
		await transaction.commit();
		return result;
	}

	id: string = generateUuid();
	userId: string;
	isLocal = true;
	canUndo = true;

	committed = false;

	operations: Operation[] = [];
	stores: RecordStore[] = [];
	snapshot: { [key: string]: any } = {};

	preSubmitActions: any[] = [];
	postSubmitActions: any[] = [];
	postSubmitCallbacks: any[] = [];

	private constructor(userId: string) {
		this.userId = userId;
	}

	done(args?: any) {
		for (const callback of this.postSubmitCallbacks) {
			callback(args);
		}
		console.debug(`[${this.id}] done.`);
	}

	commit() {
		if (this.committed) {
			console.debug(`commit on a committed transaction [${this.id}].`);
			return;
		}

		return new Promise<void>((resolve, reject) => {
			if (0 === this.operations.length) {
				this.done();
				resolve();
				return;
			}

			// Trigger preSubmitAction
			for (const preSubmitAction of this.preSubmitActions) {
				preSubmitAction();
			}

			for (const store of this.stores) {
				RecordCacheStore.Default.fire(store.identify);
			}

			// Trigger postSubmitAction
			for (const postSubmitAction of this.postSubmitActions) {
				postSubmitAction();
			}
			this.committed = true;
			this.done();
			resolve();

		});
	}

	addOperation(store: RecordStore, operation: Operation) {
		let record = store.getRecordStoreAtRootPath().getValue();
		const role = store.getRecordStoreAtRootPath().getRole();
		record = CommandFacade.execute(operation, record);

		RecordCacheStore.Default.setRecord({
			pointer: store.pointer,
			userId: store.userId
		}, {
			value: record,
			role: role || Role.Editor
		});

		store.sync();

		this.operations.push(operation);
		this.stores.push(store);
	}
}
