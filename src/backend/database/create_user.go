package db

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Communication struct {
	Message string `json:"Message"`
	Error   bool   `json:"Error"`
}

// CreateServer creates a new user in the database
func CreateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, "Invalid data", http.StatusBadRequest)
			fmt.Println(err)
			return
		}

		fmt.Println(user)

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
		_, err = tx.Exec(insertUser, user.Username, user.Password, user.Email, user.Age, user.Gender, user.FirstName, user.LastName)
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

		response := map[string]string{"message": "User registered"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)

	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}
