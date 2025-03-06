// package server

// import (
// 	"db"
// 	"encoding/json"
// 	"fmt"
// 	"log"
// 	"net/http"
// 	"sync"
// 	"time"

// 	"github.com/gorilla/websocket"
// )

// // Paramètres des WebSockets
// const (
// 	writeWait      = 10 * time.Second
// 	pongWait       = 60 * time.Second
// 	pingPeriod     = (pongWait * 9) / 10
// 	maxMessageSize = 512
// )

// var (
// 	newline  = []byte{'\n'}
// 	space    = []byte{' '}
// 	upgrader = websocket.Upgrader{
// 		ReadBufferSize:  1024,
// 		WriteBufferSize: 1024,
// 		CheckOrigin:     func(r *http.Request) bool { return true }, // Permet les connexions de tous les domaines
// 	}
// )

// // Hub représente une conversation WebSocket entre utilisateurs.
// type Hub struct {
// 	clients    map[*Client]bool
// 	broadcast  chan []byte
// 	register   chan *Client
// 	unregister chan *Client
// }

// // Client représente une connexion WebSocket.
// type Client struct {
// 	hub  *Hub
// 	conn *websocket.Conn
// 	send chan []byte
// }

// // Gestion des différents hubs (conversations)
// var (
// 	hubs      = make(map[int]*Hub)
// 	hubsMutex sync.Mutex
// )

// // Crée un nouveau Hub (conversation)
// func newHub() *Hub {
// 	return &Hub{
// 		clients:    make(map[*Client]bool),
// 		broadcast:  make(chan []byte),
// 		register:   make(chan *Client),
// 		unregister: make(chan *Client),
// 	}
// }

// // Gère la boucle principale du Hub
// func (h *Hub) Run() {
// 	for {
// 		select {
// 		case client := <-h.register:
// 			h.clients[client] = true
// 		case client := <-h.unregister:
// 			if _, ok := h.clients[client]; ok {
// 				delete(h.clients, client)
// 				close(client.send)
// 			}
// 		case message := <-h.broadcast:
// 			for client := range h.clients {
// 				select {
// 				case client.send <- message:
// 				default:
// 					close(client.send)
// 					delete(h.clients, client)
// 				}
// 			}
// 		}
// 	}
// }

// func (c *Client) ReadPump() {
// 	defer func() {
// 		c.hub.unregister <- c
// 		c.conn.Close()
// 	}()
// 	c.conn.SetReadLimit(maxMessageSize)
// 	c.conn.SetReadDeadline(time.Now().Add(pongWait))
// 	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

// 	database := db.SetupDatabase()
// 	defer database.Close()

// 	for {
// 		_, message, err := c.conn.ReadMessage()
// 		if err != nil {
// 			fmt.Println("error")
// 			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
// 				log.Printf("Erreur WebSocket : %v", err)
// 			}
// 			break
// 		}

// 		// Décoder le message reçu (qui doit être un JSON)
// 		type IncomingMessage struct {
// 			ConversationID int    `json:"conversation_id"`
// 			SenderID       int    `json:"sender_id"`
// 			Content        string `json:"content"`
// 		}

// 		var msg IncomingMessage
// 		if err := json.Unmarshal(message, &msg); err != nil {
// 			log.Println("Erreur décodage JSON :", err)
// 			continue
// 		}

// 		fmt.Println(msg)

// 		// Enregistrer le message dans la base de données
// 		if err := db.SaveMessage(database /*msg.ConversationID*/, 12, msg.SenderID, msg.Content); err != nil {
// 			log.Println("Erreur sauvegarde message :", err)
// 			continue
// 		}

// 		// Diffuser le message aux autres utilisateurs de la conversation
// 		c.hub.broadcast <- message
// 	}
// }

// // Gère l'écriture des messages vers un client WebSocket.
// func (c *Client) WritePump() {
// 	ticker := time.NewTicker(pingPeriod)
// 	defer func() {
// 		ticker.Stop()
// 		c.conn.Close()
// 	}()
// 	for {
// 		select {
// 		case message, ok := <-c.send:
// 			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
// 			if !ok {
// 				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
// 				return
// 			}

// 			w, err := c.conn.NextWriter(websocket.TextMessage)
// 			if err != nil {
// 				return
// 			}
// 			w.Write(message)

// 			n := len(c.send)
// 			for i := 0; i < n; i++ {
// 				w.Write(newline)
// 				w.Write(<-c.send)
// 			}

// 			if err := w.Close(); err != nil {
// 				return
// 			}
// 		case <-ticker.C:
// 			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
// 			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
// 				return
// 			}
// 		}
// 	}
// }

// // Gère la connexion WebSocket d'une conversation spécifique.
// func ServeWs(w http.ResponseWriter, r *http.Request) {
// 	// Mettre à niveau la connexion HTTP en WebSocket
// 	conn, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Println("Erreur WebSocket :", err)
// 		return
// 	}

// 	// Lire le premier message envoyé par le client (JSON contenant l'ID de la conversation)
// 	_, message, err := conn.ReadMessage()
// 	if err != nil {
// 		log.Println("Erreur lecture JSON WebSocket :", err)
// 		conn.Close()
// 		return
// 	}

// 	fmt.Println(string(message))

// 	// Définir une structure pour décoder le JSON
// 	type ConnRequest struct {
// 		ConversationID int `json:"conversation_id"`
// 	}

// 	var req ConnRequest
// 	if err := json.Unmarshal(message, &req); err != nil {
// 		log.Println("Erreur décodage JSON :", err)
// 		conn.Close()
// 		return
// 	}

// 	fmt.Println(req)

// 	// Vérifier si l'ID de conversation est fourni
// 	if req.ConversationID == 0 {
// 		log.Println("Aucun ID de conversation fourni")
// 		conn.Close()
// 		return
// 	}

// 	// Vérifier si le Hub de la conversation existe déjà, sinon le créer
// 	hubsMutex.Lock()
// 	hub, exists := hubs[req.ConversationID]
// 	if !exists {
// 		hub = newHub()
// 		hubs[req.ConversationID] = hub
// 		go hub.Run() // Lancer le hub en arrière-plan
// 	}
// 	hubsMutex.Unlock()

// 	// Créer un nouveau client WebSocket
// 	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
// 	client.hub.register <- client

// 	// Lancer les goroutines pour la lecture et l'écriture
// 	go client.WritePump()
// 	go client.ReadPump()
// 	//client.hub.broadcast <- message
// }

// package server

// import (
// 	"db"
// 	"encoding/json"
// 	"fmt"
// 	"net/http"
// 	"sync"

// 	"github.com/gorilla/websocket"
// )

// // Gestionnaire de connexions WebSocket
// var upgrader = websocket.Upgrader{
// 	CheckOrigin: func(r *http.Request) bool {
// 		return true // Autorise toutes les connexions
// 	},
// }

// type Client struct {
// 	ID       int
// 	Username string
// 	Conn     *websocket.Conn
// }

// var (
// 	clients   = make(map[*Client]bool) // Stocke les connexions actives
// 	broadcast = make(chan struct{})    // Canal pour signaler une mise à jour
// 	mutex     sync.Mutex               // Synchronisation des accès concurrents
// )

// // Gère une nouvelle connexion WebSocket
// func handleConnections(w http.ResponseWriter, r *http.Request) {
// 	conn, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		fmt.Println("Erreur lors de l'upgrade WebSocket:", err)
// 		return
// 	}
// 	defer conn.Close()

// 	var userMessage Client

// 	// Lecture du pseudo envoyé par le client
// 	_, user, err := conn.ReadMessage()
// 	if err != nil {
// 		fmt.Println("Erreur de lecture du pseudo:", err)
// 		return
// 	}

// 	err = json.Unmarshal(user, &userMessage)
// 	if err != nil {
// 		fmt.Println("Erreur de parsing JSON:", err)
// 		return
// 	}

// 	// Créer un client avec le userID et le username
// 	client := &Client{ID: userMessage.ID, Username: userMessage.Username, Conn: conn}

// 	mutex.Lock()
// 	clients[client] = true
// 	mutex.Unlock()

// 	broadcast <- struct{}{} // Signale une mise à jour

// 	// Attente des messages (pour garder la connexion ouverte)
// 	for {
// 		_, message, err := conn.ReadMessage()
// 		if err != nil {
// 			break // Déconnexion du client
// 		}

// 		// Si le message est vide, redéclenche le broadcast
// 		if len(message) == 0 {
// 			broadcast <- struct{}{} // Signale une mise à jour
// 		}
// 	}

// 	// Supprime le client à la déconnexion
// 	mutex.Lock()
// 	delete(clients, client)
// 	mutex.Unlock()

// 	broadcast <- struct{}{} // Signale une mise à jour
// }

// // Envoie la liste des utilisateurs connectés à tous les clients
// func broadcastUsers() {
// 	for {
// 		<-broadcast // Attend une mise à jour

// 		mutex.Lock()
// 		var users []db.User
// 		for client := range clients {
// 			users = append(users, db.User{ID: client.ID, Username: client.Username})
// 		}
// 		mutex.Unlock()

// 		userListJSON, err := json.Marshal(users)
// 		if err != nil {
// 			fmt.Println("Erreur d'encodage JSON:", err)
// 			continue
// 		}

// 		// Envoie le JSON à tous les clients
// 		mutex.Lock()
// 		for client := range clients {
// 			err := client.Conn.WriteMessage(websocket.TextMessage, userListJSON)
// 			if err != nil {
// 				client.Conn.Close()
// 				delete(clients, client)
// 			}
// 		}
// 		mutex.Unlock()
// 	}
// }

package server

import (
	"db"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Upgrader et structures Client existants
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Autorise toutes les connexions
	},
}

type Client struct {
	ID       int
	Username string
	Conn     *websocket.Conn
}

// Structures pour les conversations
type Message struct {
	ID        int       `json:"id"`
	Content   string    `json:"content"`
	SenderID  int       `json:"senderId"`
	Timestamp time.Time `json:"timestamp"`
}

type Conversation struct {
	ID      int `json:"id"`
	User1ID int `json:"user1Id"`
	User2ID int `json:"user2Id"`
}

// Variables globales existantes + nouvelles
var (
	clients    = make(map[*Client]bool)    // Stocke les connexions actives
	broadcast  = make(chan struct{})       // Canal pour signaler une mise à jour
	mutex      sync.Mutex                  // Synchronisation des accès concurrents
	privateMsg = make(chan PrivateMessage) // Canal pour les messages privés
)

// Structure pour gérer les messages privés
type PrivateMessage struct {
	ConversationID int     `json:"conversationId"`
	Message        Message `json:"message"`
}

// Gère une nouvelle connexion WebSocket (modifié pour gérer aussi les messages privés)
func handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Erreur lors de l'upgrade WebSocket:", err)
		return
	}
	defer conn.Close()

	var userMessage Client
	// Lecture du pseudo envoyé par le client
	_, user, err := conn.ReadMessage()
	if err != nil {
		fmt.Println("Erreur de lecture du pseudo:", err)
		return
	}
	err = json.Unmarshal(user, &userMessage)
	if err != nil {
		fmt.Println("Erreur de parsing JSON:", err)
		return
	}

	// Créer un client avec le userID et le username
	client := &Client{ID: userMessage.ID, Username: userMessage.Username, Conn: conn}
	mutex.Lock()
	clients[client] = true
	mutex.Unlock()
	broadcast <- struct{}{} // Signale une mise à jour

	// Boucle principale de lecture des messages
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			break // Déconnexion du client
		}

		// Si le message est vide, redéclenche le broadcast
		if len(message) == 0 {
			broadcast <- struct{}{} // Signale une mise à jour
			continue
		}

		// Sinon, vérifier si c'est une demande de conversation privée
		var msgData map[string]interface{}
		err = json.Unmarshal(message, &msgData)
		if err != nil {
			continue
		}

		// Si c'est une demande de conversation
		if msgType, ok := msgData["type"].(string); ok && msgType == "startConversation" {
			targetID := int(msgData["targetId"].(float64))
			// Vérifier/créer une conversation
			conversationID, err := getOrCreateConversation(client.ID, targetID)
			if err != nil {
				errMsg, _ := json.Marshal(map[string]string{"error": "Impossible de créer la conversation"})
				client.Conn.WriteMessage(websocket.TextMessage, errMsg)
				continue
			}

			// Envoyer l'historique des messages
			sendConversationHistory(client.Conn, conversationID)
			continue
		}

		// Si c'est un message à envoyer
		if msgType, ok := msgData["type"].(string); ok && msgType == "message" {
			var msg struct {
				ConversationID int    `json:"conversationId"`
				Content        string `json:"content"`
			}
			err = json.Unmarshal(message, &msg)
			if err != nil {
				continue
			}

			// Sauvegarder le message
			newMsg := Message{
				Content:   msg.Content,
				SenderID:  client.ID,
				Timestamp: time.Now(),
			}
			savedMsg, err := saveMessageToDB(newMsg, msg.ConversationID)
			if err != nil {
				continue
			}

			// Envoyer à tous les participants
			privateMsg <- PrivateMessage{
				ConversationID: msg.ConversationID,
				Message:        savedMsg,
			}
		}
	}

	// Supprime le client à la déconnexion
	mutex.Lock()
	delete(clients, client)
	mutex.Unlock()
	broadcast <- struct{}{} // Signale une mise à jour
}

// Fonction pour vérifier ou créer une conversation
func getOrCreateConversation(user1ID, user2ID int) (int, error) {
	// S'assurer que user1ID < user2ID pour la cohérence
	if user1ID > user2ID {
		user1ID, user2ID = user2ID, user1ID
	}

	database := db.SetupDatabase()
	defer database.Close()

	// Vérifier si la conversation existe déjà
	var conversationID int
	err := database.QueryRow(
		"SELECT id FROM conversations WHERE (user1_id = ? AND user2_id = ?)",
		user1ID, user2ID,
	).Scan(&conversationID)

	if err == nil {
		// Conversation trouvée
		return conversationID, nil
	}

	// Créer une nouvelle conversation
	res, err := database.Exec(
		"INSERT INTO conversations (user1_id, user2_id, created_at) VALUES (?, ?, ?)",
		user1ID, user2ID, time.Now(),
	)
	if err != nil {
		return 0, fmt.Errorf("impossible de créer la conversation: %v", err)
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("impossible de récupérer l'ID de conversation: %v", err)
	}

	return int(id), nil
}

// Envoie l'historique des messages d'une conversation
func sendConversationHistory(conn *websocket.Conn, conversationID int) {
	database := db.SetupDatabase()
	defer database.Close()
	rows, err := database.Query(
		"SELECT id, content, sender_id, sent_at FROM messages WHERE conversation_id = ? ORDER BY sent_at ASC",
		conversationID,
	)
	if err != nil {
		return
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		err := rows.Scan(&msg.ID, &msg.Content, &msg.SenderID, &msg.Timestamp)
		if err != nil {
			continue
		}
		messages = append(messages, msg)
	}

	historyJSON, err := json.Marshal(map[string]interface{}{
		"type":           "history",
		"conversationId": conversationID,
		"messages":       messages,
	})
	if err != nil {
		return
	}

	conn.WriteMessage(websocket.TextMessage, historyJSON)
}

// Sauvegarde un message dans la base de données
func saveMessageToDB(msg Message, conversationID int) (Message, error) {
	database := db.SetupDatabase()
	defer database.Close()
	res, err := database.Exec(
		"INSERT INTO messages (conversation_id, content, sender_id, sent_at) VALUES (?, ?, ?, ?)",
		conversationID, msg.Content, msg.SenderID, msg.Timestamp,
	)
	if err != nil {
		return msg, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return msg, err
	}

	msg.ID = int(id)
	return msg, nil
}

// Diffuse les messages privés aux utilisateurs concernés
func handlePrivateMessages() {
	database := db.SetupDatabase()
	defer database.Close()
	for msg := range privateMsg {
		// Récupérer les IDs des utilisateurs de cette conversation
		var user1ID, user2ID int
		err := database.QueryRow("SELECT user1_id, user2_id FROM conversations WHERE id = ?", msg.ConversationID).Scan(&user1ID, &user2ID)
		if err != nil {
			continue
		}

		// Convertir le message en JSON
		msgJSON, err := json.Marshal(map[string]interface{}{
			"type":           "message",
			"conversationId": msg.ConversationID,
			"message":        msg.Message,
		})
		if err != nil {
			continue
		}

		// Envoyer à tous les clients concernés
		mutex.Lock()
		for client := range clients {
			if client.ID == user1ID || client.ID == user2ID {
				err := client.Conn.WriteMessage(websocket.TextMessage, msgJSON)
				if err != nil {
					client.Conn.Close()
					delete(clients, client)
				}
			}
		}
		mutex.Unlock()
	}
}

// Boucle de diffusion des utilisateurs (inchangée)
func broadcastUsers() {
	for {
		<-broadcast // Attend une mise à jour
		mutex.Lock()
		var users []db.User
		for client := range clients {
			users = append(users, db.User{ID: client.ID, Username: client.Username})
		}
		fmt.Println(users)
		mutex.Unlock()
		userListJSON, err := json.Marshal(users)
		if err != nil {
			fmt.Println("Erreur d'encodage JSON:", err)
			continue
		}
		// Envoie le JSON à tous les clients
		mutex.Lock()
		for client := range clients {
			err := client.Conn.WriteMessage(websocket.TextMessage, userListJSON)
			if err != nil {
				client.Conn.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}
