import { ClassAttributes, Attributes, FunctionComponent, DOMAttributes, DOMElement, HTMLAttributes, MoteHTML, MoteSVG, MoteNode, MoteSVGElement, SVGAttributes } from ".";
import { Fragment  } from "./jsx";
import { CSSProperties } from "./style";

interface NamedAttribute {
    className: string;
    style: CSSProperties;
}

type MoteSVGKey = keyof MoteSVG;

// DOM Elements
export function createElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
    type: keyof MoteHTML,
    props?: Attributes & P | null,
    ...children: MoteNode[]);
export function createElement<P extends DOMAttributes<T>, T extends Element>(
    type: string,
    props?: ClassAttributes<T> & P | null,
    ...children: MoteNode[]): DOMElement<P, T>;

// SVG Elements
export function createElement<P extends SVGAttributes<T>, T extends SVGElement>(
    type: keyof MoteSVG,
    props?: Attributes & P | null,
    ...children: MoteNode[]): MoteSVGElement;

// Custom components
export function createElement<P extends {}>(
    type: FunctionComponent<P>,
    props?:  P | null,
    ...children: MoteNode[]);

export function createElement<P>(
    type: string | FunctionComponent,
    props?: Attributes & P | null,
    ...children: MoteNode[]){
    if (typeof type == "string") {
        return createElementWithHtml(type, 'http://www.w3.org/1999/xhtml', props, children);
    }
    return type({...props, children: children})
}

function createElementWithHtml(
    tagName: string,
    namespace: string,
    attributes?: HTMLAttributes<any> & Attributes | null, 
    ...children: any[]
): Element | DocumentFragment {
    if (tagName === Fragment) {
        const element = document.createDocumentFragment();
        for (const child of children) {
            appendChild(element, child);
        }
    
        return element;
    }

    const element = document.createElementNS(namespace, tagName);
    if (attributes) {
        for (const key of Object.keys(attributes)) {
            const attributeValue = attributes[key];

            if (key === "className") { // JSX does not allow class as a valid name
                element.setAttribute("class", attributes.className!);
            } else if (key === "style") {
                setStyles(element as any, attributes.style!);
            } 
            else if (key.startsWith("on") && typeof attributes[key] === "function") {
                element.addEventListener(key.substring(2), attributeValue as EventListenerOrEventListenerObject);
            } else {
                // <input disable />      { disable: true }
                // <input type="text" />  { type: "text"}
                if (typeof attributeValue === "boolean" && attributeValue) {
                    element.setAttribute(key, "");
                } else {
                    element.setAttribute(key, attributeValue as string);
                }
            }
        }
    }

    for (const child of children) {
        appendChild(element, child);
    }

    return element;
}

type CSSKey = keyof CSSProperties;

export function setStyles(element: HTMLElement, styles?: CSSProperties) {
    if (!styles) {
        return;
    }
    const CSSKeys: CSSKey[] = Object.keys(styles) as CSSKey[];
    CSSKeys.map((key)=>{
        const value = styles[key] as string;
        element.style[key] = value;
    });
}

function appendChild(parent: Node, child: any) {
    if (typeof child === "undefined" || child === null) {
        return;
    }

    if (Array.isArray(child)) {
        for (const value of child) {
            appendChild(parent, value);
        }
    } else if (typeof child === "string") {
        parent.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
        parent.appendChild(child);
    } else if (typeof child === "boolean") {
        // <>{condition && <a>Display when condition is true</a>}</>
        // if condition is false, the child is a boolean, but we don't want to display anything
    } else {
        parent.appendChild(document.createTextNode(String(child)));
    }
}