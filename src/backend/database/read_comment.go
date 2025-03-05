package db

import (
	"encoding/json"
	"net/http"
)

type Comment struct {
	ID        int    `json:"Id"`
	Content   string `json:"Content"`
	CreatedAt string `json:"Created_at"`
	PostID    int    `json:"Post_id"`
	UserID    int    `json:"User_id"`
	Username  string `json:"Username"`
}

func ReadComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		CommunicationMessage(w, "Method not allowed", true)
		return
	}

	database := SetupDatabase()
	defer database.Close()

	query := `
		SELECT c.content, c.created_at, c.post_id, c.user_id, u.username
		FROM comments c
		JOIN users u ON c.user_id = u.id
		ORDER BY c.created_at DESC
	`

	rows, err := database.Query(query)
	if err != nil {
		CommunicationMessage(w, "Cant fetch data", true)
		return
	}
	defer rows.Close()

	var comments []Comment
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.Content, &comment.CreatedAt, &comment.PostID, &comment.UserID, &comment.Username)
		if err != nil {
			CommunicationMessage(w, "Cant Scan data", true)
		}
		comments = append(comments, comment)
	}

	if len(comments) == 0 {
		CommunicationMessage(w, "No content", true)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}
