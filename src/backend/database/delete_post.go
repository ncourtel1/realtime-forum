package db

import (
	"net/http"
)

func DeletePost(w http.ResponseWriter, r *http.Request) {
	// Code to delete post
	if r.Method == http.MethodPost {
		id := r.FormValue("id")

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			CommunicationMessage(w, "Error Starting Transaction", true)
			return
		}

		// Delete post from the database
		deletePost := `
		DELETE FROM posts WHERE id = ?`
		_, err = tx.Exec(deletePost, id)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			CommunicationMessage(w, "Error dweleting comment", true)
			return
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			CommunicationMessage(w, "Error committing transaction", true)
			return
		}

		CommunicationMessage(w, "Post deleted successfully", false)

	} else {
		CommunicationMessage(w, "Invalid request method", true)
	}
}
