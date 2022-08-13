/* eslint-disable code-no-unexternalized-strings */


interface SVGData {
	d?: string;
}

export type SVGDataProperty = keyof SVGData;

function createElement(qualifiedName: string, data: { [key: string]: string } | null, ...children: (SVGElement | string)[]): SVGElement {
	const container = document.createElementNS('http://www.w3.org/2000/svg', qualifiedName);
	if (data) {
		Object.keys(data).forEach((key) => {
			container.setAttribute(key, data[key]);
		});
	}
	for (const child of children) {
		if (typeof child === 'string') {
			container.appendChild(document.createTextNode(child));
		} else {
			container.appendChild(child);
		}
	}
	return container;
}

export default {
	alarmClock: {
		className: 'alarmClock',
		viewBox: '0 0 14 14',
		svg: createElement("path", {
			d: "M4.31165,1.1958 L1.01208,3.95264 L0,2.75684 L3.30725,0 L4.31165,1.1958 Z M14,2.76416 L12.988,3.95947 L9.68127,1.1958 L10.6932,0 L14,2.76416 Z M7,1.50244 C10.4635,1.50244 13.2732,4.2998 13.2732,7.75098 C13.2732,11.2026 10.4635,14 7,14 C3.52954,14 0.726929,11.2026 0.726929,7.75098 C0.726929,4.2998 3.5365,1.50244 7,1.50244 Z M7.44116,4.23584 L7.44116,7.86572 L10.2234,9.50781 L9.60596,10.5166 L6.21594,8.49023 L6.21594,4.23584 L7.44116,4.23584 Z M2.29517,7.75098 C2.29517,10.3408 4.39819,12.4365 7,12.4365 C9.60181,12.4365 11.7048,10.3408 11.7048,7.75098 C11.7048,5.16113 9.60181,3.06543 7,3.06543 C4.39819,3.06543 2.29517,5.16113 2.29517,7.75098 Z"
		})
	},
	page: {
		className: "page",
		viewBox: "0 0 30 30",
		svg: createElement("g", null, " ", createElement("path", {
			d: "M16,1H4v28h22V11L16,1z M16,3.828L23.172,11H16V3.828z M24,27H6V3h8v10h10V27z M8,17h14v-2H8V17z M8,21h14v-2H8V21z M8,25h14v-2H8V25z"
		}), " ")
	},
	plus: {
		className: "plus",
		viewBox: "0 0 16 16",
		svg: createElement("path", {
			d: "M7.977 14.963c.407 0 .747-.324.747-.723V8.72h5.362c.399 0 .74-.34.74-.747a.746.746 0 00-.74-.738H8.724V1.706c0-.398-.34-.722-.747-.722a.732.732 0 00-.739.722v5.529h-5.37a.746.746 0 00-.74.738c0 .407.341.747.74.747h5.37v5.52c0 .399.332.723.739.723z"
		})
	},
	image: {
		className: "image",
		viewBox: "0 0 30 30",
		svg: createElement("path", {
			d: "M2,2v26h26V2H2z M26,26H4v-4h22V26z M26,20H4V4h22V20z M8,10c1.104,0,2-0.896,2-2S9.104,6,8,6S6,6.896,6,8S6.896,10,8,10z M18,7l-5,5l-2-1l-5,7h18L18,7z M11.635,13.553l1.76,0.881l4.129-4.129L20.631,16H9.887L11.635,13.553z"
		})
	},
	picture: {
		className: "picture",
		viewBox: "0 0 30 30",
		svg: createElement("path", {
			d: "M1,4v22h28V4H1z M27,24H3V6h24V24z M18,10l-5,6l-2-2l-6,8h20L18,10z M11.216,17.045l1.918,1.918l4.576-5.491L21.518,20H9 L11.216,17.045z M7,12c1.104,0,2-0.896,2-2S8.104,8,7,8s-2,0.896-2,2S5.896,12,7,12z"
		})
	},
};
