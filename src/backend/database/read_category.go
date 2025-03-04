package db

import (
	"encoding/json"
	"net/http"
)

type Category struct {
	Name string `json:"name"`
	ID   int    `json:"id"`
}

func ReadCategories(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		CommunicationMessage(w, "Method not allowed", true)
		return
	}

	database := SetupDatabase()
	defer database.Close()

	rows, err := database.Query("SELECT id, name FROM categories ORDER BY name DESC")
	if err != nil {
		CommunicationMessage(w, "Cant fetch data", true)
		return
	}
	defer rows.Close()

	var categories []Category
	for rows.Next() {
		var category Category
		err := rows.Scan(&category.ID, &category.Name)
		if err != nil {
			CommunicationMessage(w, "Cant Scan data", true)
			return
		}
		categories = append(categories, category)
	}

	if len(categories) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}
