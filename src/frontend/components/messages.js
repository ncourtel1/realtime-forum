class Messages extends HTMLElement {
    constructor() {
        super();
        this.placeHolder = "...................................................................................................";
        this.render();
    }

    connectedCallback() {
        //
    }

    render() {
        this.innerHTML = `
            <div class="messages">
                <div class="left">
                    <article>
                        <header>
                            Conversations
                        </header>
                        <section>
                            <span>John Does</span>
                            <span>Jean Bono</span>
                        </section>
                    </article>
                    <article>
                        <header>
                            Users
                        </header>
                        <section>
                            <span>John Does</span>
                            <span>Jean Bono</span>
                            <span>John Does</span>
                            <span>Jean Bono</span>
                        </section>
                    </article>
                </div>
                <div class="right">
                    <article class="sender">
                    <header>
                        10/06/2025 - John Doe
                    </header>
                    <section>
                        Hello, World !
                    </section>
                    </article>
                    <article class="receiver">
                    <header>
                        10/06/2025 - Jean Bono
                    </header>
                    <section>
                        Hey how you doing ?
                    </section>
                    </article>
                    <div class="y_spacer"></div>
                    <label>
                    Message:
                    <input placeholder="${this.placeHolder}"/>
                    </label>
                </div>
            </div>
        `;
    }
}

customElements.define("c-messages", Messages);
