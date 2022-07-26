import * as assert from 'assert';
import { MoteSVGElement } from 'mote/base/browser/jsx';
import { createElement } from "mote/base/browser/jsx/createElement"
import SVGIcon from "mote/base/browser/ui/svgicon/svgicon"

suite('SVGIcon impl', () => {

    test('Create page icon', ()=> {
        const icon: SVGElement = <SVGIcon name="page" style={{fill: "#ffffff"}}/>
        const svg = document.createElement("svg");
        const g = document.createElement("g");
        const path = document.createElement("path");
        path.setAttribute("d", "M16,1H4v28h22V11L16,1z M16,3.828L23.172,11H16V3.828z M24,27H6V3h8v10h10V27z M8,17h14v-2H8V17z M8,21h14v-2H8V21z M8,25h14v-2H8V25z")
        g.appendChild(path);
        svg.appendChild(g)
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.display = "block";
        svg.style.fill = "#ffffff";
        svg.style.flexShrink = "0";
        svg.style.webkitBackfaceVisibility = "hidden";
        svg.setAttribute("viewBox", "0 0 30 30");
        console.log("svg:", svg.outerHTML);
        console.log("icon:", icon.outerHTML);
        assert(svg.isEqualNode(icon));
    })
})
