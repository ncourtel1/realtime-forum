package db

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CreateServer creates a new user in the database
func CreateUser(w http.ResponseWriter, r *http.Request) {
	var comm Communication

	if r.Method == http.MethodPost {
		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			comm = Communication{Message: "cant decode user", Error: true}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(comm)
		}

		fmt.Println(user)

		db := SetupDatabase()
		defer db.Close()

		// Start a transaction
		tx, err := db.Begin()
		if err != nil {
			comm = Communication{Message: "Error starting transaction", Error: true}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(comm)
		}

		// Insert user into the database
		insertUser := `
		INSERT INTO users (username, password, email, age, gender, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)`
		_, err = tx.Exec(insertUser, user.Username, user.Password, user.Email, user.Age, user.Gender, user.FirstName, user.LastName)
		if err != nil {
			tx.Rollback() // Rollback the transaction if there is an error
			comm = Communication{Message: "Error inserting user", Error: true}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(comm)
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			comm = Communication{Message: "Error committing transaction", Error: true}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(comm)
		}

		comm = Communication{Message: "User registered", Error: false}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(comm)

	} else {
		comm = Communication{Message: "Invalid Request Method", Error: true}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(comm)
	}
}
