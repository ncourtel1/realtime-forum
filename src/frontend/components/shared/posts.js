class Posts extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = posts.map(post => `
            <article>
                <h1>${post.title}</h1>
                <header>
                    ${post.author} - #<span class="highlight">${post.category}</span>
                </header>
                <section>
                    ${post.body}
                </section>
                <footer>
                    <span class="highlight">See Comments</span>
                </footer>
            </article>
        `);
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
