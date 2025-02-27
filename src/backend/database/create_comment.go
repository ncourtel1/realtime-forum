package db

import "net/http"

func CreateComments(w http.ResponseWriter, r *http.Request) {
	// Code to create comments
	if r.Method == http.MethodPost {
		id := r.FormValue("id")
		title := r.FormValue("title")
		content := r.FormValue("content")
		created_at := r.FormValue("created_at")
		postID := r.FormValue("post_id")
		userID := r.FormValue("user_id")

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			http.Error(w, "Error starting transaction", http.StatusInternalServerError)
			return
		}

		// Insert comment into the database
		insertComment := `
		INSERT INTO comments (id, title, content, created_at, post_id, user_id) VALUES (?, ?, ?, ?, ?, ?)`
		_, err = tx.Exec(insertComment, id, title, content, created_at, postID, userID)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			http.Error(w, "Error inserting comment", http.StatusInternalServerError)
			return
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			http.Error(w, "Error committing transaction", http.StatusInternalServerError)
			return
		}
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}
