package db

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"
)

func ReadUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		CommunicationMessage(w, "Method not allowed", true)
		return
	}

	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		CommunicationMessage(w, "Cant fetch data", true)
		return
	}

	database := SetupDatabase()
	defer database.Close()

	var query string
	var param string

	if isEmail(user.Username) {
		query = "SELECT id, username, email, password FROM users WHERE email = ?"
		param = user.Username
	} else { // Sinon, on cherche par username
		query = "SELECT id, username, email, password FROM users WHERE username = ?"
		param = user.Username
	}

	var dbUser User
	err := database.QueryRow(query, param).Scan(&dbUser.ID, &dbUser.Username, &dbUser.Email, &dbUser.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			CommunicationMessage(w, "Cant find user", true)
			return
		}
		CommunicationMessage(w, "Internal Error", true)
		return
	}

	// Vérifier le mot de passe (pas encore hashé)
	if user.Password != dbUser.Password {
		CommunicationMessage(w, "Incorrect Password", true)
		return
	}

	CreateSession(w, dbUser.ID, dbUser.Username)
	// Réponse en JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(dbUser); err != nil {
		CommunicationMessage(w, "Error encoding JSON response", true)
		return
	}

}

func isEmail(input string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(input)
}
