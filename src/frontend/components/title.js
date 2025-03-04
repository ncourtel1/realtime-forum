import { User } from "../main.js";

class Title extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    render() {
        const title = document.title
        this.innerHTML = `
            <div>
            #<span class="highlight">,,,</span>
            ${User.username !== undefined ? `<span style="margin-left: 10px;">${User.username}</span>` : ''}
            <span class="spacer"></span>
                <a href="/" data-link>${title}</a>
            </div>
        `;
    }
}

customElements.define("c-title", Title);
