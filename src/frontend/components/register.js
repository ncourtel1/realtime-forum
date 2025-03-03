class Register extends HTMLElement {
    constructor() {
        super();
        this.user = {
            Username : "",
            Age : "",
            Gender : "undefined",
            FirstName : "",
            LastName : "",
            Email : "",
            Password : ""
        }
        // this.username = "";
        // this.age = "";
        // this.gender = "undefined";
        // this.firstName = "";
        // this.lastName = "";
        // this.email = "";
        // this.password = "";
        this.monitor = { isLoading: false, error: null };
        this.placeHolder = "...................................................................................................";
        this.render();
    }

    connectedCallback() {
        let usernameInput = this.querySelector('#username');
        usernameInput.oninput = (e) => {
            this.user.Username = e.target.value;
        };

        let ageInput = this.querySelector('#age');
        ageInput.oninput = (e) => {
            this.user.Age = parseInt(e.target.value);
        };

        let genderInput = this.querySelector('#gender');
        genderInput.oninput = (e) => {
            this.user.Gender = e.target.value;
        };

        let firstNameInput = this.querySelector('#firstName');
        firstNameInput.oninput = (e) => {
            this.user.FirstName = e.target.value;
        };

        let lastNameInput = this.querySelector('#lastName');
        lastNameInput.oninput = (e) => {
            this.user.LastName = e.target.value;
        };

        let emailInput = this.querySelector('#email');
        emailInput.oninput = (e) => {
            this.user.Email = e.target.value;
        };

        let passwordInput = this.querySelector('#password');
        passwordInput.oninput = (e) => {
            this.user.Password = e.target.value;
        };

        let button = this.querySelector('button');
        button.onclick = () => {
            this.registerUser();
        }
    }

    async registerUser() {
        try {
            this.monitor = {isLoading: true, error: null};
            this.render();
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.user)
            });
    
            if (!response.ok) {
                this.monitor = {isLoading: false, error: `${response.status} ${response.statusText}`};
                this.render();
            }
            const data = await response.json();
            this.monitor = {isLoading: false, error: null};
            this.render();
            console.log(data);
            const app = document.querySelector("c-app");
            app.activePath = "/";
            app.render();
        } catch (error) {
            this.monitor = {isLoading: false, error: error.message};
            this.render();
        }
    }

    render() {
        this.innerHTML = `
            <div>
            <div class="y_spacer"></div>
                <label>
                    Username:
                    <input type="text" id="username" placeholder="${this.placeHolder}" />
                </label>
                <label>
                    Age:
                    <input type="text" id="age" placeholder="${this.placeHolder}" />
                </label>
                <label>
                    Gender:
                    <select id="gender">
                        <option value="undefined">Undefined</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="fluid">Fluid</option>
                    </select>
                </label>
                <label>
                    First Name:
                    <input type="text" id="firstName" placeholder="${this.placeHolder}" />
                </label>
                <label>
                    Last Name:
                    <input type="text" id="lastName" placeholder="${this.placeHolder}" />
                </label>
                <label>
                    E-mail:
                    <input type="email" id="email" placeholder="${this.placeHolder}" />
                </label>
                <label>
                    Password:
                    <input type="password" id="password" placeholder="${this.placeHolder}" />
                </label>
                <label>
                    <button>Register</button>
                </label>
                ${this.monitor.error ? 'Error: ' + this.monitor.error : ''}
                <div class="y_spacer"></div>
            </div>
            ${this.monitor.isLoading ? '<div class="loader">Registering to the World Wide Web</div>' : ''}
        `;
    }
}

customElements.define("c-register", Register);
