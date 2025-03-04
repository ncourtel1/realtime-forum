package db

import (
	"encoding/json"
	"net/http"
	"time"
)

func CreatePosts(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		session := GetCookie(w, r)
		if session.UserID == 0 {
			CommunicationMessage(w, "No session found", true)
			return
		}

		var post Post
		if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
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

		// Insert post into the database
		insertPost := `
		INSERT INTO posts (title, content, created_at, category, user_id) VALUES (?, ?, ?, ?, ?)`
		_, err = tx.Exec(insertPost, post.Title, post.Content, time.Now(), post.Category, session.UserID)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			CommunicationMessage(w, "Error inserting post", true)
			return
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			CommunicationMessage(w, "Error committing transaction", true)
			return
		}

		CommunicationMessage(w, "Post Created Successfully", false)

	} else {
		CommunicationMessage(w, "Invalid Request Method", true)
	}
}
