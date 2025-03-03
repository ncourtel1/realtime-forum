class Write extends HTMLElement {
    constructor() {
        super();
        this.username = "";
        this.password = "";
        this.monitor = { isLoading: false, error: null };
        this.placeHolder = "............................................................................................................................................................................................................................................................................................................................................................................................................";
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

        let genderInput = this.querySelector('#category');
        genderInput.oninput = (e) => {
            this.user.Gender = e.target.value;
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
                    Title:
                    <input type="text" id="title" placeholder="${this.placeHolder}" />
                </label>
                <label>
                    Category:
                    <select id="category">
                        <option value="undefined">Undefined</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="fluid">Fluid</option>
                    </select>
                </label>
                <label>
                    <button>+</button>
                </label>
                <label>
                    Post:
                    <textarea id="post" placeholder="${this.placeHolder}"></textarea>
                </label>
                <label>
                    <button>Send to the World Wide Web</button>
                </label>
                ${this.monitor.error ? 'Error: ' + this.monitor.error : ''}
                <div class="y_spacer"></div>
            </div>
            ${this.monitor.isLoading ? '<div class="loader">Connection to the World Wide Web</div>' : ''}
        `;
    }
}

customElements.define("c-write", Write);
