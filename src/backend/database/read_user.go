package db

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"
)

func ReadUser(w http.ResponseWriter, r *http.Request) {
	var comm Communication
	if r.Method != http.MethodPost {
		comm = Communication{Message: "Method not allowed", Error: true}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(comm)
	}

	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		comm = Communication{Message: "cant decode user", Error: true}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(comm)
	}

	database := SetupDatabase()
	defer database.Close()

	var query string
	var param string

	if isEmail(user.Username) {
		query = "SELECT username, email, password FROM users WHERE email = ?"
		param = user.Username
	} else { // Sinon, on cherche par username
		query = "SELECT username, email, password FROM users WHERE username = ?"
		param = user.Username
	}

	var dbUser User
	err := database.QueryRow(query, param).Scan(&dbUser.Username, &dbUser.Email, &dbUser.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			comm = Communication{Message: "Cant find user", Error: true}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(comm)
		}
		comm = Communication{Message: "Internal error", Error: true}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(comm)
	}

	// Vérifier le mot de passe (pas encore hashé)
	if user.Password != dbUser.Password {
		comm = Communication{Message: "Incorrect Password", Error: true}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(comm)
	}

	// Réponse en JSON
	response := Communication{Message: "Connected", Error: false}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

}

func isEmail(input string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(input)
}
