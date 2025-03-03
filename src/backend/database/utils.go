package db

import (
	"encoding/json"
	"net/http"
)

func CommunicationMessage(w http.ResponseWriter, message string, err bool) {
	comm := Communication{Message: message, Error: err}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comm)
}
