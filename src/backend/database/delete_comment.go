package db

import "net/http"

func DeleteComment(w http.ResponseWriter, r *http.Request) {
	// Code to delete comment
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

		// Delete comment from the database
		deleteComment := `
		DELETE FROM comments WHERE id = ?`
		_, err = tx.Exec(deleteComment, id)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			http.Error(w, "Error deleting comment", http.StatusInternalServerError)
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
