import { sha1Hex } from 'vs/base/browser/hash';
import { doFetch } from 'mote/base/parts/request/common/request';
import { CaffeineResponse, LoginData, SyncRecordRequest, UserLoginPayload } from 'mote/client/common/client';
import { CaffeineError } from 'mote/base/common/errors';
import RequestQueue from 'mote/client/common/requestQueue';
import { Pointer, RecordWithRole } from 'mote/client/common/record';
import { Lodash } from 'mote/base/common/lodash';


type IRecordMap = { [key: string]: { [key: string]: RecordWithRole } };

class RecordMap {
	data: { [key: string]: { [key: string]: RecordWithRole } };

	constructor(recordMap: { [key: string]: { [key: string]: RecordWithRole } }) {
		this.data = recordMap;
	}

	get(pointer: Pointer) {
		const map = this.data[pointer.table];
		if (map) {
			return map[pointer.id];
		}
		return undefined;
	}

	getByTable(table: string) {
		const map = this.data[table] || {};
		return Object.entries(map).map(entry => {
			return {
				pointer: {
					table: table,
					id: entry[0]
				},
				value: entry[1]
			};
		});
	}
}

const syncRecordValuesQueue = new RequestQueue<SyncRecordRequest, RecordWithRole>({
	performRequests: async (requests: SyncRecordRequest[]) => {
		const uniqueRequests = Lodash.uniqWith(requests, (value, other) => {
			if (!other) {
				return false;
			}
			return value.id === other.id && value.table === other.table && value.version === other.version;
		});
		const recordMap = await syncRecordValues(uniqueRequests);
		return requests.map(request => recordMap.get(request))
			.filter(recordWithRole => recordWithRole !== undefined) as RecordWithRole[];
	},
	batchSize: 5,
	maxWorkers: 2,
	requestDelayMs: 200,
	requestTimeoutMs: 3000
});

const syncRecordValues = async (requests: SyncRecordRequest[]) => {
	if (requests.length === 0) {
		return new RecordMap({});
	}
	const requestMap: { [key: string]: SyncRecordRequest } = {};
	for (const request of requests) {
		const key = `${request.table}|${request.id}|${request.version}`;
		requestMap[key] = request;
	}
	requests = Object.keys(requestMap).map(key => requestMap[key]);
	const recordValues = await doFetch<IRecordMap>('/api/syncRecordValues', requests, 'POST');
	const data = recordValues ? recordValues : {};
	const recordMap = new RecordMap(data);
	return recordMap;
};

export class Client {

	//#region user

	static async getUser(userId: string): Promise<LoginData> {
		return this.doGet<LoginData>(`/api/user/${userId}`);
	}

	static async login(payload: UserLoginPayload): Promise<LoginData> {
		// Build password with salt
		const password = await sha1Hex('mote' + payload.password);
		payload.password = password;
		return this.doPost<LoginData>(`/api/user/login`, payload);
	}

	static async syncRecordValue(userId: string, pointer: Pointer, version?: number): Promise<RecordWithRole> {
		return syncRecordValuesQueue.enqueue({
			id: pointer.id,
			table: pointer.table,
			version: version ?? -1
		});
	}

	private static async doGet<T>(url: string) {
		const response = await doFetch<CaffeineResponse<T>>(url, null, 'GET');
		if (response.code === 0) {
			return response.data;
		}
		throw new Error(response.message);
	}

	private static async doPost<T>(url: string, payload: any) {
		const response = await doFetch<CaffeineResponse<T>>(url, payload, 'POST');
		if (response.code === 0) {
			return response.data;
		}
		throw new CaffeineError(response.message, response.code);
	}
}




