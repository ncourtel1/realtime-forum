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
			http.Error(w, "Invalid data", http.StatusBadRequest)
			return
		}

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			http.Error(w, "Error starting transaction", http.StatusInternalServerError)
			return
		}

		// Insert category into the database
		insertCategory := `
		INSERT INTO categories (name) VALUES (?)`
		_, err = tx.Exec(insertCategory, category.Name)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			http.Error(w, "Error inserting category", http.StatusInternalServerError)
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
