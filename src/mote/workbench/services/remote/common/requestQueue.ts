interface PromiseWithAction<T> {
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: any) => void;
	promise: Promise<T>;
}

function buildPromise<T>(): PromiseWithAction<T> {
	let e: (value: T | PromiseLike<T>) => void = undefined as any;
	let t: (reason?: any) => void = undefined as any;
	const promise = new Promise<T>((resolve, reject) => {
		e = resolve;
		t = reject;
	});
	return {
		resolve: e,
		reject: t,
		promise: promise
	};
}

interface ResponseWithTimeout<T> {
	result?: T;
	timeout: boolean;
}

async function requestWithTimeout<T>(timeout: number, requests: Promise<T>[]): Promise<ResponseWithTimeout<T>> {
	const promiseWithAction = buildPromise<ResponseWithTimeout<T>>();
	const r = setTimeout(() => {
		promiseWithAction.resolve({
			result: void 0,
			timeout: true
		});
	}, timeout);
	const promiseWithTimeout = await Promise.race([promiseWithAction.promise, Promise.race(requests).then(e => ({
		result: e,
		timeout: false
	}))]);
	clearTimeout(r);
	return promiseWithTimeout;
}

type QueueEntity<T, K> = [T, PromiseWithAction<K>];


interface RequestQueueProps<REQUEST, RESPONSE> {
	performRequests: (requests: REQUEST[]) => Promise<RESPONSE[]>;
	batchSize: number;
	maxWorkers: number;
	requestDelayMs: number;
	requestTimeoutMs: number;
}

export default class RequestQueue<REQUEST, RESPONSE> {

	queue: QueueEntity<REQUEST, RESPONSE>[] = [];
	currentWorkers = 0;
	currentSetTimeouts = 0;
	maxWorkers: number = 0;
	batchSize: number = 20;
	requestDelayMs: number = 0;
	requestTimeoutMs: number = 0;
	performRequests: (requests: REQUEST[]) => Promise<RESPONSE[]>;

	constructor(props: RequestQueueProps<REQUEST, RESPONSE>) {
		this.batchSize = props.batchSize;
		this.performRequests = props.performRequests;
		this.maxWorkers = props.maxWorkers;
		this.requestDelayMs = props.requestDelayMs || 0;
		this.requestTimeoutMs = props.requestTimeoutMs;
	}

	getQueueSize() {
		return this.queue.length;
	}
	updateBatchSize(batchSize: number) {
		this.batchSize = batchSize;
	}
	updateRequestDelayMs(deplay: number) {
		this.requestDelayMs = deplay;
	}

	enqueue(request: REQUEST) {
		const promiseWithAction = buildPromise<RESPONSE>();
		this.queue.push([request, promiseWithAction]);
		this.dequeueAfterTimeout();
		return promiseWithAction.promise;
	}

	dequeue = async () => {
		this.currentSetTimeouts = 0;
		if (this.currentWorkers >= this.maxWorkers || 0 === this.queue.length) {
			return;
		}
		this.currentWorkers++;
		const batchEntities = this.queue.splice(0, this.batchSize);
		const batchRequests = batchEntities.map(entity => entity[0]);

		let batchResults, err;
		try {
			if (this.requestTimeoutMs) {
				const response = await requestWithTimeout<RESPONSE[]>(this.requestTimeoutMs, [this.performRequests(batchRequests)]);
				if (response.timeout) {
					throw new Error('Timed out.');
				}
				batchResults = response.result;
			} else {
				batchResults = await this.performRequests(batchRequests);
			}
		} catch (exception) {
			err = exception;
		}
		try {
			if (err) {
				for (let t = 0; t < batchEntities.length; t++) {
					batchEntities[t][1].reject(err);
				}
			}
			else if (batchResults) {
				for (let index = 0; index < batchEntities.length; index++) {
					const entity = batchEntities[index];
					const result = batchResults[index];
					entity[1].resolve(result);
				}
			}
		} catch (err) {

		}
		this.currentWorkers--;
		this.queue.length >= this.batchSize ? this.dequeue() : this.dequeueAfterTimeout();
	};

	dequeueAfterTimeout = () => {
		if (this.currentSetTimeouts < this.maxWorkers) {
			this.currentSetTimeouts++;
			setTimeout(this.dequeue, this.requestDelayMs);
		}
	};
}
