package db

import (
	"encoding/json"
	"net/http"
)

type Comment struct {
	ID        int    `json:"id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
	PostID    int    `json:"post_id"`
	UserID    int    `json:"user_id"`
}

func ReadComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		CommunicationMessage(w, "Method not allowed", true)
	}

	database := SetupDatabase()
	defer database.Close()

	rows, err := database.Query("SELECT id, content, created_at, post_id, user_id FROM comments ORDER BY createsd_at DESC")
	if err != nil {
		CommunicationMessage(w, "Cant fetch data", true)
	}
	defer rows.Close()

	var comments []Comment
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.ID, &comment.Content, &comment.CreatedAt, &comment.PostID, &comment.UserID)
		if err != nil {
			CommunicationMessage(w, "Cant Scan data", true)
		}
		comments = append(comments, comment)
	}

	if len(comments) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}
