package db

import (
	"net/http"
)

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	// Code to delete user
	if r.Method == http.MethodPost {
		id := r.FormValue("id")

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			CommunicationMessage(w, "Error Starting Transaction", true)
		}

		// Delete user from the database
		deleteUser := `
		DELETE FROM users WHERE id = ?`
		_, err = tx.Exec(deleteUser, id)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			CommunicationMessage(w, "Error deleting user", true)
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			CommunicationMessage(w, "Error committing transaction", true)
		}
	} else {
		CommunicationMessage(w, "Invalid request method", true)
	}
}
