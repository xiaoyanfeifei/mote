import { Pointer } from 'mote/platform/store/common/record';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export const IStoreService = createDecorator<IStoreService>('storeService');


export interface IStoreService {
	addSubscription(userId: string, pointer: Pointer): void;
}


