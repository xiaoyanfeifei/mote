import { HTMLAttributes } from ".";
import { Attributes, Fragment, FunctionComponent, MoteNode } from "./jsx";
import { CSSProperties } from "./style";

interface NamedAttribute {
    className: string;
    style: CSSProperties;
}


interface AttributeCollection extends NamedAttribute {
    [name: string]: string | boolean | EventListenerOrEventListenerObject | CSSProperties;
}


 // DOM Elements
export function createElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
    type: string,
    props?: Attributes & P | null,
    ...children: MoteNode[]);

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
        return createElementWithHtml(type, props, children);
    }
    return type({...props, children: children})
}

function createElementWithHtml(tagName: string, attributes?: HTMLAttributes<any> & Attributes | null, ...children: any[]): Element | DocumentFragment {
    if (tagName === Fragment) {
        const element = document.createDocumentFragment();
        for (const child of children) {
            appendChild(element, child);
        }
    
        return element;
    }

    const element = document.createElement(tagName);
    if (attributes) {
        for (const key of Object.keys(attributes)) {
            const attributeValue = attributes[key];

            if (key === "className") { // JSX does not allow class as a valid name
                element.setAttribute("class", attributes.className!);
            } else if (key === "style") {
                setStyles(element, attributes.style!);
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

function setStyles(element: HTMLElement, styles: CSSProperties) {
    
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