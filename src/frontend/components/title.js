class Title extends HTMLElement {
    constructor() {
        super();
        const title = document.title
        this.innerHTML = `
            <div>
            #<span class="highlight">,,,</span>
            <span class="spacer"></span>
                <a href="/" data-link>${title}</a>
            </div>
        `;
    }
}

customElements.define("c-title", Title);
