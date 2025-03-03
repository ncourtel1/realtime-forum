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
			http.Error(w, "Error starting transaction", http.StatusInternalServerError)
			return
		}

		// Insert category into the database
		insertCategory := `
		INSERT INTO category (id, name, description, created_at, updated_at) VALUES (?, ?)`
		_, err = tx.Exec(insertCategory, id, name)
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
