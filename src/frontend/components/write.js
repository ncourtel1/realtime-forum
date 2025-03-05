class Write extends HTMLElement {
    constructor() {
        super();
        this.categories = [];
        this.Post = {Title: "", Content: "", Category: 0};
        this.newCategory = {name: ""};
        this.isCategoryExpanded = false;
        this.monitor = { isLoading: false, error: null };
        this.placeHolder = "............................................................................................................................................................................................................................................................................................................................................................................................................";
        this.getCategories();
    }

    connectedCallback() {
        let add = this.querySelector('#add');
        add.onclick = () => {
            this.isCategoryExpanded = !this.isCategoryExpanded;
            this.render();
            this.connectedCallback();
        }
        if (this.isCategoryExpanded) {
            let newCategoryName = this.querySelector('#new_category');
            newCategoryName.oninput = (e) => {
                this.newCategory.name = e.target.value;
            };
        
            let save = this.querySelector('#save');
            save.onclick = () => {
                this.createCategory();
            }
        }

        let title = this.querySelector('#title');
        title.oninput = (e) => {
            this.Post.Title = e.target.value;
            console.log(this.Post);
        };

        let content = this.querySelector('#post');
        content.oninput = (e) => {
            this.Post.Content = e.target.value;
        };

        let category = this.querySelector('#category');
        category.onchange = (e) => {
            this.Post.Category = parseInt(e.target.value);
        };

        let send = this.querySelector('#send');
        send.onclick = () => {
            this.createPost();
        }
    }

    async createCategory() {
        try {
            this.monitor = {isLoading: true, error: null};
            this.render();
            const response = await fetch('/create_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.newCategory)
            });
            const data = await response.json();
            await new Promise(resolve => setTimeout(resolve, 500));
            if (data.Error) {
                throw new Error(data.Message);
            }
            this.isCategoryExpanded = !this.isCategoryExpanded;
            this.getCategories();
        } catch (error) {
            this.monitor = {isLoading: false, error: error};
            this.render();
        }
    }

    async createPost() {
        try {
            this.monitor = {isLoading: true, error: null};
            this.render();
            const response = await fetch('/create_post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.Post)
            });
            const data = await response.json();
            await new Promise(resolve => setTimeout(resolve, 500));
            if (data.Error) {
                throw new Error(data.Message);
            }
            this.monitor = {isLoading: false, error: null};
            this.render();
            const app = document.querySelector("c-app");
            app.activePath = "/";
            app.render();
        } catch (error) {
            this.monitor = {isLoading: false, error: error};
            this.render();
        }
    }

    async getCategories() {
        try {
            this.monitor = {isLoading: true, error: null};
            this.render();
            const response = await fetch('/get_categories');
            const data = await response.json();
            await new Promise(resolve => setTimeout(resolve, 500));
            if (data.Error) {
                throw new Error(data.Message);
            }
            this.categories = data;
            this.monitor = {isLoading: false, error: null};
            this.render();
            this.connectedCallback();
        } catch (error) {
            this.monitor = {isLoading: false, error: error};
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
                    ${this.categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('')}
                    </select>
                </label>
                <label>
                    <button id="add">${this.isCategoryExpanded ? 'Cancel' : '+'}</button>
                </label>
                ${this.isCategoryExpanded ?
                    `
                    <label>
                        New Category:
                        <input type="text" id="new_category" placeholder="${this.placeHolder}" />
                    </label>
                    <label>
                        <button id="save">Save</button>
                    </label>`
                     : ''}
                <label>
                    Post:
                    <textarea id="post" placeholder="${this.placeHolder}"></textarea>
                </label>
                <label>
                    <button id="send">Send to the World Wide Web</button>
                </label>
                ${this.monitor.error ? 'Error: ' + this.monitor.error : ''}
                <div class="y_spacer"></div>
            </div>
            ${this.monitor.isLoading ? '<div class="loader">Connection to the World Wide Web</div>' : ''}
        `;
    }
}

customElements.define("c-write", Write);
