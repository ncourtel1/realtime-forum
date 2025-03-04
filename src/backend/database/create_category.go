package db

import (
	"encoding/json"
	"net/http"
)

func CreateCategory(w http.ResponseWriter, r *http.Request) {
	// Code to create category
	if r.Method == http.MethodPost {
		var category Category
		if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
			CommunicationMessage(w, "Invalid Data", true)
			return
		}

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			CommunicationMessage(w, "Error starting transaction", true)
			return
		}

		// Insert category into the database
		insertCategory := `
		INSERT INTO categories (name) VALUES (?)`
		_, err = tx.Exec(insertCategory, category.Name)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			CommunicationMessage(w, "Error inserting category", true)
			return
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			CommunicationMessage(w, "Error committing transaction", true)
			return
		}
		CommunicationMessage(w, "Category successfully created", false)
	} else {
		CommunicationMessage(w, "Invalid Request Method", true)
	}
}
