import { generateUuid } from 'vs/base/common/uuid';
import { OfflineError } from 'vs/base/parts/request/common/request';

export const config = {
	apiDev: 'http://localhost:7071',
	apiProd: 'https://caffeine-function.azurewebsites.net',
	apiDomain: '',
};


export async function doFetch<T>(url: string, payload: any, method: string): Promise<T> {
	if (!navigator.onLine) {
		throw new OfflineError();
	}
	const uuid = generateUuid();
	const requestId = uuid.replaceAll('-', '');
	const token = sessionStorage.getItem('auth_token');
	url = `${config.apiDomain}${url}`;
	try {
		const response = await fetch(url, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-Request-ID': requestId,
				'Authorization': `Bearer ${token}`
			},
			mode: 'cors',
			method: method,
			body: payload && JSON.stringify(payload)
		});
		return response.ok && response.json();
	} catch (err) {
		return Promise.reject(err);
	}
}
