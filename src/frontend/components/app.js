import "./title.js";
import "./nav.js";
import "./posts.js";
import "./sign_in.js";

import { activePath } from "../main.js";

class App extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    render() {
        this.innerHTML = `
            <c-title></c-title>
            <c-nav></c-nav>
            ${activePath === '/' ? '<c-posts></c-posts>' : ''}
            ${activePath === '/sign' ? '<c-sign-in></c-sign-in>' : ''}
        `;
    }
}

customElements.define("c-app", App);
