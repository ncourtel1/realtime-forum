class Posts extends HTMLElement {
    constructor() {
        super();
        this.monitor = { isLoading: false, error: null };
        this.Posts = [];
        this.Comments = [];
        this.Comment = {Content: "", Post_id: 0};
        this.areCommentsExpanded = new Set();
        this.placeHolder = "............................................................................................................................................................................................................................................................................................................................................................................................................";
        this.getPosts();
        this.getComments();
    }

    connectedCallback() {
        this.querySelectorAll(".comments-toggle").forEach(button => {
            button.onclick = () => {
                let postID = button.dataset.postId;
                if (this.areCommentsExpanded.has(postID)) {
                    this.areCommentsExpanded.delete(postID);
                } else {
                    this.areCommentsExpanded.add(postID);
                }
                this.render();
            };
        });

        this.querySelectorAll(".comment-input").forEach(input => {
            input.oninput = (e) => {
                this.Comment.Content = e.target.value;
                this.Comment.Post_id = parseInt(e.target.dataset.postId);
            };
        });

        this.querySelectorAll(".comment-send").forEach(button => {
            button.onclick = () => {
                this.submitComment();
            }
        });
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

    async getComments() {
        try {
            this.monitor = {isLoading: true, error: null};
            this.render();
            const response = await fetch('/get_comments');
            const data = await response.json();
            await new Promise(resolve => setTimeout(resolve, 500));
            if (data.Error) {
                throw new Error(data.Message);
            }
            console.log(data);
            this.Comments = data;
            this.monitor = {isLoading: false, error: null};
            this.render();
            //this.connectedCallback();
        } catch (error) {
            this.monitor = {isLoading: false, error: error};
            this.render();
        }
    }

    async submitComment() {
        try {
            this.monitor = {isLoading: true, error: null};
            this.render();
            const response = await fetch('/create_comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.Comment)
            });
    
            const data = await response.json();
            await new Promise(resolve => setTimeout(resolve, 500));
            if (data.Error) {
                throw new Error(data.Message);
            }
            this.monitor = {isLoading: false, error: null};
            this.Comment = {Content: "", Post_id: 0};
            this.getPosts();
            this.getComments();
            this.render();
        } catch (error) {
            this.monitor = {isLoading: false, error: error.message};
            this.render();
        }
    }

    formatDate(date) {
        const formattedDate = date.toDateString() + " " + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return formattedDate;
    }

    render() {
        this.innerHTML = `${this.monitor.error ? this.monitor.error : ''}${this.monitor.isLoading ? '<div class="loader">Connection to the World Wide Web</div>' : ''}`
        this.innerHTML += this.Posts.map(post => `
            <article>
                <h1>${post.Title}</h1>
                <header>
                    ${post.Username} - #<span class="highlight">${post.CategoryName}</span><span style="font-size: 12px;"> - ${this.formatDate(new Date(post.Created_at))}</span>
                </header>
                <section>
                    ${post.Content}
                </section>
                <footer>
                    <span class="highlight comments-toggle" data-post-id="${post.Id}">${this.areCommentsExpanded.has(post.Id.toString()) ? 'Hide' : 'See'} Comments</span>
                </footer>
                ${this.areCommentsExpanded.has(post.Id.toString()) ?
                    `<label>
                        New Comment:
                        <input type="text" class="comment-input" data-post-id="${post.Id}" placeholder="${this.placeHolder}" />
                        <button class="comment-send">Send</button>
                    </label>
                    ${this.Comments.filter(c => c.Post_id === post.Id).map(comment => {
                        return `<article>
                            <header>
                                ${comment.Username}<span style="font-size: 12px;"> - ${this.formatDate(new Date(comment.Created_at))}</span>
                            </header>
                            <section>
                                ${comment.Content}
                            </section>
                        </article>`;
                    }).join('')}` :
                    ``}
            </article>
            <div></div>
        `).join('');
        this.connectedCallback();
    }
}

customElements.define("c-posts", Posts);
