// class Messages extends HTMLElement {
//     constructor() {
//         super();
//         this.placeHolder = "...................................................................................................";
//         this.render();
//     }

//     connectedCallback() {
//         //
//     }

//     render() {
//         this.innerHTML = `
//             <div class="messages">
//                 <div class="left">
//                     <article>
//                         <header>
//                             Conversations
//                         </header>
//                         <section>
//                             <span>John Does</span>
//                             <span>Jean Bono</span>
//                         </section>
//                     </article>
//                     <article>
//                         <header>
//                             Users
//                         </header>
//                         <section>
//                             <span>John Does</span>
//                             <span>Jean Bono</span>
//                             <span>John Does</span>
//                             <span>Jean Bono</span>
//                         </section>
//                     </article>
//                 </div>
//                 <div class="right">
//                     <article class="sender">
//                     <header>
//                         10/06/2025 - John Doe
//                     </header>
//                     <section>
//                         Hello, World !
//                     </section>
//                     </article>
//                     <article class="receiver">
//                     <header>
//                         10/06/2025 - Jean Bono
//                     </header>
//                     <section>
//                         Hey how you doing ?
//                     </section>
//                     </article>
//                     <div class="y_spacer"></div>
//                     <label>
//                     Message:
//                     <input placeholder="${this.placeHolder}"/>
//                     </label>
//                 </div>
//             </div>
//         `;
//     }
// }

// customElements.define("c-messages", Messages);

class Messages extends HTMLElement {
    constructor() {
        super();
        this.ws = null;
        this.user = "Jean Bono"; // Simuler l'utilisateur actuel
        this.activeConversation = 0;
        this.conversations = [
            { id: 1, name: "John Doe" },
            { id: 2, name: "Alice Smith" }
        ];
        this.messages = {}; // Stocke les messages par conversation
        this.placeHolder = "Tapez votre message...";
        this.render();
    }

    connectedCallback() {
        this.setupWebSocket();
        this.addEventListeners();
    }

    setupWebSocket() {
        this.ws = new WebSocket("/ws"); // Remplace par ton URL WebSocket

        this.ws.onopen = () => {
            console.log("WebSocket connecté !");
            
            // Envoyer immédiatement l'ID de conversation active
            //if (this.activeConversation) {
            //    this.ws.send(JSON.stringify({ conversation_id: this.activeConversation }));
            //}
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message)
            this.receiveMessage(message);
        };

        this.ws.onclose = () => console.log("WebSocket déconnecté !");
    }

    addEventListeners() {
        this.querySelectorAll(".conversation").forEach(span => {
            span.onclick = () => {
                this.activeConversation = parseInt(span.dataset.id);
                this.render();
            };
        });

        const input = this.querySelector(".message-input");
        const sendButton = this.querySelector(".message-send");

        if (sendButton && input) {
            sendButton.onclick = () => {
                this.sendMessage(input.value);
                input.value = "";
            };
        }
    }

    sendMessage(content) {
        if (!this.activeConversation || !content.trim()) return;

        const message = {
            conversation_id: this.activeConversation,
            sender: this.user,
            content: content,
            timestamp: new Date().toISOString()
        };

        this.ws.send(JSON.stringify(message));
        //this.receiveMessage(message); // Ajouter le message localement
    }

    receiveMessage(message) {
        const { conversation_id } = message;
        if (!this.messages[conversation_id]) {
            this.messages[conversation_id] = [];
        }
        this.messages[conversation_id].push(message);
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="messages">
                <div class="left">
                    <article>
                        <header>Conversations</header>
                        <section>
                            ${this.conversations.map(conv => `
                                <span class="conversation" data-id="${conv.id}">
                                    ${conv.name}
                                </span>
                            `).join('')}
                        </section>
                    </article>
                </div>
                <div class="right">
                    ${this.activeConversation ? this.renderConversation() : "<p>Sélectionnez une conversation</p>"}
                </div>
            </div>
        `;

        this.addEventListeners();
    }

    renderConversation() {
        const messages = this.messages[this.activeConversation] || [];

        return `
            <div>
                ${messages.map(msg => `
                    <article class="${msg.sender === this.user ? "sender" : "receiver"}">
                        <header>${new Date(msg.timestamp).toLocaleString()} - ${msg.sender}</header>
                        <section>${msg.content}</section>
                    </article>
                `).join('')}
                <div class="y_spacer"></div>
                <label>
                    Message:
                    <input class="message-input" placeholder="${this.placeHolder}"/>
                    <button class="message-send">Envoyer</button>
                </label>
            </div>
        `;
    }
}

customElements.define("c-messages", Messages);
