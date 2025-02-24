import { activePath } from "../../main.js";

class Nav extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div>
                <a href="/" ${activePath === "/" ? `class="highlight"` : ""} data-link>H)ome</a>
                <a href="/sign" ${activePath === "/sign" ? `class="highlight"` : ""} data-link>S)ign</a>
                <a href="/messages" ${activePath === "/messages" ? `class="highlight"` : ""} data-link>M)essages</a>
            </div>
        `;
    }
}

customElements.define("c-nav", Nav);
