package db

import (
	"encoding/json"
	"net/http"
	"time"
)

func CreateComments(w http.ResponseWriter, r *http.Request) {
	// Code to create comments
	if r.Method == http.MethodPost {
		session := GetCookie(w, r)
		if session.UserID == 0 {
			CommunicationMessage(w, "No session found", true)
			return
		}

		var comment Comment
		if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
			CommunicationMessage(w, "Invalid Data", true)
			return
		}

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			CommunicationMessage(w, "Error startting transaction", true)
			return
		}

		// Insert comment into the database
		insertComment := `
		INSERT INTO comments (content, created_at, post_id, user_id) VALUES (?, ?, ?, ?)`
		_, err = tx.Exec(insertComment, comment.Content, time.Now(), comment.PostID, session.UserID)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			CommunicationMessage(w, "Error inserting comment", true)
			return
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			CommunicationMessage(w, "Error committing transaction", true)
			return
		}

		CommunicationMessage(w, "Comment Created Successfully", false)

	} else {
		CommunicationMessage(w, "Invalid Request Method", true)
	}
}
