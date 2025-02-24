class Title extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div>
            #<span class="highlight">,,,</span>
            <span class="spacer"></span>
                <a href="/" data-link>3615 - Home</a>
            </div>
        `;
    }
}

customElements.define("c-title", Title);
