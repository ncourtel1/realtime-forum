class SignIn extends HTMLElement {
    constructor() {
        super();
        this.username = "";
        this.password = "";
        this.monitor = { isLoading: false, error: null };
        this.placeHolder = "...................................................................................................";
        this.render();
    }

    connectedCallback() {
        let usernameInput = this.querySelector('#username');
        usernameInput.oninput = (e) => {
            this.username = e.target.value;
        };

        let passwordInput = this.querySelector('#password');
        passwordInput.oninput = (e) => {
            this.password = e.target.value;
        };

        let button = this.querySelector('button');
        button.onclick = () => {
            this.monitor.isLoading = true;
            this.render();
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
                ${this.monitor.error ? 'Error: ' + this.monitor.error : ''}
                <div class="y_spacer"></div>
            </div>
            ${this.monitor.isLoading ? '<div class="loader">Connection to the World Wide Web</div>' : ''}
        `;
    }
}

customElements.define("c-sign-in", SignIn);
