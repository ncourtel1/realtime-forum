package db

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func CommunicationMessage(w http.ResponseWriter, message string, err bool) {
	comm := Communication{Message: message, Error: err}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comm)
}

// SaveMessage enregistre un message dans la base de données
func SaveMessage(db *sql.DB, conversationID int, senderID int, content string) error {
	query := `INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)`
	_, err := db.Exec(query, conversationID, senderID, content)
	if err != nil {
		log.Println("Erreur enregistrement message :", err)
	}
	return err
}

// ReadMessages récupère les messages d'une conversation
func ReadMessages(w http.ResponseWriter, r *http.Request) {
	// Récupérer l'ID de la conversation depuis la requête
	conversationID := r.URL.Query().Get("conversation_id")
	if conversationID == "" {
		http.Error(w, "Missing conversation ID", http.StatusBadRequest)
		return
	}

	db := SetupDatabase()
	defer db.Close()

	// Requête SQL pour récupérer les messages
	rows, err := db.Query("SELECT id, conversation_id, sender_id, content, sent_at FROM messages WHERE conversation_id = ?", conversationID)
	if err != nil {
		http.Error(w, "Error retrieving messages", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		if err := rows.Scan(&msg.ID, &msg.ConversationID, &msg.SenderID, &msg.Content, &msg.SentAt); err != nil {
			http.Error(w, "Error scanning messages", http.StatusInternalServerError)
			return
		}
		messages = append(messages, msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}
