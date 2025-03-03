package server

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Client WebSocket
type Client struct {
	conn   *websocket.Conn
	userID int
	send   chan []byte
}

var clients = make(map[int]*Client) // Associe un utilisateur à un WebSocket

// Fonction WebSocket
func serveWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Erreur WebSocket:", err)
		return
	}
	defer conn.Close()

	// Lire l'ID utilisateur (dans une vraie app, on vérifierait un token)
	var userID int
	err = conn.ReadJSON(&userID)
	if err != nil {
		log.Println("Erreur lecture ID utilisateur:", err)
		return
	}

	client := &Client{conn: conn, userID: userID, send: make(chan []byte, 256)}
	clients[userID] = client

	// Lire les messages
	for {
		var msg struct {
			To      int    `json:"to"`
			Message string `json:"message"`
		}

		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Erreur réception message:", err)
			break
		}

		// Vérifier si le destinataire est connecté
		if dest, ok := clients[msg.To]; ok {
			dest.conn.WriteJSON(msg)
		}
	}
}
