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
			http.Error(w, "Error starting transaction", http.StatusInternalServerError)
			return
		}

		// Insert post into the database
		insertPost := `
		INSERT INTO posts (id, title, content, created_at, category, user_id) VALUES (?, ?, ?, ?, ?, ?)`
		_, err = tx.Exec(insertPost, id, title, content, created_at, category, userID)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			http.Error(w, "Error inserting post", http.StatusInternalServerError)
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
