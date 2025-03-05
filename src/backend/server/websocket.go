package server

import (
	"db"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Paramètres des WebSockets
const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

var (
	newline  = []byte{'\n'}
	space    = []byte{' '}
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true }, // Permet les connexions de tous les domaines
	}
)

// Hub représente une conversation WebSocket entre utilisateurs.
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
}

// Client représente une connexion WebSocket.
type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

// Gestion des différents hubs (conversations)
var (
	hubs      = make(map[int]*Hub)
	hubsMutex sync.Mutex
)

// Crée un nouveau Hub (conversation)
func newHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Gère la boucle principale du Hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	database := db.SetupDatabase()
	defer database.Close()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Erreur WebSocket : %v", err)
			}
			break
		}

		// Décoder le message reçu (qui doit être un JSON)
		type IncomingMessage struct {
			ConversationID int    `json:"conversation_id"`
			SenderID       int    `json:"sender_id"`
			Content        string `json:"content"`
		}

		var msg IncomingMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Println("Erreur décodage JSON :", err)
			continue
		}

		// Enregistrer le message dans la base de données
		if err := db.SaveMessage(database /*msg.ConversationID*/, 12, msg.SenderID, msg.Content); err != nil {
			log.Println("Erreur sauvegarde message :", err)
			continue
		}

		// Diffuser le message aux autres utilisateurs de la conversation
		c.hub.broadcast <- message
	}
}

// Gère l'écriture des messages vers un client WebSocket.
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Gère la connexion WebSocket d'une conversation spécifique.
func ServeWs(w http.ResponseWriter, r *http.Request) {
	// Mettre à niveau la connexion HTTP en WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Erreur WebSocket :", err)
		return
	}

	// Lire le premier message envoyé par le client (JSON contenant l'ID de la conversation)
	_, message, err := conn.ReadMessage()
	if err != nil {
		log.Println("Erreur lecture JSON WebSocket :", err)
		conn.Close()
		return
	}

	fmt.Println(string(message))

	// Définir une structure pour décoder le JSON
	type ConnRequest struct {
		ConversationID int `json:"conversation_id"`
	}

	var req ConnRequest
	if err := json.Unmarshal(message, &req); err != nil {
		log.Println("Erreur décodage JSON :", err)
		conn.Close()
		return
	}

	fmt.Println(req)

	// Vérifier si l'ID de conversation est fourni
	if req.ConversationID == 0 {
		log.Println("Aucun ID de conversation fourni")
		conn.Close()
		return
	}

	// Vérifier si le Hub de la conversation existe déjà, sinon le créer
	hubsMutex.Lock()
	hub, exists := hubs[req.ConversationID]
	if !exists {
		hub = newHub()
		hubs[req.ConversationID] = hub
		go hub.Run() // Lancer le hub en arrière-plan
	}
	hubsMutex.Unlock()

	// Créer un nouveau client WebSocket
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

	// Lancer les goroutines pour la lecture et l'écriture
	go client.WritePump()
	go client.ReadPump()
}
