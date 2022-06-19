import { setStyles } from "mote/base/jsx/createElement";
import fonts from "mote/base/ui/fonts";
import { ThemedBase, ThemedColors } from "mote/base/ui/themes";
import { getFirstInArray, getSecondArrayInArray, Segment } from "./segmentUtils";

const CLASS_TEXT_MENTION_TOKEN = "mote-text-mention-token";

function isNode(node?: Node | null) {
    try {
        return node && void 0 !== node.nodeType
    } catch (_) {
        return false;
    }
};

function isElementNode(node?: Node) {
    return isNode(node) && node!.nodeType === Node.ELEMENT_NODE
}

function isTextNode(node?: Node|null) {
    return isNode(node) && node!.nodeType == Node.TEXT_NODE;
}

function isBrNode(node?: Node) {
    if (isElementNode(node)) {
        const element = node as Element;
        return "br" === element.tagName.toLowerCase();
    }
    return false;
}

function isTextMentionNode(node?: Node) {
    if (isElementNode(node)) {
        const element = node as Element;
        return element.classList.contains(CLASS_TEXT_MENTION_TOKEN);
    }
    return false;
}


function serializeNode(node: Node) {
    let result = "";
    if (isTextMentionNode(node)) {

    }
    else if (isBrNode(node)) {
        result += "\n";
    }
    else if (isTextNode(node)) {
        result += node.textContent;
    }
    else {
        for (const childNode of Array.from(node.childNodes)) {
            result += serializeNode(childNode);
        }
    }
    return result;
}

export function nodeToString(element:Node){
    let serialized = serializeNode(element);
    if("\n" === serialized[serialized.length - 1]){
        serialized = serialized.substring(0, serialized.length - 1)
    }
    return serialized;
}

export function segmentsToElement(segments: Segment[]) {
    return segments.map(segment=>{
        const textContent = getFirstInArray(segment) as string;
        const annotations:string[][] = getSecondArrayInArray(segment);

        if (annotations.length == 0) {
            return textContent;
        }

        const inlineStyle = buildStyles(annotations);
        const node = document.createElement("span");
        setStyles(node, inlineStyle);
        node.appendChild(buildText(textContent));
        return node.outerHTML;
    });
}

function buildText(text: string) {
    return document.createTextNode(text);
}

const inlineStyles = {
    b: {
        fontWeight: fonts.fontWeight.semibold
    },
    i: {
        fontStyle: "italic"
    },
    c: {
        //fontFamily: font_config.fontFamily.githubMono,
        lineHeight: "normal",
        background: ThemedBase.light.gray.alpha(.15).css(),
        color: ThemedColors.red,
        borderRadius: 3,
        fontSize: "85%",
        padding: "0.2em 0.4em"
    },
    a: {
        cursor: "pointer",
        //color: themes.f.inherit,
        wordWrap: "break-word"
    },
    s: {
        textDecoration: "line-through"
    },
    _: {
        //color: themes.f.inherit,
        borderBottom: "0.05em solid",
        wordWrap: "break-word"
    },
    "+": {
        //color: themes.f.diffTextColor,
        //backgroundColor: themes.f.diffBackground
    },
    "-": {
        opacity: .4,
        marginBottom: 6,
        textDecoration: "line-through"
    },
    z: {
        //background: b.q,
        //borderBottom: "2px solid ".concat(b.e),
        paddingBottom: 2
    },
    st: {
        borderRadius: 1,
        //background: themes.f.selectionColor,
        //boxShadow: "0 0 0 3px ".concat(themes.f.selectionColor)
    }
}

const buildStyles = (annotations:string[][])=>{
    const styles = {};
    for (const annotation of annotations) {
        const inlineStyle = inlineStyles[annotation[0]];
        inlineStyle && Object.assign(styles, inlineStyle);
    }
    return styles;
}