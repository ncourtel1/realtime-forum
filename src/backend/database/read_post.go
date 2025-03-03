package db

import (
	"encoding/json"
	"net/http"
)

// Structure pour un post
type Post struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
	Category  string `json:"category"`
	UserID    int    `json:"user_id"`
}

// Lire tous les posts
func ReadPost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		CommunicationMessage(w, "Method not allowed", true)
	}

	database := SetupDatabase()
	defer database.Close()

	// Exécuter la requête SQL
	rows, err := database.Query("SELECT id, title, content, created_at, category, user_id FROM posts ORDER BY created_at DESC")
	if err != nil {
		CommunicationMessage(w, "Cant fetch data", true)
	}
	defer rows.Close()

	// Stocker les posts
	var posts []Post
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt, &post.Category, &post.UserID)
		if err != nil {
			CommunicationMessage(w, "Cant Scan data", true)
		}
		posts = append(posts, post)
	}

	// Vérifier si aucun post n'existe
	if len(posts) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Convertir en JSON et envoyer
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
