import { Ws, setWs } from "../main.js";

class Connection extends HTMLElement {
    constructor() {
        super();
        this.User = {Username: "", Password: ""}
        this.monitor = { isLoading: false, error: null };
        this.placeHolder = "...................................................................................................";
        this.render();
    }

    connectedCallback() {
        let usernameInput = this.querySelector('#username');
        usernameInput.oninput = (e) => {
            this.User.Username = e.target.value;
        };

        let passwordInput = this.querySelector('#password');
        passwordInput.oninput = (e) => {
            this.User.Password = e.target.value;
        };

        let button = this.querySelector('button');
        button.onclick = () => {
            this.getUser();
        }
    }

    async getUser() {
        try {
            this.monitor = {isLoading: true, error: null};
            this.render();
            const response = await fetch('/get_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.User)
            });
            const data = await response.json();
            await new Promise(resolve => setTimeout(resolve, 500));
            if (data.Error) {
                throw new Error(data.Message);
            }
            setWs(new WebSocket("/ws"));
            Ws.onopen = () => {
                Ws.send(JSON.stringify(data));
            };
            this.monitor = {isLoading: false, error: null};
            this.render();
            const app = document.querySelector("c-app");
            app.activePath = "/";
            app.render();
        } catch (error) {
            this.monitor = {isLoading: false, error: error};
            this.render();
            this.connectedCallback();
        }
    }

    render() {
        this.innerHTML = `
            <div>
            <div class="y_spacer"></div>
                <label>
                    Username/E-mail:
                    <input type="text" id="username" placeholder="${this.placeHolder}" />
                </label>
                <label>
                    Password:
                    <input type="password" id="password" placeholder="${this.placeHolder}" />
                </label>
                <label>
                    <button>Connection</button>
                </label>
                ${this.monitor.error ? this.monitor.error : ''}
                <div class="y_spacer"></div>
            </div>
            ${this.monitor.isLoading ? '<div class="loader">Connection to the World Wide Web</div>' : ''}
        `;
    }
}

customElements.define("c-connection", Connection);
