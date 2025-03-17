import { Ws } from "../main.js";

let unreadMessages = {};

class Messages extends HTMLElement {
  constructor() {
    console.log("mounted");
    super();
    this.users = [];
    this.conversations = [];
    this.currentConversationId = null;
    this.currentTargetUser = null;
    this.placeHolder = "...................................................................................................";
    this.render();
  }

  connectedCallback() {
    this.initWebsocket();
    Ws.send("");
  }

  initWebsocket() {
    Ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Si c'est un tableau, c'est la liste des utilisateurs
        if (Array.isArray(data)) {
          this.users = data;
          this.updateOnlineUsers();
          return;
        }
        
        // Si c'est un objet avec un type, gérer en fonction du type
        if (data.type) {
          switch (data.type) {
            case 'history':
              this.currentConversationId = data.conversationId;
              if (data.messages) this.renderMessages(data.messages);
              break;
            case 'message':
              if (data.conversationId === this.currentConversationId) {
                this.addMessageToChat(data.message);
              }  else {
                const senderId = data.message.senderId;

                // Incrémenter les messages non lus pour cet utilisateur
                if (!unreadMessages[senderId]) {
                  unreadMessages[senderId] = 0;
                }
                unreadMessages[senderId]++;

                let totalUnreadMessages = 0;
                for (let userId in unreadMessages) {
                  totalUnreadMessages += unreadMessages[userId];
                }

                const navEvent = new CustomEvent('unreadMessagesUpdated', { 
                  detail: { total: totalUnreadMessages } 
                });
                document.dispatchEvent(navEvent);

                // Déplacer l'utilisateur au début de la liste
                const userIndex = this.users.findIndex(user => user.ID === senderId);
                if (userIndex !== -1) {
                  const [user] = this.users.splice(userIndex, 1); // Retirer l'utilisateur de sa position actuelle
                  this.users.unshift(user); // Ajouter l'utilisateur au début de la liste
                }

                // Mettre à jour les notifications et la liste des utilisateurs
                this.updateUnreadNotifications();
                this.updateOnlineUsers();
              }
              break;
            default:
              console.log("Message non géré:", data);
          }
        }
      } catch (error) {
        console.error("Erreur de parsing JSON:", error, event.data);
      }
    };
  }

  startConversation(targetId, targetUsername) {
    this.currentTargetUser = targetUsername;
    console.log(targetId)

    if (unreadMessages[targetId]) {
      delete unreadMessages[targetId];
      this.updateUnreadNotifications();
    }

    Ws.send(JSON.stringify({
      type: 'startConversation',
      targetId: targetId
    }));
    
    // Mettre à jour l'interface pour montrer la conversation active
    const userElements = this.querySelectorAll('.online-user');
    userElements.forEach(el => {
      el.classList.remove('active');
      if (parseInt(el.dataset.userId) === targetId) {
        el.classList.add('active');
      }
    });
    this.renderMessages([]);
  }

  renderMessages(messages) {
    const rightSection = this.querySelector('.right');
    rightSection.innerHTML = '';
    
    messages.forEach(msg => {
      this.addMessageToChat(msg, false);
    });
    
    // Ajouter la zone de saisie
    const inputArea = document.createElement('div');
    inputArea.className = 'message-input-area';
    inputArea.innerHTML = `
      <div class="y_spacer"></div>
      <label>
        Message:
        <input id="message-input" placeholder="${this.placeHolder}"/>
      </label>
    `;
    rightSection.appendChild(inputArea);
    
    // Ajouter l'événement d'envoi
    const input = rightSection.querySelector('#message-input');
    input.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.sendMessage(input.value);
        input.value = '';
      }
    });
  }

  addMessageToChat(message, append = true) {
    const rightSection = this.querySelector('.right');
    const article = document.createElement('article');
    
    // Déterminer si c'est un message envoyé ou reçu
    if (message.senderId === parseInt(localStorage.getItem('userId'))) {
      article.className = 'sender';
    } else {
      article.className = 'receiver';
    }
    
    // Formater la date
    const date = new Date(message.timestamp).toLocaleString();
    
    // Trouver le nom d'utilisateur
    let username = "Utilisateur";
    if (message.senderId === parseInt(localStorage.getItem('userId'))) {
      username = localStorage.getItem('username') || "Moi";
    } else if (this.currentTargetUser) {
      username = this.currentTargetUser;
    }
    
    article.innerHTML = `
      <header>
        ${date} - ${username}
      </header>
      <section>
        ${message.content}
      </section>
    `;
    
    if (append) {
      // Ajouter avant l'input
      const input = rightSection.querySelector('.message-input-area');
      if (input) {
        rightSection.insertBefore(article, input);
      } else {
        rightSection.appendChild(article);
      }
    } else {
      rightSection.appendChild(article);
    }
    
    // Défiler vers le bas
    rightSection.scrollTop = rightSection.scrollHeight;
  }

  sendMessage(content) {
    if (!content.trim() || !this.currentConversationId) return;
    
    Ws.send(JSON.stringify({
      type: 'message',
      conversationId: this.currentConversationId,
      content: content
    }));
  }

  updateUnreadNotifications() {
    const userElements = this.querySelectorAll('.online-user');
    
    userElements.forEach(el => {
      const userId = parseInt(el.dataset.userId);
      const badge = el.querySelector('.unread-badge');
      
      if (unreadMessages[userId]) {
        if (!badge) {
          const newBadge = document.createElement('span');
          newBadge.className = 'unread-badge';
          newBadge.textContent = unreadMessages[userId];
          el.appendChild(newBadge);
        } else {
          badge.textContent = unreadMessages[userId];
        }
      } else if (badge) {
        badge.remove();
      }
    });
  }

  updateOnlineUsers() {
    const onlineUsersSection = this.querySelector('#online-users');
    onlineUsersSection.innerHTML = this.users.map(user => 
      `<span class="online-user" data-user-id="${user.ID}">${user.Username}${unreadMessages[user.ID] ? `<span class="highlight unread-badge"> ${unreadMessages[user.ID]}</span>` : ''}</span>`
    ).join("");

    // Réattacher les événements de clic
    const userElements = onlineUsersSection.querySelectorAll('.online-user');
    userElements.forEach(el => {
      el.addEventListener('click', () => {
        const userId = parseInt(el.dataset.userId);
        const username = el.textContent.trim(); // Utiliser trim() pour enlever les espaces
        this.startConversation(userId, username);
      });
    });
  }
  

  render() {
    this.innerHTML = `
      <div class="messages">
        <div class="left">
          <article>
            <header>
              Conversations
            </header>
            <section id="conversations-list">
              <span>John Does</span>
              <span>Jean Bono</span>
            </section>
          </article>
          <article>
            <header>
              Online
            </header>
            <section id="online-users">
            </section>
          </article>
        </div>
        <div class="right">
          <div class="start-chat-message">
            Sélectionnez un utilisateur pour démarrer une conversation
          </div>
        </div>
      </div>
    `;
    
    // Ajouter les événements de clic sur les utilisateurs en ligne
    const userElements = this.querySelectorAll('.online-user');
    userElements.forEach(el => {
      el.addEventListener('click', () => {
        const userId = parseInt(el.dataset.userId);
        const username = el.textContent;
        this.startConversation(userId, username);
      });
    });
  }
}

customElements.define("c-messages", Messages);

// class Messages extends HTMLElement {
//     constructor() {
//         super();
//         this.ws = null;
//         this.user = "Jean Bono"; // Simuler l'utilisateur actuel
//         this.activeConversation = 0;
//         this.conversations = [
//             { id: 1, name: "John Doe" },
//             { id: 2, name: "Alice Smith" }
//         ];
//         this.messages = {}; // Stocke les messages par conversation
//         this.placeHolder = "Tapez votre message...";
//         this.render();
//     }

//     connectedCallback() {
//         this.setupWebSocket();
//         this.addEventListeners();
//     }

//     setupWebSocket() {
//         this.ws = new WebSocket("/ws"); // Remplace par ton URL WebSocket

//         this.ws.onopen = () => {
//             console.log("WebSocket connecté !");
            
//             // Envoyer immédiatement l'ID de conversation active
//             //if (this.activeConversation) {
//             //    this.ws.send(JSON.stringify({ conversation_id: this.activeConversation }));
//             //}
//         };
        
//         this.ws.onmessage = (event) => {
//             const message = JSON.parse(event.data);
//             console.log(message)
//             this.receiveMessage(message);
//         };

//         this.ws.onclose = () => console.log("WebSocket déconnecté !");
//     }

//     addEventListeners() {
//         this.querySelectorAll(".conversation").forEach(span => {
//             span.onclick = () => {
//                 this.activeConversation = parseInt(span.dataset.id);
//                 console.log(this.activeConversation)
//                 this.render();
//             };
//         });

//         const input = this.querySelector(".message-input");
//         const sendButton = this.querySelector(".message-send");

//         if (sendButton && input) {
//             sendButton.onclick = () => {
//                 this.sendMessage(input.value);
//                 input.value = "";
//             };
//         }
//     }

//     sendMessage(content) {
//         if (!this.activeConversation || !content.trim()) return;

//         const message = {
//             conversation_id: this.activeConversation,
//             sender: this.user,
//             content: content,
//             timestamp: new Date().toISOString()
//         };

//         console.log(message);

//         this.ws.send(JSON.stringify(message));
//         //this.receiveMessage(message); // Ajouter le message localement
//     }

//     receiveMessage(message) {
//         const { conversation_id } = message;
//         if (!this.messages[conversation_id]) {
//             this.messages[conversation_id] = [];
//         }
//         this.messages[conversation_id].push(message);
//         this.render();
//     }

//     render() {
//         this.innerHTML = `
//             <div class="messages">
//                 <div class="left">
//                     <article>
//                         <header>Conversations</header>
//                         <section>
//                             ${this.conversations.map(conv => `
//                                 <span class="conversation" data-id="${conv.id}">
//                                     ${conv.name}
//                                 </span>
//                             `).join('')}
//                         </section>
//                     </article>
//                 </div>
//                 <div class="right">
//                     ${this.activeConversation ? this.renderConversation() : "<p>Sélectionnez une conversation</p>"}
//                 </div>
//             </div>
//         `;

//         this.addEventListeners();
//     }

//     renderConversation() {
//         const messages = this.messages[this.activeConversation] || [];

//         return `
//             <div>
//                 ${messages.map(msg => `
//                     <article class="${msg.sender === this.user ? "sender" : "receiver"}">
//                         <header>${new Date(msg.timestamp).toLocaleString()} - ${msg.sender}</header>
//                         <section>${msg.content}</section>
//                     </article>
//                 `).join('')}
//                 <div class="y_spacer"></div>
//                 <label>
//                     Message:
//                     <input class="message-input" placeholder="${this.placeHolder}"/>
//                     <button class="message-send">Envoyer</button>
//                 </label>
//             </div>
//         `;
//     }
// }

// customElements.define("c-messages", Messages);
