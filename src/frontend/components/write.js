class Write extends HTMLElement {
    constructor() {
        super();
        this.categories = [];
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
            if (!response.ok) {
                this.monitor = {isLoading: false, error: `${response.status} ${response.statusText}`};
                this.render();
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            this.isCategoryExpanded = !this.isCategoryExpanded;
            this.getCategories();
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
            if (!response.ok) {
                this.monitor = {isLoading: false, error: `${response.status} ${response.statusText}`};
                this.render();
            }
            const data = await response.json();
            await new Promise(resolve => setTimeout(resolve, 500));
            this.categories = data;
            this.monitor = {isLoading: false, error: null};
            this.render();
            this.connectedCallback();
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
                    Title:
                    <input type="text" id="title" placeholder="${this.placeHolder}" />
                </label>
                <label>
                    Category:
                    <select id="category">
                    ${this.categories.map(category => `<option value="${category.name}">${category.name}</option>`).join('')}
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
