package db

import (
	"net/http"
)

func DeleteComment(w http.ResponseWriter, r *http.Request) {
	// Code to delete comment
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

		// Delete comment from the database
		deleteComment := `
		DELETE FROM comments WHERE id = ?`
		_, err = tx.Exec(deleteComment, id)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			CommunicationMessage(w, "Error deleting comment", true)
			return
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			CommunicationMessage(w, "Error committing transaction", true)
			return
		}

		CommunicationMessage(w, "Comment deleted successfully", false)

	} else {
		CommunicationMessage(w, "Invalid request method", true)
	}
}
