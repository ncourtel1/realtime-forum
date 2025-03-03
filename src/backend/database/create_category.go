package db

import "net/http"

func CreateCategory(w http.ResponseWriter, r *http.Request) {
	// Code to create category
	if r.Method == http.MethodPost {
		id := r.FormValue("id")
		name := r.FormValue("name")

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			CommunicationMessage(w, "Error starting transaction", true)
		}

		// Insert category into the database
		insertCategory := `
		INSERT INTO category (id, name, description, created_at, updated_at) VALUES (?, ?)`
		_, err = tx.Exec(insertCategory, id, name)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			CommunicationMessage(w, "Error inserting category", true)
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			CommunicationMessage(w, "Error committing transaction", true)
		}
	} else {
		CommunicationMessage(w, "Invalid Request Metod", true)
	}
}
