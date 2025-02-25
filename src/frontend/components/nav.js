class Nav extends HTMLElement {
    constructor() {
        super();
        this.connected = document.querySelector('c-app').connected;
        this.activePath = document.querySelector('c-app').activePath;
        this.render();
    }

    connectedCallback() {
        if (this.connected) {
            let quit = this.querySelector('#quit');
            quit.onclick = () => {
                const app = document.querySelector("c-app");
                app.connected = false
                app.activePath = "/";
                app.render();
            }
        }
    }

    render() {
        this.innerHTML = `
            <div>
                <a href="/" ${this.activePath === "/" ? `class="highlight"` : ""} data-link>H)ome</a>
                ${!this.connected ?
                    `<a href="/connection" ${this.activePath === "/connection" ? `class="highlight"` : ""} data-link>C)onnection</a>
                    <a href="/register" ${this.activePath === "/register" ? `class="highlight"` : ""} data-link>R)egister</a>`
                    :
                    `<a href="/messages" ${this.activePath === "/messages" ? `class="highlight"` : ""} data-link>M)essages</a>
                    <a href="#" id="quit">Q)uit</a>`
                }
            </div>
        `;
    }
}

customElements.define("c-nav", Nav);
