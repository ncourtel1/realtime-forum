package db

import (
	"encoding/json"
	"net/http"
)

// CreateServer creates a new user in the database
func CreateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			CommunicationMessage(w, "Cant decode user", true)
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

		// Insert user into the database
		insertUser := `
		INSERT INTO users (username, password, email, age, gender, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)`
		_, err = tx.Exec(insertUser, user.Username, user.Password, user.Email, user.Age, user.Gender, user.FirstName, user.LastName)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			CommunicationMessage(w, "Error inserting user", true)
			return
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			CommunicationMessage(w, "Error committing transaction", true)
			return
		}

		response := map[string]string{"message": "User registered"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)

	} else {
		CommunicationMessage(w, "Invalid Request Method", true)
	}
}
