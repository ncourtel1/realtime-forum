package db

import (
	"encoding/json"
	"net/http"
	"time"
)

// Structure pour un post
type Post struct {
	ID           int       `json:"Id"`
	Title        string    `json:"Title"`
	Content      string    `json:"Content"`
	CreatedAt    time.Time `json:"Created_at"`
	Category     int       `json:"Category"`
	CategoryName string    `json:"CategoryName"`
	UserID       int       `json:"User_id"`
	Username     string    `json:"Username"`
}

// Lire tous les posts
func ReadPost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		CommunicationMessage(w, "Method not allowed", true)
		return
	}

	database := SetupDatabase()
	defer database.Close()

	query := `
		SELECT p.id, p.title, p.content, p.created_at, 
			   p.category AS category_id, c.name AS category_name, 
			   p.user_id, u.username
		FROM posts p
		JOIN users u ON p.user_id = u.id
		JOIN categories c ON p.category = c.id
		ORDER BY p.created_at DESC
	`

	// Exécuter la requête SQL
	rows, err := database.Query(query)
	if err != nil {
		CommunicationMessage(w, "Cant fetch data", true)
		return
	}
	defer rows.Close()

	// Stocker les posts
	var posts []Post
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt, &post.Category, &post.CategoryName, &post.UserID, &post.Username)
		if err != nil {
			CommunicationMessage(w, "Cant Scan data", true)
			return
		}
		posts = append(posts, post)
	}

	// Vérifier si aucun post n'existe
	if len(posts) == 0 {
		CommunicationMessage(w, "No content", true)
		return
	}

	// Convertir en JSON et envoyer
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
