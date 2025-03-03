package db

import (
	"net/http"
)

type Communication struct {
	Message string `json:"Message"`
	Error   bool   `json:"Error"`
}

// CreateServer creates a new user in the database
func CreateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		username := r.FormValue("username")
		password := r.FormValue("password")
		email := r.FormValue("email")
		age := r.FormValue("age")
		gender := r.FormValue("gender")
		firstName := r.FormValue("first_name")
		lastName := r.FormValue("last_name")

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			http.Error(w, "Error starting transaction", http.StatusInternalServerError)
			return
		}

		// Insert user into the database
		insertUser := `
		INSERT INTO users (username, password, email, age, gender, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)`
		_, err = tx.Exec(insertUser, username, password, email, age, gender, firstName, lastName)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			http.Error(w, "Error inserting user", http.StatusInternalServerError)
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
