import "./title.js";
import "./nav.js";
import "./posts.js";
import "./connection.js";
import "./register.js";
import "./messages.js";
import "./write.js";
import { setConnected, setUser, User, Ws, setWs } from "../main.js";

class App extends HTMLElement {
    constructor() {
        super();
        this.activePath = "/";
        //this.connected = false;
        //this.User = {UserID: "", Username: ""};
        this.render();
    }

    async checkSession() {
        try {
            const response = await fetch("/get_session");    
            const data = await response.json();
            if (data.Error) {
                throw new Error(data.Message);
            }
            if (User.Username != data.username) {
                if (!Ws) {
                    setWs(new WebSocket("/ws"));
                    Ws.onopen = () => {
                        Ws.send(JSON.stringify(data));
                    };
                }
                setUser(data);
                setConnected(true);
                const nav = document.querySelector("c-nav");
                nav.render();
                const title = document.querySelector("c-title");
                title.render();
            }
        } catch (error) {
            this.activePath = "/";
            if (User.Username != "") {
                setUser({UserID: "", Username: ""});
                setConnected(false);
                this.render();
            }
        }
    }

    render() {
        this.checkSession();
        this.activePath === '/' ? document.title = "3615 - Home" :
        this.activePath === '/connection' ? document.title = "3615 - Connection" :
        this.activePath === '/register' ? document.title = "3615 - Register" :
        this.activePath === '/messages' ? document.title = "3615 - Messages" : '';
        this.activePath === '/write' ? document.title = "3615 - Write" : '';
        this.innerHTML = `
            <c-title></c-title>
            <c-nav></c-nav>
            ${this.activePath === '/' ? '<c-posts></c-posts>' : ''}
            ${this.activePath === '/connection' ? '<c-connection></c-connection>' : ''}
            ${this.activePath === '/register' ? '<c-register></c-register>' : ''}
            <c-messages style="${this.activePath === '/messages' ? 'display: block;' : 'display: none;'}"></c-messages>
            ${this.activePath === '/write' ? '<c-write></c-write>' : ''}
        `;
    }
}

customElements.define("c-app", App);
