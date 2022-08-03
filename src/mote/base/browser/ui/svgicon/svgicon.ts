/* eslint-disable code-no-unexternalized-strings */
import { CSSProperties } from 'mote/base/browser/jsx';
import SVGContainer from './svgcontainer';

interface SVGIconProps {
	name: SVGProperty;
	style?: CSSProperties;
}

//type SVGProperties = typeof SVGContainer;

export type SVGProperty = keyof typeof container;

const container = {
	page: () => {
		const g = document.createElementNS('http://www.w3.org/2000/svg', "g");
		const path = document.createElementNS('http://www.w3.org/2000/svg', "path");
		path.setAttribute("d", "M16,1H4v28h22V11L16,1z M16,3.828L23.172,11H16V3.828z M24,27H6V3h8v10h10V27z M8,17h14v-2H8V17z M8,21h14v-2H8V21z M8,25h14v-2H8V25z")
		g.appendChild(path);
		return g;
	},
	plus: () => {
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("d", "M7.977 14.963c.407 0 .747-.324.747-.723V8.72h5.362c.399 0 .74-.34.74-.747a.746.746 0 00-.74-.738H8.724V1.706c0-.398-.34-.722-.747-.722a.732.732 0 00-.739.722v5.529h-5.37a.746.746 0 00-.74.738c0 .407.341.747.74.747h5.37v5.52c0 .399.332.723.739.723z");
		return path;
	}
};

export default function SVGIcon(props: SVGIconProps) {
	const property = SVGContainer[props.name];
	const { viewBox, className } = property;
	const svg = container[props.name]();
	const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	element.style.width = "100%";
	element.style.height = "100%";
	element.style.display = "block";
	if (props.style) {
		element.style.fill = props.style!.fill as string;
	}
	element.style.flexShrink = "0";
	element.setAttribute("viewBox", viewBox);
	element.classList.add(className);
	element.appendChild(svg);
	return element;
}
