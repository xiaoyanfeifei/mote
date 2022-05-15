import { CSSProperties } from 'mote/base/jsx';
import { createElement } from 'mote/base/jsx/createElement';
import SVGContainer from './svgcontainer';

interface SVGIconProps {
    name: SVGProperty;
    style?: CSSProperties;
}

type SVGProperties = typeof SVGContainer;

export type SVGProperty = keyof SVGProperties;

export default function SVGIcon(props:SVGIconProps) {
    const property = SVGContainer[props.name];
    const {svg, viewBox, className} = property;
    return createElement("svg", {
        viewBox: viewBox,
        style: Object.assign({
            width: "100%",
            height: "100%",
            display: "block",
            fill: "inherit",
            flexShrink: 0,
            WebkitBackfaceVisibility: "hidden"
        }, props.style),
        className: className
    }, svg)
}