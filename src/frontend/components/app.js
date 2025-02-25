import "./title.js";
import "./nav.js";
import "./posts.js";
import "./connection.js";
import "./register.js";

class App extends HTMLElement {
    constructor() {
        super();
        this.activePath = "/";
        this.connected = true;
        this.render();
    }

    render() {
        this.activePath === '/' ? document.title = "3615 - Home" :
        this.activePath === '/connection' ? document.title = "3615 - Connection" :
        this.activePath === '/register' ? document.title = "3615 - Register" : '';
        this.innerHTML = `
            <c-title></c-title>
            <c-nav></c-nav>
            ${this.activePath === '/' ? '<c-posts></c-posts>' : ''}
            ${this.activePath === '/connection' ? '<c-connection></c-connection>' : ''}
            ${this.activePath === '/register' ? '<c-register></c-register>' : ''}
        `;
    }
}

customElements.define("c-app", App);
