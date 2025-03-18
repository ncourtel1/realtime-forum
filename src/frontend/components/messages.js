import { Ws, User } from "../main.js";

let unreadMessages = {};

class Messages extends HTMLElement {
  constructor() {
    console.log("mounted");
    super();
    this.users = [];
    this.conversations = [];
    this.currentConversationId = null;
    this.displayedCount = 10;
    this.messages = [];
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
                if (data.message.content == "typing") {
                  console.log(User.User, data.message.senderId)
                  if (User.UserID !== data.message.senderId) this.handleTyping();
                } else {
                  console.log(data.message)
                  this.addMessageToChat(data.message);
                }
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

  isImageURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }

  handleTyping() {
    const rightSection = this.querySelector('.right');
    if (!rightSection) return;
  
    // Vérifiez si un indicateur de frappe existe déjà
    let typingIndicator = rightSection.querySelector('.typing-indicator');
    if (!typingIndicator) {
      // Créer un élément pour indiquer que l'utilisateur est en train d'écrire
      typingIndicator = document.createElement('div');
      typingIndicator.className = 'typing-indicator';
      typingIndicator.textContent = 'Typing...';
  
      // Ajouter l'indicateur de frappe à la fin de la section droite
      rightSection.appendChild(typingIndicator);
  
      // Défiler vers le bas pour voir l'indicateur de frappe
      rightSection.scrollTop = rightSection.scrollHeight;
    }
  
    // Optionnel : Supprimer l'indicateur après un certain délai (par exemple, 3 secondes)
    clearTimeout(this.typingTimeout); // Réinitialiser le timeout précédent s'il existe
    this.typingTimeout = setTimeout(() => {
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }, 1000); // Supprime l'indicateur après 3 secondes
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
  
    this.messages = messages; // Stocker tous les messages
    this.displayedCount = Math.min(10, messages.length); // Commencer par afficher les 10 derniers messages
    
    if (this.messages.length > 0) {
      // Afficher les derniers messages
      this.displayMessages();
    }
  
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

    input.addEventListener('input', () => {
      this.sendMessage("typing");
    })
  
    // Défiler vers le bas pour voir les messages les plus récents
    rightSection.scrollTop = rightSection.scrollHeight;
    // Ajouter gestion du scroll pour charger plus de messages avec throttle
    rightSection.addEventListener('scroll', this.throttle(() => {
      if (rightSection.scrollTop < 30 && this.displayedCount < this.messages.length) {
        this.loadMoreMessages();
      }
    }, 10));
  }
  
  // Fonction throttle pour limiter les appels
  throttle(func, limit) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }
  
  // Méthode pour afficher les messages actuellement sélectionnés
  displayMessages() {
    const rightSection = this.querySelector('.right');
    
    // Supprimer tous les messages existants (mais pas l'input)
    const inputArea = rightSection.querySelector('.message-input-area');
    const messages = Array.from(rightSection.querySelectorAll('article'));
    messages.forEach(msg => msg.remove());
    
    // Afficher les messages sélectionnés
    const messagesToShow = this.messages.slice(-this.displayedCount);
    messagesToShow.forEach(msg => {
      this.addMessageToChat(msg, false);
    });
    
    // Assurer que l'input est toujours après les messages
    if (inputArea && inputArea.parentNode === rightSection) {
      rightSection.appendChild(inputArea);
    }
    
    console.log(`Affichage de ${messagesToShow.length} messages sur ${this.messages.length} au total`);
  }
  
  // Gestionnaire de scroll avec debugging
  handleScroll(event) {
    const rightSection = this.querySelector('.right');
    
    // Ajouter du debug
    console.log("Scroll position:", rightSection.scrollTop);
    
    // Vérifier si on est proche du haut
    if (rightSection.scrollTop < 30 && this.displayedCount < this.messages.length) {
      console.log("Près du haut, chargement de plus de messages...");
      this.loadMoreMessages();
    }
  }
  
  // Fonction pour charger plus de messages
  loadMoreMessages() {
    const rightSection = this.querySelector('.right');
    const oldScrollHeight = rightSection.scrollHeight;
    
    // Augmenter le nombre de messages à afficher
    const oldDisplayedCount = this.displayedCount;
    this.displayedCount = Math.min(this.displayedCount + 10, this.messages.length);
    
    // Ne rien faire si pas de nouveaux messages à ajouter
    if (oldDisplayedCount === this.displayedCount) {
      console.log("Aucun nouveau message à charger");
      return;
    }
    
    console.log(`Chargement de ${this.displayedCount - oldDisplayedCount} messages supplémentaires`);
    
    // Réafficher les messages avec le nouveau compte
    this.displayMessages();
    
    // Ajuster la position du scroll pour maintenir la position relative
    setTimeout(() => {
      const newScrollHeight = rightSection.scrollHeight;
      const newScrollTop = newScrollHeight - oldScrollHeight;
      rightSection.scrollTop = newScrollTop > 0 ? newScrollTop : 0;
      console.log("Nouvelle position de scroll:", newScrollTop);
    }, 10);
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
      <header class="msg_header">
        ${date} - ${username}
      </header>
      <section>
        ${this.isImageURL(message.content) ? `<img src="${message.content}" />` : message.content}
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

    if (content === "typing") {
      Ws.send(JSON.stringify({
        type: 'typing',
        conversationId: this.currentConversationId,
      }));
    } else {
      Ws.send(JSON.stringify({
        type: 'message',
        conversationId: this.currentConversationId,
        content: content
      }));
    }
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
              Online
            </header>
            <section id="online-users">
            </section>
          </article>
        </div>
        <div class="right">
          <div class="start-chat-message">
            Select a user
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