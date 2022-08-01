import { Operation } from 'mote/platform/transaction/common/operations';

export interface TransactionData {
	id: string;
	operations: Operation[];
}

export const TransactionQueue: TransactionData[] = [];
