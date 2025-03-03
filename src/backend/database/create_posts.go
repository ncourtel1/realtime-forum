package db

import "net/http"

func CreatePosts(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		id := r.FormValue("id")
		title := r.FormValue("title")
		content := r.FormValue("content")
		created_at := r.FormValue("created_at")
		category := r.FormValue("category")
		userID := r.FormValue("user_id")

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			CommunicationMessage(w, "Error startting transaction", true)
		}

		// Insert post into the database
		insertPost := `
		INSERT INTO posts (id, title, content, created_at, category, user_id) VALUES (?, ?, ?, ?, ?, ?)`
		_, err = tx.Exec(insertPost, id, title, content, created_at, category, userID)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			CommunicationMessage(w, "Error inserting post", true)
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			CommunicationMessage(w, "Error committing transaction", true)
		}
	} else {
		CommunicationMessage(w, "Invalid Request Metod", true)
	}
}
