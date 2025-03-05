class Posts extends HTMLElement {
    constructor() {
        super();
        this.monitor = { isLoading: false, error: null };
        this.Posts = []
        this.getPosts();
        this.render();
    }

    async getPosts() {
        try {
            this.monitor = {isLoading: true, error: null};
            this.render();
            const response = await fetch('/get_posts');
            const data = await response.json();
            await new Promise(resolve => setTimeout(resolve, 500));
            if (data.Error) {
                throw new Error(data.Message);
            }
            this.Posts = data;
            this.monitor = {isLoading: false, error: null};
            this.render();
            //this.connectedCallback();
        } catch (error) {
            this.monitor = {isLoading: false, error: error};
            this.render();
        }
    }

    render() {
        this.innerHTML = this.Posts.map(post => `
            <article>
                <h1>${post.Title}</h1>
                <header>
                    ${post.Username} - #<span class="highlight">${post.CategoryName}</span>
                </header>
                <section>
                    ${post.Content}
                </section>
                <footer>
                    <span class="highlight">See Comments</span>
                </footer>
            </article>
            <div></div>
        `).join('');
        this.innerHTML += `${this.monitor.error ? 'Error: ' + this.monitor.error : ''}${this.monitor.isLoading ? '<div class="loader">Connection to the World Wide Web</div>' : ''}`
    }
}

const posts = [
    {
        title: "Lorem ipsum",
        author: "John Doe",
        category: "Cheese",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris scelerisque arcu porta facilisis volutpat. Cras vel mauris molestie libero dignissim vehicula. Fusce vitae commodo nisi, bibendum iaculis tortor. Nunc consequat egestas laoreet. Nullam ornare justo id est porta tincidunt. Vivamus arcu sapien, faucibus in hendrerit porttitor, gravida sit amet nisi. Ut rutrum elit eu sem pretium, a posuere sapien euismod. Donec finibus ornare augue, eget pretium mi consectetur vel. Nulla facilisi. Nunc laoreet dolor purus, in malesuada libero tempor vel. Morbi convallis et nisi eget pellentesque. Fusce diam libero, fringilla at eros laoreet, semper laoreet quam. Vivamus ornare ex at diam mollis consequat. Nam sodales rhoncus neque, non malesuada turpis tempus a.",
    },
    {
        title: "Pellentesque",
        author: "Jean Bono",
        category: "Empire",
        body: "Pellentesque non odio scelerisque, vestibulum libero vel, tempor ipsum. Cras ultrices metus sed sapien maximus ullamcorper aliquet vitae ligula. Vestibulum non orci scelerisque neque aliquet faucibus in id elit. Vestibulum orci ligula, vulputate ut posuere tincidunt, commodo sit amet nunc. Etiam quis mi eu libero vestibulum rhoncus sed sit amet metus. Vestibulum nec diam ut magna tincidunt dignissim quis quis quam. Vestibulum at tellus porttitor, blandit ante nec, commodo lorem. Mauris ac consequat orci, a finibus justo. Pellentesque et felis sit amet augue tincidunt accumsan id a libero. Nunc tincidunt mollis tincidunt. In congue elit est, pretium egestas magna accumsan sit amet. Nulla malesuada viverra mi, quis ultricies ligula.",
    },
    {
        title: "Lorem ipsum",
        author: "John Doe",
        category: "Cheese",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris scelerisque arcu porta facilisis volutpat. Cras vel mauris molestie libero dignissim vehicula. Fusce vitae commodo nisi, bibendum iaculis tortor. Nunc consequat egestas laoreet. Nullam ornare justo id est porta tincidunt. Vivamus arcu sapien, faucibus in hendrerit porttitor, gravida sit amet nisi. Ut rutrum elit eu sem pretium, a posuere sapien euismod. Donec finibus ornare augue, eget pretium mi consectetur vel. Nulla facilisi. Nunc laoreet dolor purus, in malesuada libero tempor vel. Morbi convallis et nisi eget pellentesque. Fusce diam libero, fringilla at eros laoreet, semper laoreet quam. Vivamus ornare ex at diam mollis consequat. Nam sodales rhoncus neque, non malesuada turpis tempus a.",
    },
    {
        title: "Pellentesque",
        author: "Jean Bono",
        category: "Empire",
        body: "Pellentesque non odio scelerisque, vestibulum libero vel, tempor ipsum. Cras ultrices metus sed sapien maximus ullamcorper aliquet vitae ligula. Vestibulum non orci scelerisque neque aliquet faucibus in id elit. Vestibulum orci ligula, vulputate ut posuere tincidunt, commodo sit amet nunc. Etiam quis mi eu libero vestibulum rhoncus sed sit amet metus. Vestibulum nec diam ut magna tincidunt dignissim quis quis quam. Vestibulum at tellus porttitor, blandit ante nec, commodo lorem. Mauris ac consequat orci, a finibus justo. Pellentesque et felis sit amet augue tincidunt accumsan id a libero. Nunc tincidunt mollis tincidunt. In congue elit est, pretium egestas magna accumsan sit amet. Nulla malesuada viverra mi, quis ultricies ligula.",
    },
];

customElements.define("c-posts", Posts);
