package db

import "net/http"

func DeletePost(w http.ResponseWriter, r *http.Request) {
	// Code to delete post
	if r.Method == http.MethodPost {
		id := r.FormValue("id")

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			http.Error(w, "Error starting transaction", http.StatusInternalServerError)
			return
		}

		// Delete post from the database
		deletePost := `
		DELETE FROM posts WHERE id = ?`
		_, err = tx.Exec(deletePost, id)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			http.Error(w, "Error deleting post", http.StatusInternalServerError)
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
