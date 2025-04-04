import { Connected, setConnected, Ws } from "../main.js";

class Nav extends HTMLElement {
    constructor() {
        super();
        this.totalUnreadMessages = 0;
        //this.connected = document.querySelector('c-app').connected;
        this.activePath = document.querySelector('c-app').activePath;
        this.render();

        document.addEventListener('unreadMessagesUpdated', (event) => {
            this.totalUnreadMessages = event.detail.total;
            this.render();
        });
    }

    connectedCallback() {
        if (Connected) {
            let quit = this.querySelector('#quit');
            quit.onclick = () => {
                this.deleteSession();
            }
        }
    }

    async deleteSession() {
        try {
            const response = await fetch("/delete_session");
            const data = await response.json();
            if (data.Error) {
                throw new Error(data.Message);
            }
            setConnected(false);
            Ws.close();
            const app = document.querySelector("c-app");
            app.activePath = "/"
            app.render();
        } catch (error) {
            console.error("Error deleting session:", error);
        }
    }

    render() {
        this.innerHTML = `
            <div>
                <a href="/" ${this.activePath === "/" ? `class="highlight"` : ""} data-link>H)ome</a>
                ${!Connected ?
                    `<a href="/connection" ${this.activePath === "/connection" ? `class="highlight"` : ""} data-link>C)onnection</a>
                    <a href="/register" ${this.activePath === "/register" ? `class="highlight"` : ""} data-link>R)egister</a>`
                    :
                    `<a href="/write" ${this.activePath === "/write" ? `class="highlight"` : ""} data-link>W)rite</a>
                    <a href="/messages" ${this.activePath === "/messages" ? `class="highlight"` : ""} data-link>M)essages ${this.totalUnreadMessages > 0 ? `(${this.totalUnreadMessages})` : ''}</a>
                    <a href="#" id="quit">Q)uit</a>`
                }
            </div>
        `;
        this.connectedCallback();
    }
}

customElements.define("c-nav", Nav);
